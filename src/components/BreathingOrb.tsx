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

  const glowOpacity = 0.15 + coherence * 0.25;
  const glowSize = 120 + coherence * 40;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {!reducedMotion && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: glowSize,
            height: glowSize,
            background: `radial-gradient(circle, rgba(0,122,255,${glowOpacity}) 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [glowOpacity, glowOpacity * 1.2, glowOpacity] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
      )}

      <motion.div
        className="rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.4) 0%, rgba(0,122,255,0.6) 50%, rgba(0,100,220,0.8) 100%)`,
          boxShadow: `0 0 40px rgba(0,122,255,${0.1 + coherence * 0.2}), inset 0 0 30px rgba(255,255,255,0.15)`,
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
