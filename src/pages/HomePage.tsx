import { useNavigate } from 'react-router';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-semibold tracking-tight mb-2" style={{ color: 'var(--color-text)' }}>
        Breathwork Trainer
      </h1>
      <p className="text-lg mb-12" style={{ color: 'var(--color-muted)' }}>
        Paced breathing with live physiological feedback
      </p>
      <button
        type="button"
        onClick={() => navigate('/calibrate')}
        className="px-8 py-3 rounded-xl text-white font-medium text-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        style={{ background: 'var(--color-primary)' }}
      >
        Start Session
      </button>
    </div>
  );
}
