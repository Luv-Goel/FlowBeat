class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.audioElement = null;
    this.isPlaying = false;
    this.smoothing = 0.8;
    this.sensitivity = 1.0;

    this.dataArray = null;
    this.bufferLength = 0;

    this.currentFeatures = {
      energy: 0,
      brightness: 0,
      zcr: 0,
      energyDelta: 0,
      energyTrend: 'steady',
    };

    this.history = {
      energy: new Array(120).fill(0),
    };

    this._lastEnergy = 0;
    this._animFrame = null;
  }

  async _initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = this.smoothing;
      this.analyser.connect(this.audioContext.destination);
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
    }
  }

  async initMic() {
    await this._initContext();
    if (this.source) this.source.disconnect();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    this.isPlaying = true;
    this._loop();
  }

  async initFile(file) {
    await this._initContext();
    if (this.source) this.source.disconnect();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    const url = URL.createObjectURL(file);
    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';
    await this.audioContext.resume();
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyser);
    await this.audioElement.play();
    this.isPlaying = true;
    this._loop();
  }

  async initSystemAudio() {
    await this._initContext();
    if (this.source) this.source.disconnect();
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) throw new Error('No audio track in screen capture.');
    const audioStream = new MediaStream(audioTracks);
    this.source = this.audioContext.createMediaStreamSource(audioStream);
    this.source.connect(this.analyser);
    this.isPlaying = true;
    this._loop();
  }

  togglePlay() {
    if (!this.audioElement) return;
    if (this.audioElement.paused) {
      this.audioElement.play();
      this.isPlaying = true;
      this._loop();
    } else {
      this.audioElement.pause();
      this.isPlaying = false;
      cancelAnimationFrame(this._animFrame);
    }
  }

  _loop() {
    this._animFrame = requestAnimationFrame(() => this._loop());
    this.processFeatures();
  }

  processFeatures() {
    if (!this.analyser) return;
    this.analyser.smoothingTimeConstant = this.smoothing;
    this.analyser.getByteFrequencyData(this.dataArray);

    // RMS energy
    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) sum += (this.dataArray[i] / 255) ** 2;
    const rms = Math.sqrt(sum / this.bufferLength) * this.sensitivity;

    // Spectral centroid (brightness)
    let weightedSum = 0, totalAmp = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      weightedSum += i * this.dataArray[i];
      totalAmp += this.dataArray[i];
    }
    const centroid = totalAmp > 0 ? weightedSum / totalAmp / this.bufferLength : 0;

    // Zero-crossing rate
    this.analyser.getByteTimeDomainData(this.dataArray);
    let zcr = 0;
    for (let i = 1; i < this.bufferLength; i++) {
      if ((this.dataArray[i - 1] - 128) * (this.dataArray[i] - 128) < 0) zcr++;
    }

    const energyDelta = rms - this._lastEnergy;
    this._lastEnergy = rms;

    // Rolling 120-frame history (pre-filled so StudioScope never sees empty array)
    this.history.energy.push(rms);
    this.history.energy.shift();

    // Energy trend label
    const recent = this.history.energy.slice(-30);
    const first = recent.slice(0, 15).reduce((a, b) => a + b, 0) / 15;
    const last  = recent.slice(15).reduce((a, b) => a + b, 0) / 15;
    this.currentFeatures.energyTrend =
      last > first * 1.15 ? 'rising' :
      last < first * 0.85 ? 'falling' : 'steady';

    this.currentFeatures.energy      = rms;
    this.currentFeatures.brightness  = centroid;
    this.currentFeatures.zcr         = zcr;
    this.currentFeatures.energyDelta = energyDelta;
  }

  getFeatures() {
    return { ...this.currentFeatures };
  }

  // Expose rolling history for StudioScope
  getHistory() {
    return { energy: [...this.history.energy] };
  }

  getProgress() {
    if (!this.audioElement) return { current: 0, duration: 0, percent: 0 };
    const current  = this.audioElement.currentTime;
    const duration = this.audioElement.duration || 0;
    return { current, duration, percent: duration ? (current / duration) * 100 : 0 };
  }

  seek(percent) {
    if (this.audioElement && this.audioElement.duration) {
      this.audioElement.currentTime = (percent / 100) * this.audioElement.duration;
    }
  }
}

export const audioEngine = new AudioEngine();
