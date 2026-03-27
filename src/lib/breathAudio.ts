import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let ambientNoise: Tone.Noise | null = null;
let ambientFilter: Tone.Filter | null = null;
let ambientGain: Tone.Gain | null = null;
let masterGain: Tone.Gain | null = null;
let initialized = false;

export async function initAudio(): Promise<void> {
  if (initialized) return;
  await Tone.start();

  masterGain = new Tone.Gain(0.5).toDestination();

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 1.5, decay: 0.5, sustain: 0.6, release: 2 },
    volume: -18,
  }).connect(masterGain);

  ambientFilter = new Tone.Filter({ frequency: 400, type: 'lowpass', rolloff: -24 });
  ambientGain = new Tone.Gain(0).connect(masterGain);
  ambientNoise = new Tone.Noise({ type: 'brown', volume: -26 });
  ambientNoise.connect(ambientFilter);
  ambientFilter.connect(ambientGain);

  initialized = true;
}

export function startAmbient(): void {
  if (!ambientNoise || !ambientGain) return;
  ambientNoise.start();
  ambientGain.gain.rampTo(1, 2);
}

export function stopAmbient(): void {
  if (!ambientNoise || !ambientGain) return;
  ambientGain.gain.rampTo(0, 1);
  setTimeout(() => ambientNoise?.stop(), 1200);
}

export function playInhale(): void {
  if (!synth) return;
  synth.triggerAttackRelease(['C4', 'E4', 'G4'], '4n', undefined, 0.3);
}

export function playExhale(): void {
  if (!synth) return;
  synth.triggerAttackRelease(['C3', 'G3'], '4n', undefined, 0.2);
}

export function setVolume(volume: number): void {
  if (masterGain) {
    masterGain.gain.rampTo(Math.max(0, Math.min(1, volume)), 0.1);
  }
}

export function disposeAudio(): void {
  ambientNoise?.stop();
  ambientNoise?.dispose();
  ambientFilter?.dispose();
  ambientGain?.dispose();
  synth?.dispose();
  masterGain?.dispose();
  synth = null;
  ambientNoise = null;
  ambientFilter = null;
  ambientGain = null;
  masterGain = null;
  initialized = false;
}
