/**
 * lib/soundManager.ts
 * 
 * Web Audio API based sound effects generator.
 * Creates procedural cartoon-like sounds for piece movements and game events.
 */

class SoundManager {
  audioCtx: AudioContext | null = null;
  isMuted: boolean = false;
  isMusicPlaying: boolean = false;
  bgmNode: OscillatorNode | null = null;
  bgmInterval: NodeJS.Timeout | null = null;
  
  // To avoid chaotic overlapping, keep track of recent sound times
  lastPlayTime: number = 0;

  constructor() {
    // Load persisted state if available
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('cuzo_muted');
      if (storedMute === 'true') {
        this.isMuted = true;
      }
      const storedMusic = localStorage.getItem('cuzo_music');
      if (storedMusic === 'true') {
        this.isMusicPlaying = true;
        // The music will start on first interaction since it needs AudioContext to be resumed
      }
    }
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.isMusicPlaying) {
        this.startBgm();
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cuzo_muted', String(this.isMuted));
    }
  }

  toggleMusic() {
    this.isMusicPlaying = !this.isMusicPlaying;
    if (typeof window !== 'undefined') {
      localStorage.setItem('cuzo_music', String(this.isMusicPlaying));
    }
    if (this.isMusicPlaying) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }
  
  private startBgm() {
    this.init();
    if (this.bgmInterval) return;
    
    // A simple, calming pentatonic sequence
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C, D, E, G, A
    let noteIdx = 0;
    
    this.bgmInterval = setInterval(() => {
       if (!this.isMusicPlaying || !this.audioCtx) return;
       const ctx = this.audioCtx;
       if (ctx.state === 'suspended') return;
       
       const osc = ctx.createOscillator();
       const gain = ctx.createGain();
       
       osc.type = 'sine';
       osc.frequency.value = notes[noteIdx % notes.length] / 2; // Lower octave
       noteIdx++;
       
       osc.connect(gain);
       gain.connect(ctx.destination);
       
       const now = ctx.currentTime;
       gain.gain.setValueAtTime(0, now);
       gain.gain.linearRampToValueAtTime(0.05, now + 0.5); // Very soft
       gain.gain.linearRampToValueAtTime(0, now + 2);
       
       osc.start(now);
       osc.stop(now + 2);
    }, 2000);
  }
  
  private stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // Generic oscillator helper
  private playOsc(
    type: OscillatorType, 
    freqStart: number, 
    freqEnd: number, 
    duration: number, 
    vol: number = 0.5
  ) {
    if (this.isMuted) return;
    this.init();
    const ctx = this.audioCtx!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Set timing
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqStart !== freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + duration);
    }
    
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  // 1. PAWN MOVE: High-pitched "boing"
  playPawn() { 
    this.playOsc('sine', 300, 800, 0.2, 0.4); 
  }

  // 2. ROOK MOVE: Low-pitched "clank"
  playRook() { 
    this.playOsc('square', 150, 100, 0.15, 0.2); 
  }

  // 3. KNIGHT MOVE: Fun "neigh-boing"
  playKnight() { 
    if (this.isMuted) return;
    this.init();
    const ctx = this.audioCtx!;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(600, now + 0.1);
    osc.frequency.setValueAtTime(400, now + 0.2);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 4. BISHOP MOVE: Smooth "swoosh"
  playBishop() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.audioCtx!;
    if (ctx.state === 'suspended') ctx.resume();
    
    const duration = 0.3;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const now = ctx.currentTime;
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(1200, now + duration);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
  }

  // 5. QUEEN MOVE: Triumphant "ta-da!"
  playQueen() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.audioCtx!;
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    [440, 554, 659].forEach((freq, i) => { // A, C#, E
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.15, now + i * 0.08); // stagger start
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
        
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
    });
  }

  // 6. KING MOVE: Comical "oof"
  playKing() { 
    this.playOsc('sawtooth', 150, 80, 0.3, 0.4); 
  }

  // 7. CAPTURE: Funny "gotcha!"
  playCapture() { 
    this.playOsc('sawtooth', 600, 200, 0.3, 0.3); 
  }

  // 8. CHECK: Alert "uh-oh!"
  playCheck() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.audioCtx!;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.setValueAtTime(400, now + 0.15); // bounce up
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // 9. CHECKMATE: Victory fanfare
  playCheckmate() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.audioCtx!;
    if (ctx.state === 'suspended') ctx.resume();
    
    const now = ctx.currentTime;
    const melody = [392, 523, 659, 784, 1046]; // G C E G C
    melody.forEach((freq, i) => {
       const osc = ctx.createOscillator();
       const gain = ctx.createGain();
       osc.type = 'square';
       osc.frequency.value = freq;
       osc.connect(gain);
       gain.connect(ctx.destination);
       
       gain.gain.setValueAtTime(0, now);
       gain.gain.setValueAtTime(0.15, now + i * 0.12);
       gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
       
       osc.start(now + i * 0.12);
       osc.stop(now + i * 0.12 + 0.4);
    });
  }

  // 10. ILLEGAL MOVE: Gentle "bzzt"
  playIllegal() { 
    this.playOsc('sawtooth', 120, 100, 0.2, 0.2); 
  }

  // 11. BUTTON CLICK: Soft "pop"
  playClick() { 
    this.playOsc('sine', 800, 800, 0.1, 0.15); 
  }
}

export const soundManager = new SoundManager();
