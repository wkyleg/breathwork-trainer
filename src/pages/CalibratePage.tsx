import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { DeviceConnect } from '../components/DeviceConnect';
import { useNeuroSignals } from '../neuro/hooks';

const BASELINE_DURATION = 10;

export function CalibratePage() {
  const navigate = useNavigate();
  const { source, signalQuality } = useNeuroSignals();
  const [phase, setPhase] = useState<'connect' | 'baseline' | 'countdown'>('connect');
  const [baselineProgress, setBaselineProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const startBaseline = useCallback(() => {
    setPhase('baseline');
  }, []);

  useEffect(() => {
    if (phase !== 'baseline') return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const progress = Math.min(1, elapsed / BASELINE_DURATION);
      setBaselineProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        setPhase('countdown');
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      navigate('/session');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {phase === 'connect' && (
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Connect Your Signals</h2>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Connect at least one signal source to get live feedback during your session.
            </p>
          </div>
          <DeviceConnect
            onReady={startBaseline}
            showSkip
            onSkip={() => navigate('/session')}
          />
        </div>
      )}

      {phase === 'baseline' && (
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Collecting Baseline</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
            Sit still and breathe naturally. We&apos;re measuring your resting state.
          </p>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E5EA" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${baselineProgress * 283} 283`}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-semibold tabular-nums" style={{ color: 'var(--color-primary)' }}>
                {Math.round(baselineProgress * 100)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            Signal: {source !== 'none' ? source.toUpperCase() : 'none'}
            {source !== 'none' && ` · Quality: ${Math.round(signalQuality * 100)}%`}
          </div>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-muted)' }}>Session starting in</p>
          <div
            className="text-8xl font-bold tabular-nums"
            style={{ color: 'var(--color-primary)' }}
          >
            {countdown}
          </div>
        </div>
      )}
    </div>
  );
}
