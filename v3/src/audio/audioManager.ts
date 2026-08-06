"use client";

/**
 * Audio design ala growon.kr:
 * - Web Audio API murni (sintesis oscillator + noise buffer)
 * - unlock pada gesture pertama (autoplay policy)
 * - master gain + mute global
 * - AnalyserNode → kecepatan disc turntable
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let muted = false;
let musicPlaying = false;
let musicNodes: { stop: () => void } | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    analyser.connect(master);
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

/** Panggil pada gesture pertama user (pointerdown) */
export function unlockAudio() {
  ensureContext();
}

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  if (master && ctx) {
    master.gain.setTargetAtTime(value ? 0 : 0.5, ctx.currentTime, 0.02);
  }
}

export function isMusicPlaying() {
  return musicPlaying;
}

function blip(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  detune = 0
) {
  const audio = ensureContext();
  if (!audio || !master || muted) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime);
  osc.detune.value = detune;
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

/** klik halus saat objek di-hover */
export function playHover() {
  blip(720, 0.06, "sine", 0.045);
}

/** klik saat objek diklik */
export function playClick() {
  blip(880, 0.08, "triangle", 0.12);
  blip(1320, 0.1, "sine", 0.06);
}

export type SoundId =
  | "monitor"
  | "notebook"
  | "cup"
  | "turntable"
  | "keyboard"
  | "pencil"
  | "lamp"
  | "chair"
  | "mouse"
  | "plant"
  | "bench";

/** Derau pendek untuk goresan vinyl / kresek — filter lowpass + wow */
function scratch(duration: number, cutoff = 1400, volume = 0.09) {
  const audio = ensureContext();
  if (!audio || !master || muted) return;
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * duration), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 0.85 + Math.random() * 0.3;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutoff, audio.currentTime);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start();
}

/** Setiap objek punya identitas suara sendiri saat di-hover */
export function playObjectHover(id: SoundId) {
  switch (id) {
    case "monitor":
      playStatic();
      break;
    case "notebook":
      blip(620, 0.05, "triangle", 0.05);
      blip(830, 0.045, "triangle", 0.04);
      break;
    case "cup":
      blip(1560, 0.25, "sine", 0.05);
      break;
    case "turntable":
      scratch(0.14, 2600, 0.06);
      break;
    case "keyboard":
      playType();
      break;
    case "pencil":
      blip(260, 0.09, "sine", 0.045);
      break;
    case "lamp":
      blip(480, 0.06, "sine", 0.045);
      blip(524, 0.07, "sine", 0.04, 9);
      break;
    case "chair":
      blip(130, 0.12, "sine", 0.05);
      blip(148, 0.12, "sine", 0.035, -14);
      break;
    case "mouse":
      blip(1900, 0.03, "square", 0.028);
      break;
    case "plant":
      scratch(0.12, 1200, 0.05);
      break;
    case "bench":
      blip(180, 0.10, "sine", 0.05);
      break;
  }
}

/** Setiap objek punya identitas suara sendiri saat diklik */
export function playObjectClick(id: SoundId) {
  switch (id) {
    case "monitor":
      blip(140, 0.12, "sine", 0.09);
      playStatic();
      break;
    case "notebook":
      blip(560, 0.07, "triangle", 0.08);
      blip(840, 0.09, "sine", 0.06);
      break;
    case "cup":
      blip(1150, 0.16, "sine", 0.07);
      blip(1720, 0.12, "sine", 0.04);
      break;
    case "turntable":
      scratch(0.22, 1800, 0.1);
      playClick();
      break;
    case "keyboard":
      playType();
      break;
    case "pencil":
      playBoing();
      break;
    case "lamp":
      blip(2300, 0.04, "square", 0.06);
      blip(1750, 0.035, "square", 0.045);
      break;
    case "chair":
      playClick();
      break;
    case "mouse":
      blip(2100, 0.022, "square", 0.055);
      blip(1750, 0.018, "square", 0.04);
      break;
    case "plant":
      scratch(0.28, 900, 0.08);
      blip(320, 0.14, "sine", 0.04);
      break;
    case "bench":
      blip(160, 0.18, "sine", 0.07);
      blip(140, 0.22, "sine", 0.04);
      break;
  }
}

