import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SessionReport, SessionSample } from '../neuro/SessionRecorder';
import { downloadReport, saveReport } from '../neuro/reportStorage';
import { getProtocol } from '../lib/protocols';
import { Tip } from '../components/Tooltip';

function getBrainStateLabel(calm: number, arousal: number): string {
  if (calm > 0.6 && arousal < 0.4) return 'Relaxed';
  if (calm > 0.5 && arousal > 0.5) return 'Focused';
  if (calm < 0.4 && arousal > 0.6) return 'Alert';
  return 'Balanced';
}

function computeExtendedStats(report: SessionReport) {
  const s = report.samples;
  const n = s.length || 1;

  let hrvSum = 0;
  let hrvCount = 0;
  let peakCalm = 0;
  let minCalm = 1;
  let alphaSum = 0;
  let betaSum = 0;
  let thetaSum = 0;
  let deltaSum = 0;
  let gammaSum = 0;

  const stateDistribution: Record<string, number> = {};

  for (const sample of s) {
    if (sample.hrv != null) {
      hrvSum += sample.hrv;
      hrvCount++;
    }
    if (sample.calm > peakCalm) peakCalm = sample.calm;
    if (sample.calm < minCalm) minCalm = sample.calm;

    alphaSum += sample.alpha;
    betaSum += sample.beta;
    thetaSum += sample.theta;
    deltaSum += sample.delta;
    gammaSum += sample.gamma;

    const state = sample.calmnessState ?? 'unknown';
    stateDistribution[state] = (stateDistribution[state] || 0) + 1;
  }

  const avgHrv = hrvCount > 0 ? hrvSum / hrvCount : null;

  const windowSize = Math.min(5, Math.floor(n / 2)) || 1;
  const firstHrv = s.slice(0, windowSize).reduce((a, v) => a + (v.hrv ?? 0), 0) / windowSize;
  const lastHrv = s.slice(-windowSize).reduce((a, v) => a + (v.hrv ?? 0), 0) / windowSize;
  const hrvTrend = hrvCount > 0 ? lastHrv - firstHrv : null;

  const protocol = getProtocol(report.sessionType);
  const cycleDuration = protocol.cycleDuration;
  const durationSec = report.durationMs / 1000;
  const cyclesCompleted = Math.floor(durationSec / cycleDuration);

  const bandTotal = alphaSum + betaSum + thetaSum + deltaSum + gammaSum || 1;
  const bandPowers = {
    alpha: alphaSum / n,
    beta: betaSum / n,
    theta: thetaSum / n,
    delta: deltaSum / n,
    gamma: gammaSum / n,
  };
  const bandPercents = {
    alpha: (alphaSum / bandTotal) * 100,
    beta: (betaSum / bandTotal) * 100,
    theta: (thetaSum / bandTotal) * 100,
    delta: (deltaSum / bandTotal) * 100,
    gamma: (gammaSum / bandTotal) * 100,
  };

  const brainState = getBrainStateLabel(report.avgCalm, report.avgArousal);

  const stateEntries = Object.entries(stateDistribution)
    .filter(([k]) => k !== 'unknown')
    .sort((a, b) => b[1] - a[1]);

  return {
    avgHrv,
    hrvTrend,
    peakCalm,
    minCalm,
    bandPowers,
    bandPercents,
    cyclesCompleted,
    cycleDuration,
    brainState,
    stateDistribution: stateEntries,
    hasBandData: bandTotal > 1,
  };
}

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

  const stats = useMemo(() => report ? computeExtendedStats(report) : null, [report]);

  useEffect(() => {
    if (report) saveReport('breathwork', report);
  }, [report]);

  if (!report || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ padding: 'var(--space-lg)' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-md)' }}>
            No session data found
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-lg text-white font-medium cursor-pointer"
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
  const startDate = new Date(report.startTime);

  const calmChartData = report.samples
    .filter((_: SessionSample, i: number) => i % 2 === 0)
    .map((s: SessionSample) => ({
      time: Math.round(s.t),
      calm: Math.round(s.calm * 100),
      arousal: Math.round(s.arousal * 100),
    }));

  const bpmChartData = report.samples
    .filter((_: SessionSample, i: number) => i % 2 === 0)
    .map((s: SessionSample) => ({
      time: Math.round(s.t),
      bpm: s.bpm !== null ? Math.round(s.bpm) : null,
      hrv: s.hrv !== null ? Math.round(s.hrv) : null,
    }));

  const calmDirection = report.netCalmChange > 0.02 ? 'Increased' : report.netCalmChange < -0.02 ? 'Decreased' : 'Stayed Stable';
  const arousalDirection = report.netArousalChange > 0.02 ? 'Increased' : report.netArousalChange < -0.02 ? 'Decreased' : 'Stayed Stable';

  const bandBarData = stats.hasBandData
    ? [
        { name: 'Alpha', value: stats.bandPercents.alpha, fill: '#5B8A72' },
        { name: 'Beta', value: stats.bandPercents.beta, fill: '#C4784A' },
        { name: 'Theta', value: stats.bandPercents.theta, fill: '#2D5A7B' },
        { name: 'Delta', value: stats.bandPercents.delta, fill: '#7A7A76' },
        { name: 'Gamma', value: stats.bandPercents.gamma, fill: '#9B6B9E' },
      ]
    : [];

  return (
    <div className="min-h-screen" style={{ padding: 'var(--space-xl) var(--space-lg)', background: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Hero header */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-xs)' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-medium cursor-pointer hover:underline"
              style={{ color: 'var(--color-muted)' }}
            >
              &larr; Home
            </button>
          </div>
          <h1 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-xs)' }}>
            Session Complete
          </h1>
          <div className="flex items-center gap-4 text-base" style={{ color: 'var(--color-muted)' }}>
            <span>{report.sessionLabel}</span>
            <span>&middot;</span>
            <span className="tabular-nums">{durationMin}m {durationSec}s</span>
            <span>&middot;</span>
            <span>{startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Primary stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: 'var(--space-xl)' }}>
          <StatCard label="Avg Heart Rate" value={report.avgBpm !== null ? `${Math.round(report.avgBpm)}` : '--'} unit="BPM" color="var(--color-accent)" tooltip="Your average heart rate during the session" />
          <StatCard label="Avg Calm" value={`${Math.round(report.avgCalm * 100)}`} unit="%" color="var(--color-calm)" tooltip="How calm your brain was on average (0–100%)" />
          <StatCard label="Avg HRV" value={stats.avgHrv !== null ? `${Math.round(stats.avgHrv)}` : '--'} unit="ms" tooltip="Heart rate variability — higher means your body was more relaxed" />
          <StatCard label="Brain State" value={stats.brainState} unit="" color="var(--color-primary)" tooltip="Your overall mental state based on brain and heart data" />
        </div>

        {/* Secondary stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: 'var(--space-xl)' }}>
          <StatCard label="Peak HR" value={report.peakBpm !== null ? `${Math.round(report.peakBpm)}` : '--'} unit="BPM" tooltip="The highest your heart rate reached" />
          <StatCard label="Low HR" value={report.minBpm !== null ? `${Math.round(report.minBpm)}` : '--'} unit="BPM" tooltip="The lowest your heart rate dropped to" />
          <StatCard label="Peak Calm" value={`${Math.round(stats.peakCalm * 100)}`} unit="%" color="var(--color-calm)" tooltip="Your calmest moment during the session" />
          <StatCard label="Low Calm" value={`${Math.round(stats.minCalm * 100)}`} unit="%" tooltip="Your least calm moment during the session" />
        </div>

        {/* Trend + breathing stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: 'var(--space-xl)' }}>
          <StatCard
            label="Calm Trend"
            value={calmDirection}
            unit=""
            color={report.netCalmChange > 0 ? 'var(--color-calm)' : 'var(--color-muted)'}
            tooltip="Whether you got calmer or less calm during the session"
          />
          <StatCard
            label="Arousal Trend"
            value={arousalDirection}
            unit=""
            color={report.netArousalChange < 0 ? 'var(--color-calm)' : 'var(--color-muted)'}
            tooltip="Whether your alertness went up or down during the session"
          />
          <StatCard label="Cycles" value={`${stats.cyclesCompleted}`} unit={`@ ${stats.cycleDuration}s`} tooltip="How many full breathing cycles you completed" />
          <StatCard label="Avg Arousal" value={`${Math.round(report.avgArousal * 100)}`} unit="%" tooltip="How alert you were on average (0–100%)" />
        </div>

        {/* Calm + Arousal timeline */}
        {calmChartData.length > 2 && (
          <ChartSection title="Calm &amp; Arousal Timeline" marginBottom="var(--space-xl)">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={calmChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={(v: number) => `${v}s`} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} domain={[0, 100]} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="calm" stroke="#5B8A72" fill="#5B8A72" fillOpacity={0.12} name="Calm %" />
                <Area type="monotone" dataKey="arousal" stroke="#C4784A" fill="#C4784A" fillOpacity={0.08} name="Arousal %" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartSection>
        )}

        {/* BPM + HRV timeline */}
        {bpmChartData.some((d: { bpm: number | null }) => d.bpm !== null) && (
          <ChartSection title="Heart Rate &amp; HRV Timeline" marginBottom="var(--space-xl)">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={bpmChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={(v: number) => `${v}s`} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="bpm" stroke="#C4784A" fill="#C4784A" fillOpacity={0.1} name="BPM" />
                {bpmChartData.some((d: { hrv: number | null }) => d.hrv !== null) && (
                  <Area type="monotone" dataKey="hrv" stroke="#2D5A7B" fill="#2D5A7B" fillOpacity={0.08} name="HRV (ms)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartSection>
        )}

        {/* Band power distribution */}
        {stats.hasBandData && (
          <ChartSection title="Brain Wave Distribution" marginBottom="var(--space-xl)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bandBarData} layout="vertical" barCategoryGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={(v: number) => `${Math.round(v)}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text)' }} width={90} />
                <RechartsTooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
        )}

        {/* Calmness state distribution */}
        {stats.stateDistribution.length > 0 && (
          <div
            className="rounded-lg"
            style={{
              padding: 'var(--space-md)',
              background: 'var(--color-panel)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-xl)',
            }}
          >
            <h3
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}
            >
              Time in Each Brain State
            </h3>
            <div className="flex flex-col" style={{ gap: '10px' }}>
              {stats.stateDistribution.map(([state, count]) => {
                const pct = (count / report.samples.length) * 100;
                return (
                  <div key={state}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                      <span className="text-sm font-medium">{state}</span>
                      <span className="text-sm tabular-nums" style={{ color: 'var(--color-muted)' }}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full overflow-hidden"
                      style={{ height: 6, background: 'var(--color-border)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Narrative insight */}
        <div
          className="rounded-lg"
          style={{
            padding: 'var(--space-md)',
            background: 'var(--color-panel)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--space-xl)',
          }}
        >
            <h3
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}
            >
              Session Insights
            </h3>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            <p style={{ marginBottom: '8px' }}>
              Your calm level <strong>{calmDirection.toLowerCase()}</strong> over the session
              ({report.netCalmChange > 0 ? '+' : ''}{Math.round(report.netCalmChange * 100)} percentage points),
              while arousal <strong>{arousalDirection.toLowerCase()}</strong>.
              You completed <strong>{stats.cyclesCompleted} breathing cycles</strong> in {durationMin}m {durationSec}s.
            </p>
            {report.dominantState !== 'No EEG data' && (
              <p style={{ marginBottom: '8px' }}>
                Dominant brain state: <strong>{report.dominantState}</strong>.
                Your overall state was classified as <strong>{stats.brainState}</strong>.
              </p>
            )}
            {stats.avgHrv !== null && (
              <p>
                Average HRV was <strong>{Math.round(stats.avgHrv)} ms</strong>
                {stats.hrvTrend !== null && (
                  <>, which {stats.hrvTrend > 2 ? 'improved' : stats.hrvTrend < -2 ? 'decreased' : 'remained stable'} over the session</>
                )}.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-10 py-4 rounded-lg text-white font-medium text-base cursor-pointer"
            style={{ background: 'var(--color-primary)' }}
          >
            New Session
          </button>
          <button
            type="button"
            onClick={() => downloadReport('breathwork', report)}
            className="w-full sm:w-auto px-10 py-4 rounded-lg font-medium text-base cursor-pointer"
            style={{
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-panel)',
            }}
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
  tooltip,
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
  tooltip?: string;
}) {
  const card = (
    <div
      className="rounded-lg text-center"
      style={{
        padding: 'var(--space-md)',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="text-xs font-semibold tracking-wide"
        style={{ color: 'var(--color-muted)', marginBottom: '8px' }}
      >
        {label}
      </div>
      <div className="text-3xl font-semibold tabular-nums" style={{ color: color ?? 'var(--color-text)' }}>
        {value}
        {unit && <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
  return tooltip ? <Tip text={tooltip}>{card}</Tip> : card;
}

function ChartSection({
  title,
  children,
  marginBottom,
}: {
  title: string;
  children: React.ReactNode;
  marginBottom: string;
}) {
  return (
    <div
      className="rounded-lg"
      style={{
        padding: 'var(--space-md)',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        marginBottom,
      }}
    >
      <h3
        className="text-xs font-semibold tracking-wide"
        style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
