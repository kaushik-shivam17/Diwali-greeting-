/**
 * 100% Procedural Web Audio API Festive Indian Classical Ambient Synthesizer
 * Generates a soothing Raag Yaman / Pahadi inspired Sitar + Tanpura drone + Temple Bell melody
 * plus interactive Diya lighting, Firework burst, and Gift Box chime sound effects.
 * Strictly initializes and plays only after explicit user interaction.
 */

class FestiveSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private isMuted = false;
  private melodyTimer: number | null = null;
  private stepIndex = 0;

  // Raag Yaman / Festive auspicious scale frequencies (in Hz, Base C4 / D4)
  private readonly scaleNotes = [
    261.63, // Sa (C4)
    293.66, // Re (D4)
    329.63, // Ga (E4)
    370.00, // Tivra Ma (F#4)
    392.00, // Pa (G4)
    440.00, // Dha (A4)
    493.88, // Ni (B4)
    523.25, // Sa' (C5)
    587.33, // Re' (D5)
    659.25, // Ga' (E5)
  ];

  // Auspicious melodic phrases
  private readonly melodyPattern = [
    0, 2, 4, 7, 6, 4, 2, 4,
    3, 4, 5, 7, 8, 7, 5, 4,
    2, 4, 7, 9, 7, 6, 4, 2,
    1, 2, 4, 2, 0, 2, 4, 7,
  ];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.32;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public startMusic(): boolean {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return false;
    if (this.isPlaying) return true;

    this.isPlaying = true;
    this.scheduleNextNote();
    return true;
  }

  public pauseMusic(): void {
    this.isPlaying = false;
    if (this.melodyTimer !== null) {
      window.clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pauseMusic();
      return false;
    } else {
      return this.startMusic();
    }
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : 0.32,
        this.ctx.currentTime,
        0.06
      );
    }
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public getState(): { isPlaying: boolean; isMuted: boolean } {
    return { isPlaying: this.isPlaying, isMuted: this.isMuted };
  }

  private scheduleNextNote(): void {
    if (!this.isPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const noteIdx = this.melodyPattern[this.stepIndex % this.melodyPattern.length];
    const freq = this.scaleNotes[noteIdx];

    // Play plucked sitar/santoor harmonic note
    this.playPluckedString(freq, 1.35, 0.22);

    // Every 4th beat, play a soft tanpura Sa-Pa drone harmonic
    if (this.stepIndex % 4 === 0) {
      this.playDroneChord(130.81, 196.0, 2.6);
    }

    // Every 8th beat, chime a delicate temple manjira bell
    if (this.stepIndex % 8 === 0) {
      this.playTempleBell(1046.5, 1.8, 0.08);
    }

    this.stepIndex++;
    this.melodyTimer = window.setTimeout(() => this.scheduleNextNote(), 520);
  }

  private playPluckedString(freq: number, duration: number, volume: number): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    // Subtle sympathetic string shimmer (jawari)
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 2.002, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 4.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.4, now + duration);

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + 0.025);
    noteGain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.28;

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  private playDroneChord(rootFreq: number, fifthFreq: number, duration: number): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    [rootFreq, fifthFreq].forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.075, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  }

  public playTempleBell(freq = 1174.66, duration = 1.6, volume = 0.14): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.isMuted) return;
    const now = ctx.currentTime;

    [1, 2.756, 5.404].forEach((ratio, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ratio, now);

      const amp = volume / (idx * 1.9 + 1);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(amp, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + duration / (idx + 1));

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.04);
    });
  }

  public playGiftOpenFanfare(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.isMuted) return;
    // Ascending auspicious arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      window.setTimeout(() => {
        this.playPluckedString(freq, 1.4, 0.25);
        if (i === notes.length - 1) {
          this.playTempleBell(1046.5, 2.4, 0.2);
        }
      }, i * 95);
    });
  }

  public playFireworkSparkle(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = 650 + Math.random() * 650;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.38);
  }
}

export const soundEngine = new FestiveSoundEngine();