/** whoosh saat panel terbuka/tertutup */
export function playWhoosh(open = true) {
  const audio = ensureContext();
  if (!audio || !master || muted) return;
  const duration = 0.35;
  const buffer = audio.createBuffer(1, audio.sampleRate * duration, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  const freq = open ? 500 : 900;
  filter.frequency.setValueAtTime(freq, audio.currentTime);
  filter.frequency.exponentialRampToValueAtTime(open ? 2400 : 300, audio.currentTime + duration);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + duration * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start();
}

/** ketikan keyboard */
export function playType() {
  blip(180 + Math.random() * 120, 0.03, "square", 0.05);
}

/** boing pensil (sintesis) */
export function playBoing() {
  blip(220, 0.35, "sine", 0.14);
  blip(220, 0.35, "sine", 0.1, 12);
}

let staticBuffer: AudioBuffer | null = null;

/** "kresek" statis TV — noise berdecit pendek (efek hover monitor) */
export function playStatic() {
  const audio = ensureContext();
  if (!audio || !master || muted) return;
  if (!staticBuffer) {
    const len = Math.floor(audio.sampleRate * 0.45);
    staticBuffer = audio.createBuffer(1, len, audio.sampleRate);
    const data = staticBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len) * (1 - i / len);
    }
  }
  const now = audio.currentTime;
  const source = audio.createBufferSource();
  source.buffer = staticBuffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(3800, now);
  filter.frequency.exponentialRampToValueAtTime(900, now + 0.28);
  filter.Q.value = 0.7;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(now);
  source.stop(now + 0.32);
}

/* ------------------------- Musik (turntable) ------------------------- */

const MUSIC_NOTES = [220, 261.63, 329.63, 392, 440, 523.25, 659.25];

function startMusic() {
  const audio = ensureContext();
  if (!audio || !master) return;

  const gain = audio.createGain();
  gain.gain.value = 0.5;
  gain.connect(master);
  if (analyser) {
    gain.connect(analyser);
  }

  const bass = audio.createOscillator();
  bass.type = "triangle";
  bass.frequency.value = 110;
  bass.connect(gain);

  const pad = audio.createOscillator();
  pad.type = "sine";
  pad.frequency.value = 220;
  const padGain = audio.createGain();
  padGain.gain.value = 0.25;
  pad.connect(padGain);
  padGain.connect(gain);

  const lfo = audio.createOscillator();
  lfo.frequency.value = 0.4;
  const lfoGain = audio.createGain();
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain);
  lfoGain.connect(pad.frequency);

  // arpeggio scheduler
  let step = 0;
  const interval = window.setInterval(() => {
    const audio2 = ensureContext();
    if (!audio2 || !master || muted || !musicPlaying) return;
    const osc = audio2.createOscillator();
    osc.type = "sine";
    osc.frequency.value = MUSIC_NOTES[step % MUSIC_NOTES.length] * (step % 8 < 4 ? 1 : 2);
    const g = audio2.createGain();
    g.gain.setValueAtTime(0.09, audio2.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio2.currentTime + 0.5);
    osc.connect(g);
    g.connect(master);
    osc.start();
    osc.stop(audio2.currentTime + 0.55);
    step++;
  }, 220);

  bass.start();
  pad.start();
  lfo.start();

  musicNodes = {
    stop: () => {
      window.clearInterval(interval);
      bass.stop();
      pad.stop();
      lfo.stop();
      gain.disconnect();
      musicPlaying = false;
      musicNodes = null;
    },
  };
  musicPlaying = true;
}

export function toggleMusic(): boolean {
  if (musicPlaying) {
    musicNodes?.stop();
    return false;
  }
  startMusic();
  return true;
}

/** level rata-rata (0..1) untuk menggerakkan disc turntable */
export function getLevel(): number {
  if (!analyser || !musicPlaying || muted) return 0;
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i];
  return sum / data.length / 255;
}
