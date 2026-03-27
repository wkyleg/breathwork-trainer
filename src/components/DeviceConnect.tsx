import { useNeuroConnection } from '../neuro/hooks';

interface DeviceConnectProps {
  onReady?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function DeviceConnect({ onReady, showSkip = true, onSkip }: DeviceConnectProps) {
  const {
    eegConnected,
    cameraActive,
    wasmReady,
    connecting,
    error,
    connectHeadband,
    enableCamera,
    enableMock,
  } = useNeuroConnection();

  const hasConnection = eegConnected || cameraActive;

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto" style={{ gap: 'var(--space-md)' }}>
      <div
        className="rounded-lg"
        style={{
          padding: 'var(--space-lg)',
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3 className="text-lg font-semibold" style={{ marginBottom: '6px' }}>Connect Webcam</h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-muted)', marginBottom: '20px' }}
        >
          Heart rate and HRV via facial video analysis
        </p>
        {cameraActive ? (
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-calm)' }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-calm)' }} />
            Camera connected
          </div>
        ) : (
          <button
            type="button"
            onClick={() => enableCamera()}
            disabled={connecting.camera}
            className="px-6 py-3 rounded-lg text-white font-medium text-base cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {connecting.camera ? 'Connecting...' : 'Enable Camera'}
          </button>
        )}
        {error.camera && <p className="text-sm mt-3 text-red-600">{error.camera}</p>}
      </div>

      {wasmReady && (
        <div
          className="rounded-lg"
          style={{
            padding: 'var(--space-lg)',
            background: 'var(--color-panel)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3 className="text-lg font-semibold" style={{ marginBottom: '6px' }}>Connect EEG Headband</h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-muted)', marginBottom: '20px' }}
          >
            Brain wave analysis via Bluetooth headband
          </p>
          {eegConnected ? (
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-calm)' }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-calm)' }} />
              Headband connected
            </div>
          ) : (
            <button
              type="button"
              onClick={() => connectHeadband()}
              disabled={connecting.eeg}
            className="px-6 py-3 rounded-lg text-white font-medium text-base cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {connecting.eeg ? 'Scanning...' : 'Connect Headband'}
            </button>
          )}
          {error.eeg && <p className="text-sm mt-3 text-red-600">{error.eeg}</p>}
          <p className="text-xs" style={{ color: 'var(--color-muted)', marginTop: '16px' }}>
            Requires Chrome or Edge with Web Bluetooth enabled
          </p>
        </div>
      )}

      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() => enableMock()}
          className="text-sm font-medium underline cursor-pointer self-center"
          style={{ color: 'var(--color-muted)', padding: 'var(--space-xs)' }}
        >
          Enable simulated signals (dev)
        </button>
      )}

      <div className="flex gap-4" style={{ marginTop: 'var(--space-xs)' }}>
        {hasConnection && onReady && (
          <button
            type="button"
            onClick={onReady}
            className="flex-1 px-6 py-4 rounded-lg text-white font-medium text-base cursor-pointer"
            style={{ background: 'var(--color-calm)' }}
          >
            Continue
          </button>
        )}
        {showSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-4 rounded-lg font-medium text-base cursor-pointer"
            style={{
              color: 'var(--color-muted)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-panel)',
            }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
