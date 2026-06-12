import React, { useEffect, useState, useMemo } from 'react';
import { calculateStreak, XP_PER_SESSION, getLevelProgress } from '../../utils/xp';

/* ── Confetti particle ──────────────────────────────────────────────── */
function Particle({ style }) {
  return <div className="confetti-particle" style={style} />;
}

function Confetti() {
  const particles = useMemo(() => {
    const colors = ['#4ade80', '#ffffff', '#f59e0b', '#7c3aed', '#0ea5e9', '#f97316'];
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 0.8}s`,
      animationDuration: `${1.2 + Math.random() * 0.8}s`,
      background: colors[i % colors.length],
      width: `${4 + Math.random() * 6}px`,
      height: `${4 + Math.random() * 6}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }));
  }, []);

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map(p => (
        <Particle key={p.id} style={{
          left: p.left,
          animationDelay: p.animationDelay,
          animationDuration: p.animationDuration,
          background: p.background,
          width: p.width,
          height: p.height,
          borderRadius: p.borderRadius,
        }} />
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function WorkoutComplete({
  elapsed,
  dayLabel,
  onBackToPlan,
  onHome,
  onViewChange,
  history = [],
  savedPlan = null,
  xp = 0,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  }

  const streak = useMemo(() => calculateStreak(history), [history]);

  // Weekly habit count
  const { thisWeekCount, daysCommitted } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    const startStr = weekStart.toISOString().slice(0, 10);
    const count = (history || []).filter(h => h.date >= startStr).length;
    return { thisWeekCount: count, daysCommitted: 3 }; // default committed days
  }, [history]);

  // XP gained this session
  const xpGained = XP_PER_SESSION;
  const { level } = getLevelProgress(xp);

  // Next incomplete day in plan
  const nextDay = useMemo(() => {
    if (!savedPlan) return null;
    return savedPlan.find(d => !d.completed && d.label !== dayLabel) || null;
  }, [savedPlan, dayLabel]);

  const weekComplete = thisWeekCount >= daysCommitted;

  return (
    <div className="complete-page animate-fade-in">
      {visible && <Confetti />}

      <div className={`complete-card ${visible ? 'visible' : ''}`}>

        {/* ── Trophy icon ── */}
        <div className="complete-trophy-wrap">
          <div className="complete-trophy-ring">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <h1 className="complete-title">Session Done!</h1>
        <p className="complete-day-label">{dayLabel}</p>

        {/* ── XP gain banner ── */}
        <div className="complete-xp-banner">
          <span className="complete-xp-pill">+{xpGained} XP</span>
          <span className="complete-xp-level">Lv.{level.index + 1} {level.name}</span>
        </div>

        {/* ── Stats row ── */}
        <div className="complete-stats">
          <div className="complete-stat">
            <span className="complete-stat-value">{formatTime(elapsed)}</span>
            <span className="complete-stat-label">Duration</span>
          </div>
          <div className="complete-stat-divider" />
          <div className="complete-stat">
            <span className="complete-stat-value" style={{ color: streak > 0 ? '#f97316' : 'inherit' }}>
              {streak > 0 ? `${streak}` : '–'}
            </span>
            <span className="complete-stat-label">Day Streak</span>
          </div>
          <div className="complete-stat-divider" />
          <div className="complete-stat">
            <span className="complete-stat-value" style={{ color: '#4ade80' }}>
              {thisWeekCount}/{daysCommitted}
            </span>
            <span className="complete-stat-label">This Week</span>
          </div>
        </div>

        {/* ── Week habit status ── */}
        {weekComplete ? (
          <div className="complete-week-banner complete-week-done">
            <span>✦</span>
            <span>Week target complete — you crushed it!</span>
            <span>✦</span>
          </div>
        ) : (
          <div className="complete-week-banner">
            <span>
              {daysCommitted - thisWeekCount} more session{daysCommitted - thisWeekCount !== 1 ? 's' : ''} to hit your weekly goal
            </span>
          </div>
        )}

        {/* ── Streak message ── */}
        {streak >= 3 && (
          <p className="complete-streak-msg">
            {streak > 7 
              ? `${streak}-day streak — you're unstoppable!`
              : streak > 3
              ? `${streak}-day streak — incredible momentum!`
              : `${streak}-day streak — keep the chain going!`}
          </p>
        )}

        {/* ── Next session preview ── */}
        {nextDay && (
          <div className="complete-next-preview">
            <div className="complete-next-label">Up next</div>
            <div className="complete-next-name">{nextDay.label}</div>
            <div className="complete-next-meta">
              {nextDay.exercises?.length ?? 0} exercises
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="complete-actions">
          <button
            id="back-to-plan-btn"
            className="btn btn-primary btn-lg"
            onClick={onBackToPlan}
          >
            ← Back to Plan
          </button>
          {onViewChange && (
            <button
              className="btn btn-secondary"
              onClick={() => onViewChange('progress')}
            >
              View Progress
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={onHome}
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
