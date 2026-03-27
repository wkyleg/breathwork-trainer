import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { DeviceConnect } from '../components/DeviceConnect';
import { useNeuroSignals, useNeuroStore } from '../neuro/hooks';

const BASELINE_DURATION = 10;

export function CalibratePage() {
  const navigate = useNavigate();
  const { source, signalQuality } = useNeuroSignals();
  const [phase, setPhase] = useState<'connect' | 'baseline' | 'countdown'>('connect');
  const [baselineProgress, setBaselineProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const videoContainerRef = useRef<HTMLDivElement>(null);

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
    if (phase !== 'baseline') return;
    const container = videoContainerRef.current;
    if (!container) return;
    const manager = useNeuroStore.getState().manager;
    const videoEl = manager?.getCameraVideoElement();
    if (videoEl) {
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.style.objectFit = 'cover';
      videoEl.style.borderRadius = '12px';
      videoEl.style.transform = 'scaleX(-1)';
      container.appendChild(videoEl);
      return () => {
        if (container.contains(videoEl)) {
          container.removeChild(videoEl);
        }
      };
    }
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
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16">
      {phase === 'connect' && (
        <div className="max-w-lg w-full">
          <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 className="text-3xl font-semibold" style={{ marginBottom: 'var(--space-xs)' }}>
              Connect Your Signals
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
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
        <div className="text-center max-w-2xl w-full">
          <h2 className="text-3xl font-semibold" style={{ marginBottom: 'var(--space-xs)' }}>
            Collecting Baseline
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-xl)' }}
          >
            Sit still and breathe naturally. Stay in frame while we measure your resting state.
          </p>
          <div className="flex items-center justify-center gap-12" style={{ marginBottom: 'var(--space-lg)' }}>
            <div
              ref={videoContainerRef}
              className="rounded-xl overflow-hidden flex-shrink-0"
              style={{
                width: 240,
                height: 180,
                background: '#1A1A1A',
                border: '1px solid var(--color-border)',
              }}
            />
            <div className="relative w-44 h-44 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${baselineProgress * 283} 283`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 0.1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-semibold tabular-nums" style={{ color: 'var(--color-primary)' }}>
                  {Math.round(baselineProgress * 100)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm" style={{ color: 'var(--color-muted)' }}>
            <span>Signal: {source !== 'none' ? source.toUpperCase() : 'none'}</span>
            {source !== 'none' && (
              <span className="tabular-nums">Quality: {Math.round(signalQuality * 100)}%</span>
            )}
          </div>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="text-center">
          <p className="text-xl" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-lg)' }}>
            Session starting in
          </p>
          <div
            className="text-9xl font-bold tabular-nums"
            style={{ color: 'var(--color-primary)' }}
          >
            {countdown}
          </div>
        </div>
      )}
    </div>
  );
}
