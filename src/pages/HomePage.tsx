import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PROTOCOLS } from '../lib/protocols';
import { useSettings } from '../lib/settingsStore';

export function HomePage() {
  const navigate = useNavigate();
  const { protocolId, setProtocol } = useSettings();
  const [selected, setSelected] = useState(protocolId);

  const handleStart = () => {
    setProtocol(selected);
    navigate('/calibrate');
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="max-w-xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-3" style={{ color: 'var(--color-text)' }}>
            Breathwork Trainer
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Follow paced breathing patterns while your body&apos;s response is measured in real time.
            See how calm you become.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-muted)' }}>
            Choose a protocol
          </h2>
          <div className="grid gap-3">
            {PROTOCOLS.map((protocol) => {
              const isSelected = selected === protocol.id;
              const timings = protocol.phases.map((p) => `${p.label} ${p.duration}s`).join(' · ');
              return (
                <button
                  key={protocol.id}
                  type="button"
                  onClick={() => setSelected(protocol.id)}
                  className="text-left rounded-2xl p-5 transition-all cursor-pointer border-2"
                  style={{
                    background: isSelected ? 'white' : 'var(--color-panel)',
                    borderColor: isSelected ? 'var(--color-primary)' : 'transparent',
                    boxShadow: isSelected ? '0 2px 12px rgba(0,122,255,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-base">{protocol.name}</span>
                    <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--color-muted)' }}>
                      {protocol.cycleDuration}s / cycle
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
                    {protocol.description}
                  </p>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                    {timings}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleStart}
            className="w-full max-w-xs px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{ background: 'var(--color-primary)' }}
          >
            Start Session
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="text-sm font-medium cursor-pointer"
            style={{ color: 'var(--color-muted)' }}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
