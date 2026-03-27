import { useNavigate } from 'react-router';
import { DeviceConnect } from '../components/DeviceConnect';
import { PROTOCOLS } from '../lib/protocols';
import { SOUNDSCAPES, useSettings } from '../lib/settingsStore';
import { useNeuroConnection } from '../neuro/hooks';

const SESSION_DURATIONS = [
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: 'Unlimited', value: 0 },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const { mockEnabled, enableMock, disableMock } = useNeuroConnection();

  return (
    <div className="min-h-screen" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm font-medium cursor-pointer hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Done
          </button>
        </div>

        <Section title="Default Protocol">
          <div className="flex flex-wrap gap-3">
            {PROTOCOLS.map((p) => (
              <PillButton
                key={p.id}
                label={p.name}
                active={settings.protocolId === p.id}
                onClick={() => settings.setProtocol(p.id)}
              />
            ))}
          </div>
          {settings.protocolId === 'custom' && (
            <div className="flex items-center gap-6" style={{ marginTop: 'var(--space-md)' }}>
              <DurationInput label="Inhale" value={settings.customInhale} onChange={settings.setCustomInhale} />
              <DurationInput label="Hold" value={settings.customHold} onChange={settings.setCustomHold} min={0} />
              <DurationInput label="Exhale" value={settings.customExhale} onChange={settings.setCustomExhale} />
              <span className="text-xs tabular-nums" style={{ color: 'var(--color-muted)' }}>
                = {settings.customInhale + settings.customHold + settings.customExhale}s cycle
              </span>
            </div>
          )}
        </Section>

        <Section title="Session Duration">
          <div className="flex flex-wrap gap-3">
            {SESSION_DURATIONS.map((d) => (
              <PillButton
                key={d.value}
                label={d.label}
                active={settings.sessionDuration === d.value}
                onClick={() => settings.setSessionDuration(d.value)}
              />
            ))}
          </div>
        </Section>

        <Section title="Soundscape">
          <div className="flex flex-wrap gap-3">
            {SOUNDSCAPES.map((sc) => (
              <PillButton
                key={sc.id}
                label={sc.label}
                active={settings.soundscape === sc.id}
                onClick={() => settings.setSoundscape(sc.id)}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-muted)', marginTop: '12px' }}>
            Ambient audio played during breathing sessions. Breathing tone cues are separate.
          </p>
        </Section>

        <Section title="Audio">
          <Toggle label="Audio enabled" checked={settings.audioEnabled} onChange={settings.setAudioEnabled} />
          {settings.audioEnabled && (
            <div style={{ marginTop: '16px' }}>
              <label className="text-xs font-medium block" style={{ color: 'var(--color-muted)', marginBottom: '6px' }}>
                Volume
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.audioVolume}
                onChange={(e) => settings.setAudioVolume(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </Section>

        <Section title="Accessibility">
          <Toggle label="Reduced motion" checked={settings.reducedMotion} onChange={settings.setReducedMotion} />
        </Section>

        <Section title="Signal Mode">
          <Toggle
            label="Mock / simulated signals"
            checked={mockEnabled}
            onChange={(v) => (v ? enableMock() : disableMock())}
          />
          <p className="text-xs" style={{ color: 'var(--color-muted)', marginTop: '10px' }}>
            Use synthetic signals for testing without hardware.
          </p>
        </Section>

        <Section title="Device Management">
          <DeviceConnect showSkip={false} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2
        className="text-xs font-semibold tracking-wide"
        style={{ color: 'var(--color-muted)', marginBottom: '12px' }}
      >
        {title}
      </h2>
      <div
        className="rounded-lg"
        style={{
          padding: 'var(--space-md)',
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
      style={{
        background: active ? 'var(--color-primary)' : '#F2F1EF',
        color: active ? 'white' : 'var(--color-text)',
        border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
      }}
    >
      {label}
    </button>
  );
}

function DurationInput({
  label,
  value,
  onChange,
  min = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
        {label}
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded flex items-center justify-center cursor-pointer text-sm font-medium"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        >
          -
        </button>
        <span
          className="text-lg font-semibold tabular-nums inline-block text-center"
          style={{ minWidth: '2ch', color: 'var(--color-text)' }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(30, value + 1))}
          className="w-8 h-8 rounded flex items-center justify-center cursor-pointer text-sm font-medium"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        >
          +
        </button>
      </div>
      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>sec</span>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium">{label}</span>
      <div
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ background: checked ? 'var(--color-primary)' : '#D5D4D1' }}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => e.key === 'Enter' && onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
      >
        <div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </div>
    </label>
  );
}
