/**
 * Lightweight procedural sound manager built on the Web Audio API.
 *
 * All sound effects are synthesized at runtime from oscillators and noise
 * buffers, so the game ships with zero audio files. Audio is lazily
 * initialized on the first user gesture to satisfy browser autoplay
 * policies.
 */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
  }

  /** Create the AudioContext on demand (must follow a user gesture). */
  ensureContext() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.3;
    this.master.connect(this.ctx.destination);
  }

  resume() {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.enabled = !this.enabled;
    if (this.master) this.master.gain.value = this.enabled ? 0.3 : 0;
    return this.enabled;
  }

  /** Generic tone with a frequency sweep and exponential decay. */
  tone(startFreq, endFreq, duration, type = 'square', volume = 0.5) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + duration);
  }

  /** Short noise burst for explosions. */
  noise(duration, volume = 0.4, filterFreq = 1000) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const frames = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t);
    src.stop(t + duration);
  }

  shoot() { this.tone(880, 220, 0.12, 'square', 0.18); }
  enemyShoot() { this.tone(320, 120, 0.18, 'sawtooth', 0.12); }
  hit() { this.tone(180, 60, 0.1, 'square', 0.25); }
  explosion() { this.noise(0.4, 0.4, 800); }
  bigExplosion() { this.noise(0.7, 0.5, 600); }
  powerUp() {
    this.tone(440, 880, 0.18, 'sine', 0.3);
    setTimeout(() => this.tone(660, 1320, 0.18, 'sine', 0.3), 90);
  }
  shieldHit() { this.tone(600, 900, 0.08, 'sine', 0.25); }
  playerHit() { this.noise(0.3, 0.5, 400); }
  gameOver() {
    this.tone(440, 110, 0.6, 'sawtooth', 0.3);
    setTimeout(() => this.noise(0.5, 0.4, 300), 200);
  }
  victory() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => this.tone(f, f, 0.22, 'triangle', 0.25), i * 120));
  }
}

export const sound = new SoundManager();
