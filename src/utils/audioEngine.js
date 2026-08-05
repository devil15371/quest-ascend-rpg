// Web Audio API Synthesizer for Retro & Sci-Fi RPG Sound Effects
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.1, delay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.error(e);
      }
    }, delay * 1000);
  }

  playHoverSound() {
    if (this.muted) return;
    this.playTone(1200, 'sine', 0.03, 0.03, 0);
  }

  playExpGain() {
    if (this.muted) return;
    this.playTone(523.25, 'triangle', 0.12, 0.15, 0);     // C5
    this.playTone(659.25, 'triangle', 0.12, 0.15, 0.08);  // E5
    this.playTone(783.99, 'sine', 0.25, 0.2, 0.16);       // G5
  }

  playLevelUp() {
    if (this.muted) return;
    const notes = [
      { f: 440, d: 0.1, t: 'square' },    // A4
      { f: 554.37, d: 0.1, t: 'square' }, // C#5
      { f: 659.25, d: 0.1, t: 'square' }, // E5
      { f: 880, d: 0.4, t: 'triangle' }   // A5
    ];
    notes.forEach((n, idx) => {
      this.playTone(n.f, n.t, n.d, 0.2, idx * 0.1);
    });
  }

  playQuestComplete() {
    if (this.muted) return;
    this.playTone(587.33, 'sine', 0.1, 0.15, 0);     // D5
    this.playTone(739.99, 'sine', 0.1, 0.15, 0.08);  // F#5
    this.playTone(880.00, 'sine', 0.1, 0.15, 0.16);  // A5
    this.playTone(1174.66, 'triangle', 0.3, 0.2, 0.24); // D6
  }

  playPenalty() {
    if (this.muted) return;
    this.playTone(220, 'sawtooth', 0.2, 0.15, 0);    // A3
    this.playTone(196, 'sawtooth', 0.35, 0.18, 0.15); // G3
  }

  playBuy() {
    if (this.muted) return;
    this.playTone(987.77, 'sine', 0.08, 0.15, 0);     // B5
    this.playTone(1318.51, 'triangle', 0.2, 0.2, 0.06); // E6
  }

  playClick() {
    if (this.muted) return;
    this.playTone(800, 'sine', 0.03, 0.05, 0);
  }

  playEarlyBird() {
    if (this.muted) return;
    this.playTone(523.25, 'sine', 0.15, 0.15, 0);
    this.playTone(659.25, 'sine', 0.15, 0.15, 0.1);
    this.playTone(783.99, 'sine', 0.15, 0.15, 0.2);
    this.playTone(1046.50, 'triangle', 0.35, 0.25, 0.3);
  }
}

export const audio = new AudioEngine();
