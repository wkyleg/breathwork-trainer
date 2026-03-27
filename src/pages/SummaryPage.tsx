import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SessionReport } from '../neuro/SessionRecorder';
import { downloadReport, saveReport } from '../neuro/reportStorage';

export function SummaryPage() {
  const navigate = useNavigate();

  const report = useMemo<SessionReport | null>(() => {
    try {
      const raw = sessionStorage.getItem('lastReport');
      if (!raw) return null;
      return JSON.parse(raw) as SessionReport;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (report) saveReport('breathwork', report);
  }, [report]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-muted)' }}>No session data found</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-xl text-white font-medium cursor-pointer"
            style={{ background: 'var(--color-primary)' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const durationMin = Math.floor(report.durationMs / 60000);
  const durationSec = Math.floor((report.durationMs % 60000) / 1000);

  const chartData = report.samples
    .filter((_, i) => i % 2 === 0)
    .map((s) => ({
      time: Math.round(s.t),
      calm: Math.round(s.calm * 100),
      bpm: s.bpm !== null ? Math.round(s.bpm) : null,
    }));

  const calmDirection = report.netCalmChange > 0.02 ? 'increased' : report.netCalmChange < -0.02 ? 'decreased' : 'stayed stable';

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold mb-2">Session Complete</h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {report.sessionLabel} · {durationMin}m {durationSec}s
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Avg Heart Rate" value={report.avgBpm !== null ? `${Math.round(report.avgBpm)}` : '--'} unit="BPM" />
          <StatCard
            label="Avg Calm"
            value={`${Math.round(report.avgCalm * 100)}`}
            unit="%"
            color="var(--color-calm)"
          />
          <StatCard
            label="Calm Trend"
            value={calmDirection}
            unit=""
            color={report.netCalmChange > 0 ? 'var(--color-calm)' : 'var(--color-muted)'}
          />
        </div>

        {report.avgBpm !== null && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard label="Peak HR" value={report.peakBpm !== null ? `${Math.round(report.peakBpm)}` : '--'} unit="BPM" />
            <StatCard label="Low HR" value={report.minBpm !== null ? `${Math.round(report.minBpm)}` : '--'} unit="BPM" />
          </div>
        )}

        {chartData.length > 2 && (
          <div
            className="rounded-2xl p-6 mb-8"
            style={{ background: 'var(--color-panel)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-muted)' }}>
              Session Timeline
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}s`} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="calm" stroke="#34C759" fill="#34C759" fillOpacity={0.15} name="Calm %" />
                {chartData.some((d) => d.bpm !== null) && (
                  <Area type="monotone" dataKey="bpm" stroke="#007AFF" fill="#007AFF" fillOpacity={0.1} name="BPM" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="text-sm mb-8 p-4 rounded-xl" style={{ background: 'var(--color-panel)' }}>
          <p style={{ color: 'var(--color-muted)' }}>
            Your calm level <strong>{calmDirection}</strong> over the session.
            {report.dominantState !== 'No EEG data' && (
              <> Dominant brain state: <strong>{report.dominantState}</strong>.</>
            )}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full max-w-xs px-6 py-3 rounded-xl text-white font-medium cursor-pointer"
            style={{ background: 'var(--color-primary)' }}
          >
            New Session
          </button>
          <button
            type="button"
            onClick={() => downloadReport('breathwork', report)}
            className="text-sm font-medium cursor-pointer"
            style={{ color: 'var(--color-muted)' }}
          >
            Download Report (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: 'var(--color-panel)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>
        {label}
      </div>
      <div className="text-2xl font-semibold tabular-nums" style={{ color: color ?? 'var(--color-text)' }}>
        {value}
        {unit && <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
}
