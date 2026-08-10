// Web Audio API Binaural Beat Synthesizer for Flow State & Focus

class BinauralBeatEngine {
  constructor() {
    this.ctx = null;
    this.oscLeft = null;
    this.oscRight = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.currentMode = null; // 'gamma', 'theta', 'white_noise'
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  /**
   * Start Binaural Beats
   * @param {string} mode - 'gamma' (40Hz Core Formation Focus), 'theta' (4Hz Sovereign Flow State), 'rain' (White noise)
   */
  start(mode = 'gamma') {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop(); // Stop previous oscillators if playing

    this.currentMode = mode;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (mode === 'gamma') {
      // 40Hz Gamma Focus: Base 200Hz left, 240Hz right
      const merger = this.ctx.createChannelMerger(2);

      this.oscLeft = this.ctx.createOscillator();
      this.oscLeft.type = 'sine';
      this.oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);
      this.oscLeft.connect(merger, 0, 0); // Left channel

      this.oscRight = this.ctx.createOscillator();
      this.oscRight.type = 'sine';
      this.oscRight.frequency.setValueAtTime(240, this.ctx.currentTime);
      this.oscRight.connect(merger, 0, 1); // Right channel

      merger.connect(this.gainNode);
      this.oscLeft.start();
      this.oscRight.start();
    } else if (mode === 'theta') {
      // 4Hz Theta Flow State: Base 136.1Hz (Om Frequency) left, 140.1Hz right
      const merger = this.ctx.createChannelMerger(2);

      this.oscLeft = this.ctx.createOscillator();
      this.oscLeft.type = 'sine';
      this.oscLeft.frequency.setValueAtTime(136.1, this.ctx.currentTime);
      this.oscLeft.connect(merger, 0, 0);

      this.oscRight = this.ctx.createOscillator();
      this.oscRight.type = 'sine';
      this.oscRight.frequency.setValueAtTime(140.1, this.ctx.currentTime);
      this.oscRight.connect(merger, 0, 1);

      merger.connect(this.gainNode);
      this.oscLeft.start();
      this.oscRight.start();
    }

    this.isPlaying = true;
  }

  stop() {
    if (this.oscLeft) {
      try { this.oscLeft.stop(); } catch (e) {}
      this.oscLeft.disconnect();
      this.oscLeft = null;
    }
    if (this.oscRight) {
      try { this.oscRight.stop(); } catch (e) {}
      this.oscRight.disconnect();
      this.oscRight = null;
    }
    this.isPlaying = false;
  }

  toggle(mode = 'gamma') {
    if (this.isPlaying && this.currentMode === mode) {
      this.stop();
      return false;
    } else {
      this.start(mode);
      return true;
    }
  }
}

export const binauralEngine = new BinauralBeatEngine();
