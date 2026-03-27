import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreathingOrb } from '../components/BreathingOrb';
import { SignalQuality } from '../components/SignalQuality';
import { Tip } from '../components/Tooltip';
import { disposeAudio, initAudio, playExhale, playInhale, startAmbient, stopAmbient } from '../lib/breathAudio';
import { getCurrentPhase, getProtocol } from '../lib/protocols';
import { SOUNDSCAPES, useSettings } from '../lib/settingsStore';
import { useNeuroEeg, useNeuroSignals, useNeuroStore } from '../neuro/hooks';
import type { NeuroManager } from '../neuro/neuroManager';
import { SessionRecorder } from '../neuro/SessionRecorder';

function getBrainStateLabel(calm: number, arousal: number): string {
  if (calm > 0.6 && arousal < 0.4) return 'Relaxed';
  if (calm > 0.5 && arousal > 0.5) return 'Focused';
  if (calm < 0.4 && arousal > 0.6) return 'Alert';
  return 'Balanced';
}

export function SessionPage() {
  const navigate = useNavigate();
  const { protocolId, sessionDuration, audioEnabled, reducedMotion, soundscape, setSoundscape, customInhale, customHold, customExhale } = useSettings();
  const protocol = getProtocol(protocolId, protocolId === 'custom' ? { inhale: customInhale, hold: customHold, exhale: customExhale } : undefined);
  const { calm, arousal, bpm, hrvRmssd, signalQuality, source, respirationRate, baselineDelta, calmnessState } = useNeuroSignals();
  const { alphaPower, betaPower, thetaPower, deltaPower, gammaPower, alphaPeakFreq, alphaBumpState, eegConnected } = useNeuroEegWithConnection();
  const manager = useNeuroStore((s: { manager: unknown }) => s.manager) as NeuroManager | null;

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(!audioEnabled);
  const [showSoundscapePicker, setShowSoundscapePicker] = useState(false);
  const recorderRef = useRef(new SessionRecorder());
  const lastPhaseRef = useRef<string>('');
  const startTimeRef = useRef(Date.now());
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const soundscapeRef = useRef(soundscape);
  soundscapeRef.current = soundscape;

  useEffect(() => {
    recorderRef.current.start(protocolId, protocol.name);
    if (!muted) {
      initAudio().then(() => startAmbient(soundscapeRef.current));
    }
    return () => {
      stopAmbient();
      disposeAudio();
    };
  }, [protocolId, protocol.name, muted]);

  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container || !manager) return;
    const videoEl = manager.getCameraVideoElement();
    if (videoEl) {
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.style.objectFit = 'cover';
      videoEl.style.borderRadius = '8px';
      videoEl.style.transform = 'scaleX(-1)';
      container.appendChild(videoEl);
      return () => {
        if (container.contains(videoEl)) {
          container.removeChild(videoEl);
        }
      };
    }
  }, [manager]);

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

  const handleSoundscapeChange = useCallback((id: typeof soundscape) => {
    setSoundscape(id);
    if (!muted) {
      stopAmbient();
      initAudio().then(() => startAmbient(id));
    }
    setShowSoundscapePicker(false);
  }, [muted, setSoundscape]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = sessionDuration > 0 ? Math.max(0, sessionDuration - elapsed) : elapsed;
  const sessionProgress = sessionDuration > 0 ? Math.min(1, elapsed / sessionDuration) : 0;
  const cyclesCompleted = Math.floor(elapsed / protocol.cycleDuration);
  const brainState = getBrainStateLabel(calm, arousal);
  const displayBpm = bpm !== null ? Math.round(bpm) : null;
  const displayHrv = hrvRmssd !== null ? Math.round(hrvRmssd) : null;
  const displayCalm = Math.round(calm * 100);
  const displayArousal = Math.round(arousal * 100);

  const currentSoundscapeLabel = SOUNDSCAPES.find((s) => s.id === soundscape)?.label ?? 'None';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Timer header */}
      <header
        className="flex-shrink-0 flex flex-col items-center"
        style={{
          padding: 'var(--space-sm) var(--space-lg)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-panel)',
        }}
      >
        <div className="flex items-center gap-4" style={{ marginBottom: '4px' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
            {protocol.name}
          </span>
          <span
            className="text-xs font-medium px-3 py-1 rounded"
            style={{ background: 'rgba(45,90,123,0.06)', color: 'var(--color-primary)' }}
          >
            Cycle {cyclesCompleted + 1}
          </span>
        </div>
        <div
          className="text-5xl font-semibold tabular-nums"
          style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
        >
          {sessionDuration > 0 ? formatTime(remaining) : formatTime(elapsed)}
        </div>
        {sessionDuration > 0 && (
          <div
            className="w-full max-w-md rounded-full overflow-hidden"
            style={{ height: 3, background: 'var(--color-border)', marginTop: '8px' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${sessionProgress * 100}%`, background: 'var(--color-primary)' }}
            />
          </div>
        )}
      </header>

      {/* Main content: orb centered */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-y-auto" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
        <BreathingOrb
          phase={phase}
          progress={progress}
          coherence={calm}
          reducedMotion={reducedMotion}
        />
        <div className="text-center" style={{ marginTop: 'var(--space-sm)' }}>
          <div
            className="text-3xl font-semibold tracking-wide"
            style={{ color: 'var(--color-primary)', marginBottom: '4px' }}
          >
            {phase.label}
          </div>
          {displayBpm !== null && (
            <div className="flex items-center justify-center gap-1.5 text-lg" style={{ color: 'var(--color-muted)' }}>
              <span style={{ color: 'var(--color-accent)' }}>&#9829;</span>
              <span className="tabular-nums font-medium">{displayBpm} BPM</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics + webcam strip */}
      {source !== 'none' && (
        <div
          className="flex-shrink-0"
          style={{
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-panel)',
            padding: 'var(--space-lg) var(--space-lg) var(--space-md)',
          }}
        >
          <div className="flex items-start justify-center gap-10 max-w-5xl mx-auto">
            {/* Webcam preview */}
            <div
              ref={videoContainerRef}
              className="rounded-lg overflow-hidden flex-shrink-0"
              style={{
                width: 160,
                height: 120,
                background: '#1A1A1A',
                border: '1px solid var(--color-border)',
              }}
            />

            {/* Vitals grid */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-x-10 items-center">
                <MetricItem label="HR" value={displayBpm !== null ? `${displayBpm}` : '--'} unit="BPM" color="var(--color-accent)" valueWidth="3ch" tooltip="Your heart rate right now" />
                <MetricItem label="HRV" value={displayHrv !== null ? `${displayHrv}` : '--'} unit="ms" valueWidth="3ch" tooltip="Heart rate variability — higher means your body is more relaxed" />
                <MetricItem label="Calm" value={`${displayCalm}`} unit="%" color="var(--color-calm)" valueWidth="3ch" tooltip="How calm your brain activity is (0–100%)" />
              </div>
              <div className="flex gap-x-10 items-center">
                <MetricItem label="Arousal" value={`${displayArousal}`} unit="%" valueWidth="3ch" tooltip="How alert or activated you are (0–100%)" />
                {respirationRate !== null && (
                  <MetricItem label="Resp" value={`${respirationRate.toFixed(1)}`} unit="/min" valueWidth="4ch" tooltip="Your estimated breathing rate" />
                )}
                {baselineDelta !== null && (
                  <MetricItem
                    label="HR Delta"
                    value={`${baselineDelta > 0 ? '+' : ''}${Math.round(baselineDelta)}`}
                    unit="BPM"
                    color={baselineDelta > 5 ? 'var(--color-accent)' : 'var(--color-calm)'}
                    valueWidth="4ch"
                    tooltip="How much your heart rate changed from your baseline"
                  />
                )}
              </div>
            </div>

            {/* Signal + brain state */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Tip text="How strong the sensor signal is — higher is better">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                    {source === 'eeg' ? 'EEG + Cam' : source === 'rppg' ? 'Camera' : 'Sim'}
                  </span>
                  <SignalQuality quality={signalQuality} />
                </div>
              </Tip>
              <Tip text="Your overall mental state based on brain and heart data">
                <div
                  className="text-sm font-medium rounded px-3 py-1.5"
                  style={{
                    background: 'rgba(45,90,123,0.04)',
                    color: 'var(--color-primary)',
                    border: '1px solid rgba(45,90,123,0.08)',
                  }}
                >
                  {brainState}
                  {calmnessState && (
                    <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--color-muted)' }}>
                      ({calmnessState})
                    </span>
                  )}
                </div>
              </Tip>
            </div>
          </div>

          {/* EEG band powers row */}
          {eegConnected && (
            <div className="max-w-5xl mx-auto" style={{ marginTop: 'var(--space-md)' }}>
              <div className="flex items-center gap-6">
                <span className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--color-muted)' }}>Bands</span>
                <div className="flex-1 flex gap-4">
                  <BandBar label="Alpha" value={alphaPower} color="#5B8A72" tooltip="Alpha waves (8–12 Hz) — relaxed, calm awareness" />
                  <BandBar label="Beta" value={betaPower} color="#C4784A" tooltip="Beta waves (12–30 Hz) — active thinking, focus" />
                  <BandBar label="Theta" value={thetaPower} color="#7B68AE" tooltip="Theta waves (4–8 Hz) — daydreaming, creativity" />
                  <BandBar label="Delta" value={deltaPower} color="#4A8BC4" tooltip="Delta waves (0.5–4 Hz) — deep rest" />
                  <BandBar label="Gamma" value={gammaPower} color="#C4A84A" tooltip="Gamma waves (30+ Hz) — intense focus, learning" />
                </div>
                {alphaPeakFreq !== null && (
                  <Tip text="The strongest alpha frequency your brain is producing">
                    <span className="text-xs tabular-nums flex-shrink-0 inline-block text-right" style={{ color: 'var(--color-muted)', minWidth: '11ch' }}>
                      Peak {alphaPeakFreq.toFixed(1)} Hz
                    </span>
                  </Tip>
                )}
                {alphaBumpState && (
                  <Tip text="Whether a clear alpha rhythm is detected">
                    <span className="text-xs flex-shrink-0 inline-block text-right" style={{ color: alphaBumpState === 'detected' ? 'var(--color-calm)' : 'var(--color-muted)', minWidth: '11ch' }}>
                      {alphaBumpState}
                    </span>
                  </Tip>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls footer */}
      <footer
        className="flex-shrink-0"
        style={{
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-panel)',
          padding: 'var(--space-sm) var(--space-lg)',
        }}
      >
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPaused(!paused)}
            className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer text-lg"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? '\u25B6' : '\u23F8'}
          </button>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer text-lg"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
          </button>

          {/* Soundscape selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSoundscapePicker(!showSoundscapePicker)}
              className="h-12 px-5 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-medium"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              title="Change soundscape"
            >
              <span>&#9835;</span>
              <span>{currentSoundscapeLabel}</span>
            </button>
            {showSoundscapePicker && (
              <div
                className="absolute bottom-full left-0 mb-2 rounded-lg shadow-lg overflow-hidden"
                style={{
                  background: 'var(--color-panel)',
                  border: '1px solid var(--color-border)',
                  minWidth: 180,
                  zIndex: 50,
                }}
              >
                {SOUNDSCAPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSoundscapeChange(s.id)}
                    className="w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50"
                    style={{
                      color: soundscape === s.id ? 'var(--color-primary)' : 'var(--color-text)',
                      fontWeight: soundscape === s.id ? 600 : 400,
                      background: soundscape === s.id ? 'rgba(45,90,123,0.04)' : 'transparent',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleEnd}
            className="px-8 py-3 rounded-lg font-medium cursor-pointer text-white text-base"
            style={{ background: 'var(--color-primary)' }}
            title="End session"
          >
            End Session
          </button>
        </div>
      </footer>
    </div>
  );
}

function useNeuroEegWithConnection() {
  const eeg = useNeuroEeg();
  const eegConnected = useNeuroStore((s) => s.eegConnected);
  return { ...eeg, eegConnected };
}

function MetricItem({
  label,
  value,
  unit,
  color,
  tooltip,
  valueWidth = '3ch',
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
  tooltip?: string;
  valueWidth?: string;
}) {
  const inner = (
    <div className="flex items-baseline gap-1.5" style={{ minWidth: 90 }}>
      <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
        {label}
      </span>
      <span
        className="text-lg font-semibold tabular-nums inline-block text-right"
        style={{ color: color ?? 'var(--color-text)', minWidth: valueWidth }}
      >
        {value}
      </span>
      <span className="text-xs font-normal" style={{ color: 'var(--color-muted)' }}>{unit}</span>
    </div>
  );
  return tooltip ? <Tip text={tooltip}>{inner}</Tip> : inner;
}

function BandBar({
  label,
  value,
  color,
  tooltip,
}: {
  label: string;
  value: number | null;
  color: string;
  tooltip?: string;
}) {
  const pct = value !== null ? Math.min(100, Math.round(value * 100)) : 0;
  const inner = (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      <span className="text-xs font-medium flex-shrink-0 w-10" style={{ color: 'var(--color-muted)' }}>
        {label}
      </span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color, minWidth: value !== null ? 2 : 0 }}
        />
      </div>
      <span className="text-xs tabular-nums font-medium w-8 text-right flex-shrink-0" style={{ color: 'var(--color-muted)' }}>
        {value !== null ? pct : '--'}
      </span>
    </div>
  );
  return tooltip ? <Tip text={tooltip}>{inner}</Tip> : inner;
}
