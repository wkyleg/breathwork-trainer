export interface BreathPhase {
  name: 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
  label: string;
  duration: number;
}

export interface BreathProtocol {
  id: string;
  name: string;
  description: string;
  phases: BreathPhase[];
  cycleDuration: number;
}

export const PROTOCOLS: BreathProtocol[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal inhale, hold, exhale, hold. Used by Navy SEALs for stress control.',
    phases: [
      { name: 'inhale', label: 'INHALE', duration: 4 },
      { name: 'holdIn', label: 'HOLD', duration: 4 },
      { name: 'exhale', label: 'EXHALE', duration: 4 },
      { name: 'holdOut', label: 'HOLD', duration: 4 },
    ],
    cycleDuration: 16,
  },
  {
    id: '478',
    name: '4-7-8',
    description: 'Calming pattern popularized by Dr. Andrew Weil. Ideal for relaxation and sleep.',
    phases: [
      { name: 'inhale', label: 'INHALE', duration: 4 },
      { name: 'holdIn', label: 'HOLD', duration: 7 },
      { name: 'exhale', label: 'EXHALE', duration: 8 },
    ],
    cycleDuration: 19,
  },
  {
    id: 'resonance',
    name: 'Resonance',
    description: 'Slow 6-breaths-per-minute pacing. Optimizes HRV and nervous system coherence.',
    phases: [
      { name: 'inhale', label: 'INHALE', duration: 5 },
      { name: 'exhale', label: 'EXHALE', duration: 5 },
    ],
    cycleDuration: 10,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Set your own inhale, hold, and exhale durations.',
    phases: [
      { name: 'inhale', label: 'INHALE', duration: 4 },
      { name: 'holdIn', label: 'HOLD', duration: 2 },
      { name: 'exhale', label: 'EXHALE', duration: 6 },
    ],
    cycleDuration: 12,
  },
];

export function getProtocol(id: string, customDurations?: { inhale: number; hold: number; exhale: number }): BreathProtocol {
  if (id === 'custom' && customDurations) {
    return buildCustomProtocol(customDurations.inhale, customDurations.hold, customDurations.exhale);
  }
  return PROTOCOLS.find((p) => p.id === id) ?? PROTOCOLS[0];
}

export function buildCustomProtocol(inhale: number, hold: number, exhale: number): BreathProtocol {
  const phases: BreathPhase[] = [
    { name: 'inhale', label: 'INHALE', duration: inhale },
  ];
  if (hold > 0) {
    phases.push({ name: 'holdIn', label: 'HOLD', duration: hold });
  }
  phases.push({ name: 'exhale', label: 'EXHALE', duration: exhale });

  const cycleDuration = phases.reduce((sum, p) => sum + p.duration, 0);
  return {
    id: 'custom',
    name: 'Custom',
    description: `Custom ${inhale}-${hold}-${exhale} pattern.`,
    phases,
    cycleDuration,
  };
}

export function getCurrentPhase(protocol: BreathProtocol, elapsedInCycle: number): { phase: BreathPhase; progress: number } {
  let accumulated = 0;
  for (const phase of protocol.phases) {
    if (elapsedInCycle < accumulated + phase.duration) {
      const phaseElapsed = elapsedInCycle - accumulated;
      return { phase, progress: phaseElapsed / phase.duration };
    }
    accumulated += phase.duration;
  }
  return { phase: protocol.phases[0], progress: 0 };
}
