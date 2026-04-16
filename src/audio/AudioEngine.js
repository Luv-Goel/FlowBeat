import Meyda from 'meyda';

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.source = null;
    this.audioElement = null;
    this.analyzer = null;
    
    // Smoothing factor for features
    this.smoothing = 0.8;
    
    // Current raw features
    this.currentFeatures = {
      rms: 0,
      spectralCentroid: 0,
      zcr: 0,
      energy: 0, // derived smoothed rms
      brightness: 0, // derived smoothed spectralCentroid
    };

    // Buffered history for trend detection
    this.history = {
      rms: new Array(100).fill(0),
      energy: new Array(100).fill(0)
    };

    this.isPlaying = false;
    this.onStateChange = null; // callback for UI updates
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
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.setupMeyda();
      this.isPlaying = true;
      this.notifyState();
    } catch (err) {
      console.error('Mic access denied:', err);
      throw err;
    }
  }

  initFile(fileUrl) {
    this.initContext();
    this.cleanup();

    this.audioElement = new Audio(fileUrl);
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.loop = true;
    
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    this.source.connect(this.audioContext.destination);

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
      featureExtractors: ['rms', 'spectralCentroid', 'zcr', 'energy'],
      callback: (features) => {
        this.processFeatures(features);
      }
    });
    this.analyzer.start();
  }

  processFeatures(features) {
    if (!features) return;

    // Smooth features to prevent jitter
    this.currentFeatures.rms = this.lerp(this.currentFeatures.rms, features.rms, 1 - this.smoothing);
    this.currentFeatures.spectralCentroid = this.lerp(this.currentFeatures.spectralCentroid, features.spectralCentroid || 0, 1 - this.smoothing);
    this.currentFeatures.zcr = this.lerp(this.currentFeatures.zcr, features.zcr, 1 - this.smoothing);
    this.currentFeatures.energy = this.lerp(this.currentFeatures.energy, features.energy, 1 - this.smoothing);
    this.currentFeatures.brightness = this.currentFeatures.spectralCentroid / 1500; // Normalized roughly

    // Update history
    this.history.rms.shift();
    this.history.rms.push(this.currentFeatures.rms);
    
    this.history.energy.shift();
    this.history.energy.push(this.currentFeatures.energy);
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
      // For mic, we can disconnect or just stop analyzer
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
    this.isPlaying = false;
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({ isPlaying: this.isPlaying });
    }
  }
}

export const audioEngine = new AudioEngine();
