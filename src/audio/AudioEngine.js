import Meyda from 'meyda';

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.source = null;
    this.audioElement = null;
    this.analyzer = null;
    this.micGain = null;
    this.systemAudioStream = null;
    
    // Smoothing factor for features
    this.smoothing = 0.8;
    
    // Current raw features
    this.currentFeatures = {
      rms: 0,
      spectralCentroid: 0,
      zcr: 0,
      energy: 0,
      brightness: 0,
      energyDelta: 0,
      energyTrend: 'steady',
    };

    // Buffered history for trend detection
    this.history = {
      rms: new Array(100).fill(0),
      energy: new Array(100).fill(0),
      spectralCentroid: new Array(100).fill(0),
    };

    this.isPlaying = false;
    this.onStateChange = null;
  }

  initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  async initMic() {
    this.initContext();
    this.cleanup();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          latency: 0
        }
      });
      
      await this.audioContext.resume();
      this.source = this.audioContext.createMediaStreamSource(stream);
      
      this.micGain = this.audioContext.createGain();
      this.micGain.gain.value = 0;
      this.source.connect(this.micGain);
      this.micGain.connect(this.audioContext.destination);

      this.setupMeyda();
      this.isPlaying = true;
      this.notifyState();
    } catch (err) {
      console.error('Mic access denied:', err);
      throw err;
    }
  }

  async initSystemAudio() {
    this.initContext();
    this.cleanup();

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
        }
      });

      stream.getVideoTracks().forEach((t) => t.stop());

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('NO_AUDIO: User did not share audio. Tell them to check "Share audio".');
      }

      await this.audioContext.resume();
      this.systemAudioStream = stream;
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.setupMeyda();
      this.isPlaying = true;
      this.notifyState();
    } catch (err) {
      console.error('System audio capture failed:', err);
      throw err;
    }
  }

  async initFile(fileUrl) {
    this.initContext();
    this.cleanup();

    this.audioElement = new Audio(fileUrl);
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.loop = true;
    
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    this.source.connect(this.audioContext.destination);

    await this.audioContext.resume();
    this.audioElement.play();
    this.setupMeyda();
    this.isPlaying = true;
    this.notifyState();
  }

  setupMeyda() {
    if (!this.source || !this.audioContext) return;

    this.analyzer = Meyda.createMeydaAnalyzer({
      audioContext: this.audioContext,
      source: this.source,
      bufferSize: 1024,
      featureExtractors: ['rms', 'spectralCentroid', 'zcr'],
      callback: (features) => {
        this.processFeatures(features);
      }
    });
    this.analyzer.start();
  }

  processFeatures(features) {
    if (!features) return;

    this.currentFeatures.rms = this.lerp(this.currentFeatures.rms, features.rms, 1 - this.smoothing);
    this.currentFeatures.spectralCentroid = this.lerp(this.currentFeatures.spectralCentroid, features.spectralCentroid || 0, 1 - this.smoothing);
    this.currentFeatures.zcr = this.lerp(this.currentFeatures.zcr, features.zcr, 1 - this.smoothing);
    this.currentFeatures.energy = this.currentFeatures.rms;

    const maxCentroid = Math.max(...this.history.spectralCentroid) || 1;
    this.currentFeatures.brightness = this.currentFeatures.spectralCentroid / maxCentroid;

    const recentAvg = this.history.energy.slice(-10).reduce((a, b) => a + b, 0) / 10 || 0;
    this.currentFeatures.energyDelta = Math.max(0, this.currentFeatures.energy - recentAvg);

    this.history.rms.shift();
    this.history.rms.push(this.currentFeatures.rms);
    this.history.energy.shift();
    this.history.energy.push(this.currentFeatures.energy);
    this.history.spectralCentroid.shift();
    this.history.spectralCentroid.push(this.currentFeatures.spectralCentroid);

    const recentEnergy = this.history.energy.slice(-30);
    const first = recentEnergy.slice(0, 15).reduce((a, b) => a + b, 0) / 15;
    const last = recentEnergy.slice(15).reduce((a, b) => a + b, 0) / 15;
    this.currentFeatures.energyTrend = last > first * 1.15 ? 'rising' : last < first * 0.85 ? 'falling' : 'steady';
  }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  getFeatures() {
    return this.currentFeatures;
  }

  getHistory() {
    return this.history;
  }

  togglePlay() {
    if (this.audioElement) {
      if (this.isPlaying) {
        this.audioElement.pause();
        this.analyzer?.stop();
        this.isPlaying = false;
      } else {
        this.audioElement.play();
        this.analyzer?.start();
        this.isPlaying = true;
      }
      this.notifyState();
    } else if (this.source && this.source.mediaStream) {
      if (this.isPlaying) {
        this.analyzer?.stop();
        this.isPlaying = false;
      } else {
        this.initContext();
        this.analyzer?.start();
        this.isPlaying = true;
      }
      this.notifyState();
    }
  }

  cleanup() {
    if (this.analyzer) {
      this.analyzer.stop();
      this.analyzer = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.micGain) {
      this.micGain.disconnect();
      this.micGain = null;
    }
    if (this.systemAudioStream) {
      this.systemAudioStream.getTracks().forEach((track) => track.stop());
      this.systemAudioStream = null;
    }
    this.isPlaying = false;
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({ isPlaying: this.isPlaying });
    }
  }
}

export const audioEngine = new AudioEngine();
