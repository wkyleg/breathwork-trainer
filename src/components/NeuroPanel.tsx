import { useNeuroSignals } from '../neuro/hooks';
import { useNeuroEeg } from '../neuro/hooks';
import { SignalQuality } from './SignalQuality';

interface NeuroPanelProps {
  className?: string;
  compact?: boolean;
}

function getBrainStateLabel(calm: number, arousal: number): string {
  if (calm > 0.6 && arousal < 0.4) return 'Relaxed';
  if (calm > 0.5 && arousal > 0.5) return 'Focused';
  if (calm < 0.4 && arousal > 0.6) return 'Alert';
  return 'Balanced';
}

export function NeuroPanel({ className = '', compact = false }: NeuroPanelProps) {
  const { calm, arousal, bpm, hrvRmssd, signalQuality, source, respirationRate } = useNeuroSignals();
  const eeg = useNeuroEeg();

  if (source === 'none') return null;

  const displayBpm = bpm !== null ? Math.round(bpm) : '--';
  const displayHrv = hrvRmssd !== null ? hrvRmssd.toFixed(0) : '--';
  const displayCalm = Math.round(calm * 100);
  const displayArousal = Math.round(arousal * 100);
  const brainState = getBrainStateLabel(calm, arousal);

  if (compact) {
    return (
      <div
        className={`flex items-center flex-wrap gap-x-5 gap-y-2 rounded-lg text-sm ${className}`}
        style={{
          padding: 'var(--space-sm) var(--space-md)',
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <span style={{ color: 'var(--color-accent)' }}>&#9829;</span>
          <span className="font-medium tabular-nums">{displayBpm}</span>
        </span>
        {hrvRmssd !== null && (
          <span className="flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
            HRV <span className="font-medium tabular-nums">{displayHrv}</span>
          </span>
        )}
        <span className="flex items-center gap-1.5" style={{ color: 'var(--color-calm)' }}>
          Calm <span className="font-medium tabular-nums">{displayCalm}%</span>
        </span>
        <span className="flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
          Arousal <span className="font-medium tabular-nums">{displayArousal}%</span>
        </span>
        {respirationRate !== null && (
          <span className="flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
            Resp <span className="font-medium tabular-nums">{respirationRate.toFixed(1)}/m</span>
          </span>
        )}
        <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
          {brainState}
        </span>
        <SignalQuality quality={signalQuality} size={14} />
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        padding: 'var(--space-md)',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
          {source === 'eeg' ? 'EEG + Camera' : source === 'rppg' ? 'Camera' : 'Simulated'}
        </span>
        <SignalQuality quality={signalQuality} />
      </div>

      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 'var(--space-sm)' }}>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>BPM</div>
          <div className="text-2xl font-semibold tabular-nums flex items-center gap-1.5">
            <span style={{ color: 'var(--color-accent)', fontSize: 14 }}>&#9829;</span>
            {displayBpm}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>HRV</div>
          <div className="text-2xl font-semibold tabular-nums">{displayHrv}<span className="text-xs font-normal ml-1" style={{ color: 'var(--color-muted)' }}>ms</span></div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>Calm</div>
          <div className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--color-calm)' }}>
            {displayCalm}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5" style={{ marginBottom: 'var(--space-sm)' }}>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>Arousal</div>
          <div className="text-lg font-semibold tabular-nums">{displayArousal}%</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>State</div>
          <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{brainState}</div>
        </div>
        {respirationRate !== null && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)', marginBottom: '4px' }}>Resp</div>
            <div className="text-lg font-semibold tabular-nums">{respirationRate.toFixed(1)}<span className="text-xs font-normal ml-1" style={{ color: 'var(--color-muted)' }}>/min</span></div>
          </div>
        )}
      </div>

      {source === 'eeg' && eeg.alphaPower !== null && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-sm)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)', marginBottom: '8px' }}>
            Band Powers
          </div>
          <div className="flex flex-col gap-2">
            <BandBar label="\u03B1" value={eeg.alphaPower ?? 0} color="#5B8A72" />
            <BandBar label="\u03B2" value={eeg.betaPower ?? 0} color="#C4784A" />
            <BandBar label="\u03B8" value={eeg.thetaPower ?? 0} color="#2D5A7B" />
            <BandBar label="\u03B4" value={eeg.deltaPower ?? 0} color="#7A7A76" />
            <BandBar label="\u03B3" value={eeg.gammaPower ?? 0} color="#9B6B9E" />
          </div>
        </div>
      )}
    </div>
  );
}

function BandBar({ label, value, color }: { label: string; value: number; color: string }) {
  const clampedWidth = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium w-4 text-center">{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: 'var(--color-border)' }}>
        <div className="h-full rounded-full" style={{ width: `${clampedWidth}%`, background: color }} />
      </div>
      <span className="text-xs tabular-nums w-8 text-right" style={{ color: 'var(--color-muted)' }}>
        {(value * 100).toFixed(0)}
      </span>
    </div>
  );
}
