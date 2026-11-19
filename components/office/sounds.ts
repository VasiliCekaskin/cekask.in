/**
 * Tiny synthesized sounds for the office easter eggs (Web Audio, no files).
 * Only ever played right after the player used something, so the browser
 * allows audio.
 */
let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, length: number, type: OscillatorType, volume: number, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + length);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

let shower: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

/** Running water: filtered noise, faded in and out. */
function setShower(on: boolean) {
  const a = audio();
  if (!a) return;
  if (on && !shower) {
    const buffer = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = a.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.6;
    const gain = a.createGain();
    gain.gain.setValueAtTime(0.0001, a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, a.currentTime + 0.6);
    src.connect(filter).connect(gain).connect(a.destination);
    src.start();
    shower = { src, gain };
  } else if (!on && shower) {
    const { src, gain } = shower;
    gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.5);
    src.stop(a.currentTime + 0.55);
    shower = null;
  }
}

export const sounds = {
  /** Shower running while the player is in the bathroom. */
  shower: setShower,
  /** Rubber duck: two squeaks. */
  quack() {
    tone(900, 0, 0.12, "square", 0.05, 600);
    tone(950, 0.15, 0.14, "square", 0.05, 550);
  },
  /** A strummed G major chord. */
  guitar() {
    [98, 123.5, 147, 196, 247, 392].forEach((f, i) => tone(f, i * 0.035, 1.6, "triangle", 0.06));
  },
  /** Cat: a low, wobbly purr. */
  purr() {
    for (let i = 0; i < 8; i++) tone(48 + (i % 2) * 6, i * 0.11, 0.14, "sawtooth", 0.025);
  },
  /** Server alarm: two short beeps. */
  alarm() {
    tone(880, 0, 0.15, "square", 0.04);
    tone(660, 0.2, 0.15, "square", 0.04);
  },
  /** Light switch click. */
  click() {
    tone(2000, 0, 0.03, "square", 0.03, 800);
  },
  /** Found an easter egg: a little rising arpeggio. */
  found() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.18, "sine", 0.05));
  },
};
