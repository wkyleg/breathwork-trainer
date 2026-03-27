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
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ color: 'var(--color-text)', lineHeight: 1.1, marginBottom: 'var(--space-sm)' }}
          >
            Breathwork Trainer
          </h1>
          <p
            className="text-lg leading-relaxed max-w-lg mx-auto"
            style={{ color: 'var(--color-muted)' }}
          >
            Follow paced breathing patterns while your body&apos;s response is
            measured in real time. See how calm you become.
          </p>
        </div>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-md)' }}
          >
            Choose a protocol
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {PROTOCOLS.map((protocol) => {
              const isSelected = selected === protocol.id;
              return (
                <button
                  key={protocol.id}
                  type="button"
                  onClick={() => setSelected(protocol.id)}
                  className="text-left rounded-lg transition-all cursor-pointer border"
                  style={{
                    padding: 'var(--space-md)',
                    background: 'var(--color-panel)',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    borderWidth: isSelected ? '2px' : '1px',
                    boxShadow: isSelected
                      ? '0 2px 12px rgba(45,90,123,0.1)'
                      : 'none',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                    <span className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                      {protocol.name}
                    </span>
                    <span
                      className="text-xs font-medium tabular-nums px-2 py-0.5 rounded"
                      style={{
                        background: isSelected ? 'rgba(45,90,123,0.08)' : '#F2F1EF',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-muted)',
                      }}
                    >
                      {protocol.cycleDuration}s
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-muted)', marginBottom: '12px' }}
                  >
                    {protocol.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {protocol.phases.map((p) => (
                      <span
                        key={p.name}
                        className="text-xs font-medium px-2.5 py-1 rounded"
                        style={{
                          background: isSelected ? 'rgba(45,90,123,0.06)' : '#F7F6F4',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-muted)',
                        }}
                      >
                        {p.label} {p.duration}s
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center" style={{ gap: 'var(--space-sm)' }}>
          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-lg text-white font-semibold text-lg transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            style={{
              padding: '20px var(--space-lg)',
              background: 'var(--color-primary)',
              boxShadow: '0 2px 8px rgba(45,90,123,0.2)',
            }}
          >
            Start Session
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="text-sm font-medium cursor-pointer hover:underline"
            style={{ color: 'var(--color-muted)', padding: 'var(--space-xs)' }}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
