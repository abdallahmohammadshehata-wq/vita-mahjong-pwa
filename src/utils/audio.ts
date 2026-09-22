// Web Audio API Synthesizer for instant, zero-latency audio feedback

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // 1. Crisp Wood/Ivory Tile Click
  public playTileClick() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      // Audio fallback
    }
  }

  // 2. Harmonious Match Success Chime
  public playMatchSuccess(combo: number = 1) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const baseFreq = 523.25 * Math.min(1.8, 1 + (combo - 1) * 0.1); // C5 upwards
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Major chord arpeggio

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.35);
      });
    } catch (e) {}
  }

  // 3. Blocked / Invalid Move Bump
  public playBlockedTap() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {}
  }

  // 4. Shuffle / Undo Sound
  public playShuffle() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.playTileClick();
        }, i * 40);
      }
    } catch (e) {}
  }

  // 5. Grand Victory Fanfare
  public playVictoryFanfare() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const melody = [
        { note: 523.25, dur: 0.15 }, // C5
        { note: 523.25, dur: 0.15 }, // C5
        { note: 523.25, dur: 0.15 }, // C5
        { note: 659.25, dur: 0.4 },  // E5
        { note: 587.33, dur: 0.2 },  // D5
        { note: 783.99, dur: 0.6 }   // G5
      ];

      let curTime = this.ctx.currentTime;
      melody.forEach(({ note, dur }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, curTime);

        gain.gain.setValueAtTime(0, curTime);
        gain.gain.linearRampToValueAtTime(0.4, curTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, curTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(curTime);
        osc.stop(curTime + dur);

        curTime += dur;
      });
    } catch (e) {}
  }
}

export const soundFx = new SoundEngine();
