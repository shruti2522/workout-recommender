import React, { useMemo } from 'react';
import DashboardLayout from './DashboardLayout';
import { Flame, CheckCircle, Repeat, Clock, CalendarOff, Dumbbell, Circle, CheckCircle2, Zap as ZapIcon, Leaf, Sword, Crown, Trophy } from 'lucide-react';
import { LEVELS, calculateTotalXP, getLevelProgress } from '../utils/gamification';

const ICON_MAP = {
  'seedling': Leaf,
  'zap': ZapIcon,
  'flame': Flame,
  'sword': Sword,
  'trophy': Trophy,
};

function LevelProgression({ xp = 0 }) {
  const progressData = getLevelProgress(xp || 0);
  const currentLevel = progressData?.level || LEVELS[0];

  if (!currentLevel) return null;

  const nextLevel = LEVELS[currentLevel.index + 1];

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
        letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px'
      }}>
        Level
      </div>

      {/* Step row */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {LEVELS.map((level, idx) => {
          const isPast = currentLevel.index > level.index;
          const isCurrent = currentLevel.index === level.index;
          const IconComponent = ICON_MAP[level.icon] || Leaf;

          return (
            <React.Fragment key={level.index}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: isCurrent
                    ? '2px solid #22c55e'
                    : isPast
                    ? '1.5px solid #22c55e'
                    : '1.5px solid var(--border-subtle)',
                  background: isPast ? '#22c55e18' : isCurrent ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', zIndex: 1,
                }}>
                  <IconComponent
                    size={13}
                    color={isCurrent ? '#22c55e' : isPast ? '#22c55e' : 'var(--text-muted)'}
                    strokeWidth={2.5}
                  />
                </div>
                <span style={{
                  fontSize: '0.68rem', marginTop: '6px', whiteSpace: 'nowrap',
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isCurrent ? '500' : '400',
                }}>
                  {level.name}
                </span>
                <span style={{
                  fontSize: '0.58rem', marginTop: '2px', whiteSpace: 'nowrap',
                  color: 'var(--text-muted)',
                  fontWeight: '400',
                }}>
                  {level.maxXP === Infinity ? `${level.minXP}+` : `${level.minXP}-${level.maxXP}`}
                </span>
              </div>

              {idx < LEVELS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '1.5px',
                  background: isPast ? '#22c55e' : 'var(--border-subtle)',
                  marginBottom: '16px',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>


    </div>
  );
}

function WeekHeatmap({ history }) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateSet = new Set(history.map(h => h.date));
    const result = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ key, active: dateSet.has(key), date: d });
    }
    return result;
  }, [history]);

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
  xp = 0,
  completedQuests = [],
  onViewChange,
  sidebarOpen,
  onToggleSidebar,
  isMobile,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const completedDays = useMemo(() => savedPlan?.filter(d => d.completed) ?? [], [savedPlan]);
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

        {/* Level Progression */}
        <LevelProgression xp={xp} />

        <div className="prog-top-row">
          {/* Completion ring */}
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

          {/* Stats */}
          <div className="prog-stats-grid">
            {[
              { label: 'Day Streak', value: streak, unit: streak === 1 ? 'day' : 'days', icon: Flame, accent: streak > 0 },
              { label: 'Sessions Done', value: history?.length ?? 0, unit: 'total', icon: CheckCircle, accent: false },
              { label: 'Total Sets', value: totalStats.sets, unit: 'sets', icon: Repeat, accent: false },
              { label: 'Time Trained', value: totalStats.mins, unit: 'min', icon: Clock, accent: false },
            ].map(s => {
              const IconComponent = s.icon;
              return (
                <div key={s.label} className={`prog-stat-card ${s.accent ? 'prog-stat-accent' : ''}`}>
                  <IconComponent className="prog-stat-icon" size={24} />
                  <div className="prog-stat-val">{s.value}<span className="prog-stat-unit"> {s.unit}</span></div>
                  <div className="prog-stat-label">{s.label}</div>
                </div>
              );
            })}
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
              <CalendarOff className="prog-empty-icon" size={32} />
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
              <Dumbbell className="prog-empty-icon" size={32} />
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
                  {day.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
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
