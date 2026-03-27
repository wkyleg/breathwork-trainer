import { motion } from 'framer-motion';
import type { BreathPhase } from '../lib/protocols';

interface BreathingOrbProps {
  phase: BreathPhase;
  progress: number;
  coherence: number;
  reducedMotion?: boolean;
}

export function BreathingOrb({ phase, progress, coherence, reducedMotion = false }: BreathingOrbProps) {
  const isExpanding = phase.name === 'inhale';
  const isContracting = phase.name === 'exhale';

  const minScale = 0.55;
  const maxScale = 1.0;

  let scale: number;
  if (isExpanding) {
    scale = minScale + (maxScale - minScale) * easeInOutSine(progress);
  } else if (isContracting) {
    scale = maxScale - (maxScale - minScale) * easeInOutSine(progress);
  } else if (phase.name === 'holdIn') {
    scale = maxScale;
  } else {
    scale = minScale;
  }

  const wobble = coherence > 0.5 ? 0 : (1 - coherence) * 3;
  const glowOpacity = 0.12 + coherence * 0.2;
  const glowSize = 140 + coherence * 50;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 400, height: 400 }}>
      {!reducedMotion && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: glowSize,
            height: glowSize,
            background: `radial-gradient(circle, rgba(45,90,123,${glowOpacity}) 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [glowOpacity, glowOpacity * 1.15, glowOpacity] }}
          transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
      )}

      <motion.div
        className="rounded-full"
        style={{
          width: 280,
          height: 280,
          background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.35) 0%, rgba(45,90,123,0.55) 50%, rgba(35,70,100,0.75) 100%)',
          boxShadow: `0 0 50px rgba(45,90,123,${0.08 + coherence * 0.15}), inset 0 0 35px rgba(255,255,255,0.12)`,
        }}
        animate={{
          scale,
          rotate: reducedMotion ? 0 : wobble * Math.sin(Date.now() / 500),
        }}
        transition={{
          scale: { duration: 0.15, ease: 'easeOut' },
          rotate: { duration: 0 },
        }}
      />
    </div>
  );
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
