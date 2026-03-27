import * as Tone from 'tone';
import type { SoundscapeType } from './settingsStore';

let synth: Tone.PolySynth | null = null;
let masterGain: Tone.Gain | null = null;
let initialized = false;

let ambientNodes: Tone.ToneAudioNode[] = [];
let ambientSource: Tone.Noise | Tone.Oscillator | null = null;
let currentSoundscape: SoundscapeType = 'none';
let stopTimeoutId: ReturnType<typeof setTimeout> | null = null;

export async function initAudio(): Promise<void> {
  if (initialized) return;
  await Tone.start();

  masterGain = new Tone.Gain(0.5).toDestination();

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 1.5, decay: 0.5, sustain: 0.6, release: 2 },
    volume: -18,
  }).connect(masterGain);

  initialized = true;
}

function disposeAmbient(): void {
  if (ambientSource) {
    try { ambientSource.stop(); } catch { /* already stopped */ }
    ambientSource.dispose();
    ambientSource = null;
  }
  for (const node of ambientNodes) {
    try { node.dispose(); } catch { /* swallow */ }
  }
  ambientNodes = [];
}

export function startAmbient(soundscape: SoundscapeType = 'brown-noise'): void {
  if (!masterGain) return;
  if (stopTimeoutId) {
    clearTimeout(stopTimeoutId);
    stopTimeoutId = null;
  }
  disposeAmbient();
  currentSoundscape = soundscape;

  if (soundscape === 'none') return;

  const gain = new Tone.Gain(0).connect(masterGain);
  ambientNodes.push(gain);

  switch (soundscape) {
    case 'brown-noise': {
      const filter = new Tone.Filter({ frequency: 400, type: 'lowpass', rolloff: -24 });
      const noise = new Tone.Noise({ type: 'brown', volume: -26 });
      noise.connect(filter);
      filter.connect(gain);
      ambientNodes.push(filter);
      ambientSource = noise;
      noise.start();
      break;
    }

    case 'rain': {
      const bp = new Tone.Filter({ frequency: 2000, type: 'bandpass', Q: 0.8 });
      const lp = new Tone.Filter({ frequency: 3500, type: 'lowpass', rolloff: -12 });
      const noise = new Tone.Noise({ type: 'pink', volume: -22 });
      noise.connect(bp);
      bp.connect(lp);
      lp.connect(gain);
      ambientNodes.push(bp, lp);
      ambientSource = noise;
      noise.start();
      break;
    }

    case 'ocean': {
      const lfo = new Tone.LFO({ frequency: 0.08, min: 150, max: 600, type: 'sine' });
      const filter = new Tone.Filter({ frequency: 300, type: 'lowpass', rolloff: -24 });
      const noise = new Tone.Noise({ type: 'brown', volume: -20 });
      lfo.connect(filter.frequency);
      lfo.start();
      noise.connect(filter);
      filter.connect(gain);
      ambientNodes.push(lfo as unknown as Tone.ToneAudioNode, filter);
      ambientSource = noise;
      noise.start();
      break;
    }

    case 'singing-bowls': {
      const freqs = [174, 261.63, 396, 528];
      const reverb = new Tone.Reverb({ decay: 8, wet: 0.7 });
      reverb.connect(gain);
      ambientNodes.push(reverb);

      for (const freq of freqs) {
        const osc = new Tone.Oscillator({ frequency: freq, type: 'sine', volume: -30 });
        const oscGain = new Tone.Gain(0.25);
        osc.connect(oscGain);
        oscGain.connect(reverb);
        osc.start();
        ambientNodes.push(osc as unknown as Tone.ToneAudioNode, oscGain);
      }
      ambientSource = null;
      break;
    }

    case 'forest': {
      const lp = new Tone.Filter({ frequency: 1200, type: 'lowpass', rolloff: -24 });
      const noise = new Tone.Noise({ type: 'white', volume: -32 });
      noise.connect(lp);
      lp.connect(gain);
      ambientNodes.push(lp);
      ambientSource = noise;
      noise.start();
      break;
    }
  }

  gain.gain.rampTo(1, 2);
}

export function stopAmbient(): void {
  if (stopTimeoutId) {
    clearTimeout(stopTimeoutId);
    stopTimeoutId = null;
  }
  for (const node of ambientNodes) {
    if (node instanceof Tone.Gain) {
      try { node.gain.rampTo(0, 1); } catch { /* swallow */ }
    }
  }
  stopTimeoutId = setTimeout(() => {
    disposeAmbient();
    stopTimeoutId = null;
  }, 1200);
}

export function getCurrentSoundscape(): SoundscapeType {
  return currentSoundscape;
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
  disposeAmbient();
  synth?.dispose();
  masterGain?.dispose();
  synth = null;
  masterGain = null;
  initialized = false;
}
