import React, { useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import WeeklyHabitRing from './WeeklyHabitRing';
import {
  Flame, Clock, CalendarOff, Dumbbell, Zap as ZapIcon,
  Leaf, Sword, Trophy, TrendingUp, CheckCircle,
} from 'lucide-react';
import { LEVELS, getLevelProgress, calculateStreak } from '../../utils/xp';

const LEVEL_ICON_MAP = {
  seedling: Leaf,
  zap: ZapIcon,
  flame: Flame,
  sword: Sword,
  trophy: Trophy,
};

/* ── Week consistency timeline ─────────────────────────────────────── */
function WeekConsistencyBar({ history, daysPerWeek, startDate }) {
  const weeks = useMemo(() => {
    if (!history || history.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use same anchor as WeeklyHabitRing: the user's onboarding day-of-week
    let anchorDOW = 0;
    if (startDate) {
      const d = new Date(startDate);
      if (!isNaN(d)) anchorDOW = d.getDay();
    }

    const NUM_WEEKS = 10;
    const results = [];

    for (let w = NUM_WEEKS - 1; w >= 0; w--) {
      // Find the start of this rolling window
      const todayDOW = today.getDay();
      const daysBack = (todayDOW - anchorDOW + 7) % 7 + w * 7;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - daysBack);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startStr = weekStart.toISOString().slice(0, 10);
      const endStr = weekEnd.toISOString().slice(0, 10);

      const sessions = history.filter(h => h.date >= startStr && h.date <= endStr).length;
      const isCurrent = w === 0;
      results.push({ startStr, sessions, isCurrent });
    }
    return results;
  }, [history, startDate]);

  if (weeks.length === 0) return null;

  return (
    <div className="week-consistency-timeline">
      <div className="wct-header">
        <span className="wct-title">Weekly Consistency</span>
        <span className="wct-sub">Last 10 weeks</span>
      </div>
      <div className="wct-bars">
        {weeks.map((week, i) => {
          const pct = Math.min(100, Math.round((week.sessions / Math.max(1, daysPerWeek)) * 100));
          const isConsistent = week.sessions >= daysPerWeek;
          const hasAny = week.sessions > 0;
          return (
            <div key={i} className="wct-bar-col" title={`${week.startStr}: ${week.sessions} session${week.sessions !== 1 ? 's' : ''}`}>
              <div className="wct-bar-track">
                <div
                  className={`wct-bar-fill ${isConsistent ? 'full' : hasAny ? 'partial' : 'empty'}`}
                  style={{ height: `${Math.max(4, pct)}%` }}
                />
              </div>
              <span className={`wct-bar-label ${week.isCurrent ? 'current' : ''}`}>
                {week.isCurrent ? 'now' : ''}
              </span>
            </div>
          );
        })}
      </div>
      <div className="wct-legend">
        <span className="wct-legend-item full">■ Goal met</span>
        <span className="wct-legend-item partial">■ Partial</span>
        <span className="wct-legend-item empty">■ Missed</span>
      </div>
    </div>
  );
}

/* ── Heatmap ───────────────────────────────────────────────────────── */
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
    for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));
    return cols;
  }, [days]);

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-day-labels">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((l, i) => <span key={i}>{l}</span>)}
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

/* ── Muscle bar ────────────────────────────────────────────────────── */
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

