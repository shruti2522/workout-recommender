import React, { useMemo } from 'react';
import DashboardLayout from './DashboardLayout';

function WeekHeatmap({ history }) {
  // Build the last 12 weeks (84 days) grid
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = useMemo(() => {
    const dateSet = new Set(history.map(h => h.date));
    const result = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ key, active: dateSet.has(key), date: d });
    }
    return result;
  }, [history, today]);

  const weeks = useMemo(() => {
    const cols = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }
    return cols;
  }, [days]);

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-day-labels">
        {dayLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-col">
            {week.map(day => (
              <div
                key={day.key}
                className={`heatmap-cell ${day.active ? 'heatmap-cell-active' : ''}`}
                title={`${day.key}${day.active ? ' — workout completed' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MuscleBar({ muscle, percentage }) {
  return (
    <div className="prog-muscle-row">
      <span className="prog-muscle-name">{muscle}</span>
      <div className="prog-muscle-track">
        <div className="prog-muscle-fill" style={{ width: `${percentage}%` }} />
      </div>
      <span className="prog-muscle-pct">{percentage}%</span>
    </div>
  );
}

export default function ProgressPage({
  savedPlan,
  history,
  onViewChange,
  sidebarOpen,
  onToggleSidebar,
  isMobile,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const completedDays = savedPlan?.filter(d => d.completed) ?? [];
  const totalDays = savedPlan?.length ?? 0;
  const completedCount = completedDays.length;
  const completionPct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  const totalStats = useMemo(() => {
    let sets = 0, reps = 0, mins = 0;
    (history ?? []).forEach(h => {
      sets += h.totalSets ?? 0;
      reps += h.totalReps ?? 0;
      mins += Math.round((h.elapsed ?? 0) / 60);
    });
    return { sets, reps, mins };
  }, [history]);

  // Aggregate muscles across completed plan days
  const muscleCoverage = useMemo(() => {
    const counts = {};
    completedDays.forEach(day => {
      (day.exercises ?? []).forEach(ex => {
        (ex.primaryMuscles ?? []).forEach(m => {
          const key = m.charAt(0).toUpperCase() + m.slice(1);
          counts[key] = (counts[key] ?? 0) + (ex.sets ?? 1);
        });
      });
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([muscle, count]) => ({ muscle, percentage: Math.round((count / total) * 100) }));
  }, [completedDays]);

  const streak = useMemo(() => {
    if (!history || history.length === 0) return 0;
    const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i].date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((today - d) / 86400000);
      if (diff === i) count++;
      else break;
    }
    return count;
  }, [history]);

  const ringCircumference = 2 * Math.PI * 54;
  const ringOffset = ringCircumference - (ringCircumference * completionPct) / 100;

  return (
    <DashboardLayout
      activeTab="progress"
      onViewChange={onViewChange}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
      isMobile={isMobile}
      onOpenSidebar={onOpenSidebar}
      onCloseSidebar={onCloseSidebar}
    >
      <div className="inner-page animate-fade-in">
        <div className="inner-page-header">
          <h1 className="inner-page-title">Progress</h1>
          <p className="inner-page-subtitle">Track your consistency and strength over time.</p>
        </div>

        <div className="prog-top-row">
          {/* completin ring */}
          <div className="prog-ring-card">
            <div className="prog-ring-wrap">
              <svg width="120" height="120" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="var(--bg-base)" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r="54"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px', transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="prog-ring-inner">
                <span className="prog-ring-pct">{completionPct}%</span>
                <span className="prog-ring-sub">complete</span>
              </div>
            </div>
            <div className="prog-ring-meta">
              <div className="prog-ring-title">Plan Progress</div>
              <div className="prog-ring-detail">{completedCount} of {totalDays} days done</div>
              {completedCount === totalDays && totalDays > 0 && (
                <div className="prog-ring-badge">🎉 Plan Complete!</div>
              )}
            </div>
          </div>

          {/* stats */}
          <div className="prog-stats-grid">
            {[
              { label: 'Day Streak', value: streak, unit: streak === 1 ? 'day' : 'days', icon: 'ti-flame', accent: streak > 0 },
              { label: 'Sessions Done', value: history?.length ?? 0, unit: 'total', icon: 'ti-circle-check', accent: false },
              { label: 'Total Sets', value: totalStats.sets, unit: 'sets', icon: 'ti-repeat', accent: false },
              { label: 'Time Trained', value: totalStats.mins, unit: 'min', icon: 'ti-clock', accent: false },
            ].map(s => (
              <div key={s.label} className={`prog-stat-card ${s.accent ? 'prog-stat-accent' : ''}`}>
                <i className={`ti ${s.icon} prog-stat-icon`} />
                <div className="prog-stat-val">{s.value}<span className="prog-stat-unit"> {s.unit}</span></div>
                <div className="prog-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="prog-section-card">
          <div className="prog-section-header">
            <span className="prog-section-title">Activity — Last 12 Weeks</span>
            <span className="prog-section-legend">
              <span className="heatmap-cell" style={{ display: 'inline-block' }} /> inactive &nbsp;
              <span className="heatmap-cell heatmap-cell-active" style={{ display: 'inline-block' }} /> workout
            </span>
          </div>
          {history && history.length > 0 ? (
            <WeekHeatmap history={history} />
          ) : (
            <div className="prog-empty">
              <i className="ti ti-calendar-off prog-empty-icon" />
              <p>No sessions recorded yet. Complete your first workout to start tracking!</p>
            </div>
          )}
        </div>

        {/* Muscle Coverage */}
        <div className="prog-section-card">
          <div className="prog-section-header">
            <span className="prog-section-title">Muscles Trained</span>
            <span className="prog-section-sub">Across {completedCount} completed session{completedCount !== 1 ? 's' : ''}</span>
          </div>
          {muscleCoverage.length > 0 ? (
            <div className="prog-muscles">
              {muscleCoverage.map(m => <MuscleBar key={m.muscle} {...m} />)}
            </div>
          ) : (
            <div className="prog-empty">
              <i className="ti ti-barbell prog-empty-icon" />
              <p>Complete sessions to see muscle coverage.</p>
            </div>
          )}
        </div>

        {/* Per-day breakdown */}
        {totalDays > 0 && (
          <div className="prog-section-card">
            <div className="prog-section-header">
              <span className="prog-section-title">Plan Breakdown</span>
            </div>
            <div className="prog-days-grid">
              {savedPlan.map((day, i) => (
                <div key={day.key ?? i} className={`prog-day-pill ${day.completed ? 'prog-day-done' : ''}`}>
                  <i className={`ti ${day.completed ? 'ti-circle-check' : 'ti-circle'}`} />
                  <span>{day.label ?? `Day ${i + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
