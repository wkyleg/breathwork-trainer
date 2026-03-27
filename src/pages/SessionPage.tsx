import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreathingOrb } from '../components/BreathingOrb';
import { NeuroPanel } from '../components/NeuroPanel';
import { disposeAudio, initAudio, playExhale, playInhale, startAmbient, stopAmbient } from '../lib/breathAudio';
import { getCurrentPhase, getProtocol } from '../lib/protocols';
import { useSettings } from '../lib/settingsStore';
import { useNeuroSignals, useNeuroStore } from '../neuro/hooks';
import { SessionRecorder } from '../neuro/SessionRecorder';

export function SessionPage() {
  const navigate = useNavigate();
  const { protocolId, sessionDuration, audioEnabled, reducedMotion } = useSettings();
  const protocol = getProtocol(protocolId);
  const { calm, bpm } = useNeuroSignals();
  const manager = useNeuroStore((s: { manager: unknown }) => s.manager) as import('../neuro/neuroManager').NeuroManager | null;

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(!audioEnabled);
  const recorderRef = useRef(new SessionRecorder());
  const lastPhaseRef = useRef<string>('');
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    recorderRef.current.start(protocolId, protocol.name);
    if (!muted) {
      initAudio().then(() => startAmbient());
    }
    return () => {
      stopAmbient();
      disposeAudio();
    };
  }, [protocolId, protocol.name, muted]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = 0.05;
      setElapsed((now - startTimeRef.current) / 1000);

      if (manager) {
        const state = manager.getState();
        recorderRef.current.sample(dt, state);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [paused, manager]);

  useEffect(() => {
    if (elapsed >= sessionDuration && sessionDuration > 0) {
      handleEnd();
    }
  }, [elapsed, sessionDuration]);

  const cycleElapsed = elapsed % protocol.cycleDuration;
  const { phase, progress } = getCurrentPhase(protocol, cycleElapsed);

  useEffect(() => {
    if (muted || !audioEnabled) return;
    const phaseKey = `${Math.floor(elapsed / protocol.cycleDuration)}-${phase.name}`;
    if (phaseKey !== lastPhaseRef.current) {
      lastPhaseRef.current = phaseKey;
      if (phase.name === 'inhale') playInhale();
      else if (phase.name === 'exhale') playExhale();
    }
  }, [phase.name, elapsed, protocol.cycleDuration, muted, audioEnabled]);

  const handleEnd = useCallback(() => {
    const report = recorderRef.current.stop();
    stopAmbient();
    sessionStorage.setItem('lastReport', JSON.stringify(report));
    navigate('/summary');
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = sessionDuration > 0 ? Math.max(0, sessionDuration - elapsed) : elapsed;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-8 px-6"
      style={{ background: 'linear-gradient(180deg, #F5F7FA 0%, #E8ECF2 100%)' }}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
          {protocol.name}
        </span>
        <span className="text-sm tabular-nums" style={{ color: 'var(--color-muted)' }}>
          {sessionDuration > 0 ? formatTime(remaining) : formatTime(elapsed)}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <BreathingOrb
          phase={phase}
          progress={progress}
          coherence={calm}
          reducedMotion={reducedMotion}
        />

        <div className="text-center">
          <div
            className="text-2xl font-semibold tracking-widest mb-2"
            style={{ color: 'var(--color-primary)' }}
          >
            {phase.label}
          </div>
          {bpm !== null && (
            <div className="flex items-center justify-center gap-1 text-sm" style={{ color: 'var(--color-muted)' }}>
              <span style={{ color: '#FF3B30' }}>♥</span>
              <span className="tabular-nums">{Math.round(bpm)} BPM</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md">
        <NeuroPanel compact className="mb-4" />

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--color-panel)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? '▶' : '⏸'}
          </button>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--color-panel)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={handleEnd}
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--color-panel)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            title="End session"
          >
            ■
          </button>
        </div>
      </div>
    </div>
  );
}
