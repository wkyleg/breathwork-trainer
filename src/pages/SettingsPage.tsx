import { useNavigate } from 'react-router';
import { DeviceConnect } from '../components/DeviceConnect';
import { PROTOCOLS } from '../lib/protocols';
import { useSettings } from '../lib/settingsStore';
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
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm font-medium cursor-pointer"
            style={{ color: 'var(--color-primary)' }}
          >
            Done
          </button>
        </div>

        <Section title="Default Protocol">
          <div className="flex flex-wrap gap-2">
            {PROTOCOLS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => settings.setProtocol(p.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                style={{
                  background: settings.protocolId === p.id ? 'var(--color-primary)' : '#E5E5EA',
                  color: settings.protocolId === p.id ? 'white' : 'var(--color-text)',
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Session Duration">
          <div className="flex flex-wrap gap-2">
            {SESSION_DURATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => settings.setSessionDuration(d.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                style={{
                  background: settings.sessionDuration === d.value ? 'var(--color-primary)' : '#E5E5EA',
                  color: settings.sessionDuration === d.value ? 'white' : 'var(--color-text)',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Audio">
          <Toggle label="Audio enabled" checked={settings.audioEnabled} onChange={settings.setAudioEnabled} />
          {settings.audioEnabled && (
            <div className="mt-3">
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-muted)' }}>
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
          <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
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
    <div className="mb-8">
      <h2
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--color-muted)' }}
      >
        {title}
      </h2>
      <div className="rounded-2xl p-5" style={{ background: 'var(--color-panel)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {children}
      </div>
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
        style={{ background: checked ? 'var(--color-primary)' : '#E5E5EA' }}
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