/* ── XP Level bar ──────────────────────────────────────────────────── */
function XPLevelBar({ xp }) {
  const { level, pct, current, needed } = getLevelProgress(xp || 0);
  const nextLevel = LEVELS[level.index + 1];
  const LevelIcon = LEVEL_ICON_MAP[level.icon] || Leaf;

  return (
    <div className="xp-level-bar-card">
      <div className="xp-level-bar-header">
        <div className="xp-level-info">
          <div className="xp-level-badge" style={{ background: `${level.color}22`, border: `1px solid ${level.color}44` }}>
            <LevelIcon size={14} color={level.color} />
            <span style={{ color: level.color, fontWeight: '700', fontSize: '0.8rem' }}>Lv.{level.index + 1} {level.name}</span>
          </div>
          <span className="xp-total">{xp} XP</span>
        </div>
        {nextLevel && (
          <span className="xp-next-label">
            {needed - current} XP to {nextLevel.name}
          </span>
        )}
      </div>
      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${level.color}88, ${level.color})`,
            boxShadow: `0 0 10px ${level.color}44`,
          }}
        />
      </div>
      <div className="xp-bar-labels">
        <span>{level.minXP}</span>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{pct}% through level</span>
        <span>{level.maxXP === Infinity ? `${level.minXP}+` : level.maxXP}</span>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────── */
export default function ProgressPage({
  savedPlan,
  history,
  xp = 0,
  completedQuests = [],
  habitContract,
  onViewChange,
  sidebarOpen,
  onToggleSidebar,
  isMobile,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const streak = useMemo(() => calculateStreak(history || []), [history]);
  const daysPerWeek = habitContract?.daysPerWeek ?? 3;

  const totalStats = useMemo(() => {
    let sets = 0, reps = 0, mins = 0;
    (history ?? []).forEach(h => {
      sets += h.totalSets ?? 0;
      reps += h.totalReps ?? 0;
      mins += Math.round((h.elapsed ?? 0) / 60);
    });
    return { sets, reps, mins };
  }, [history]);

  const completedDays = useMemo(() => savedPlan?.filter(d => d.completed) ?? [], [savedPlan]);

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

  const consistentWeeks = useMemo(() => {
    if (!history || history.length === 0) return 0;
    const weekMap = {};
    history.forEach(h => {
      const date = new Date(h.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    });
    return Object.values(weekMap).filter(count => count >= daysPerWeek).length;
  }, [history, daysPerWeek]);

  // Momentum message
  const momentumMsg = useMemo(() => {
    if (streak === 0 && (history?.length ?? 0) === 0) return null;
    if (streak >= 14) return { icon: null, text: `${streak}-day streak — you're on fire! Don't stop now.`, accent: '#f97316' };
    if (streak >= 7)  return { icon: null, text: `${streak}-day streak — incredible consistency!`, accent: '#f59e0b' };
    if (streak >= 3)  return { icon: null, text: `${streak}-day streak — you're building momentum!`, accent: '#4ade80' };
    if (streak >= 1)  return { icon: null, text: `${streak}-day streak — keep showing up!`, accent: '#4ade80' };
    return { icon: null, text: "Ready to start a new streak?", accent: '#9ca3af' };
  }, [streak, history]);

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
          <p className="inner-page-subtitle">Your habit, week by week.</p>
        </div>

        {/* ── Momentum message ── */}
        {momentumMsg && (
          <div className="prog-momentum-msg" style={{ borderLeftColor: momentumMsg.accent }}>
            <span style={{ fontSize: '1.2rem' }}>{momentumMsg.icon}</span>
            <span style={{ color: momentumMsg.accent, fontWeight: '600', fontSize: '0.9rem' }}>{momentumMsg.text}</span>
          </div>
        )}

        {/* ── Hero: Weekly habit ring + stats ── */}
        <div className="prog-hero-row">
          <div className="prog-habit-hero">
            <div className="prog-habit-hero-label">This Week's Habit</div>
            <WeeklyHabitRing
              history={history || []}
              daysPerWeek={daysPerWeek}
              startDate={habitContract?.confirmedAt}
              size="lg"
              showLabel
            />
          </div>

          <div className="prog-stats-grid">
            {[
              { label: 'Day Streak', value: streak, unit: streak === 1 ? 'day' : 'days', icon: Flame, accent: streak > 0 },
              { label: 'Sessions Done', value: history?.length ?? 0, unit: 'total', icon: CheckCircle, accent: false },
              { label: 'Consistent Weeks', value: consistentWeeks, unit: 'weeks', icon: TrendingUp, accent: false },
              { label: 'Time Trained', value: totalStats.mins, unit: 'min', icon: Clock, accent: false },
            ].map(s => {
              const IconComponent = s.icon;
              return (
                <div key={s.label} className={`prog-stat-card ${s.accent ? 'prog-stat-accent' : ''}`}>
                  <IconComponent className="prog-stat-icon" size={22} />
                  <div className="prog-stat-val">
                    {s.value}<span className="prog-stat-unit"> {s.unit}</span>
                  </div>
                  <div className="prog-stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Week consistency timeline ── */}
        {history && history.length > 0 && (
          <div className="prog-section-card">
            <WeekConsistencyBar history={history} daysPerWeek={daysPerWeek} startDate={habitContract?.confirmedAt} />
          </div>
        )}

        {/* ── XP Level bar ── */}
        <XPLevelBar xp={xp} />

        {/* ── Heatmap ── */}
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

        {/* ── Muscle Coverage ── */}
        <div className="prog-section-card">
          <div className="prog-section-header">
            <span className="prog-section-title">Muscles Trained</span>
            <span className="prog-section-sub">Across {completedDays.length} completed session{completedDays.length !== 1 ? 's' : ''}</span>
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
      </div>
    </DashboardLayout>
  );
}
