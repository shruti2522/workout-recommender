import React, { useMemo } from 'react';

/**
 * WeeklyHabitRing
 * Shows habit completion using a rolling 7-day window anchored to the
 * user's onboarding day-of-week (from habitContract.confirmedAt).
 *
 * Industry strategy: apps like Duolingo and Streaks anchor the week to the
 * user's join day rather than a fixed calendar boundary. This avoids the
 * demoralising "0/N" reset when someone joins mid-week (e.g. on a Friday).
 * Their window is always Fri→Thu, every reset feels earned.
 *
 * Props:
 *  history     — full workout history array ({ date: 'YYYY-MM-DD' })
 *  daysPerWeek — sessions committed per 7-day window
 *  startDate   — ISO date string from habitContract.confirmedAt
 *  size        — 'sm' | 'md' | 'lg'  (default 'md')
 *  showLabel   — render text summary below ring
 */
export default function WeeklyHabitRing({
  history = [],
  daysPerWeek = 3,
  startDate,
  size = 'md',
  showLabel = true,
}) {
  const { completed, slots, todaySlotIdx } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Industry strategy: Monday reset
    const anchorDOW = 1; // Monday

    // Roll back to the most recent anchorDOW at or before today
    const todayDOW = today.getDay();
    const daysBack = (todayDOW - anchorDOW + 7) % 7;
    const windowStart = new Date(today);
    windowStart.setDate(today.getDate() - daysBack);

    const slots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(windowStart);
      d.setDate(windowStart.getDate() + i);
      return d.toISOString().slice(0, 10);
    });

    const histSet = new Set((history || []).map(h => h.date));
    const todayStr = today.toISOString().slice(0, 10);
    const todaySlotIdx = slots.indexOf(todayStr);
    const completed = slots.filter(d => histSet.has(d)).length;

    return { completed, slots, todaySlotIdx };
  }, [history, startDate]);

  const historyDates = useMemo(() => new Set((history || []).map(h => h.date)), [history]);
  const isComplete = completed >= daysPerWeek;

  // Size config
  const cfg = {
    sm: { r: 32, strokeW: 6,  size: 80,  fontSize: '1rem',   subSize: '0.6rem' },
    md: { r: 48, strokeW: 8,  size: 112, fontSize: '1.5rem', subSize: '0.7rem' },
    lg: { r: 60, strokeW: 10, size: 136, fontSize: '1.9rem', subSize: '0.75rem' },
  }[size] || { r: 48, strokeW: 8, size: 112, fontSize: '1.5rem', subSize: '0.7rem' };

  const circumference = 2 * Math.PI * cfg.r;
  const pct = Math.min(1, completed / Math.max(1, daysPerWeek));
  const strokeOffset = circumference - circumference * pct;

  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const slotLabels = slots.map(d => DOW[new Date(d).getDay()]);
  const dotSize = size === 'sm' ? 14 : 18;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>

      {/* ── Progress ring ── */}
      <div style={{ position: 'relative', width: cfg.size, height: cfg.size, flexShrink: 0 }}>
        <svg width={cfg.size} height={cfg.size} viewBox={`0 0 ${cfg.size} ${cfg.size}`}>
          <circle
            cx={cfg.size / 2} cy={cfg.size / 2} r={cfg.r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={cfg.strokeW}
          />
          <circle
            cx={cfg.size / 2} cy={cfg.size / 2} r={cfg.r}
            fill="none" stroke="#4ade80" strokeWidth={cfg.strokeW}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            style={{
              transform: `rotate(-90deg)`,
              transformOrigin: `${cfg.size / 2}px ${cfg.size / 2}px`,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {isComplete ? (
            <span style={{ fontSize: cfg.fontSize, lineHeight: 1 }}>✓</span>
          ) : (
            <>
              <span style={{ fontSize: cfg.fontSize, fontWeight: '800', color: '#fff', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                {completed}
              </span>
              <span style={{ fontSize: cfg.subSize, color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                of {daysPerWeek}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Day slots — clean dots, no glow ── */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {slots.map((date, i) => {
          const done = historyDates.has(date);
          const isToday = i === todaySlotIdx;
          const isFuture = todaySlotIdx >= 0 && i > todaySlotIdx;

          return (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: dotSize, height: dotSize, borderRadius: '50%',
                background: done
                  ? '#4ade80'
                  : isToday ? 'transparent' : 'rgba(255,255,255,0.1)',
                border: isToday && !done ? '1.5px solid rgba(255,255,255,0.55)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isFuture ? 0.35 : 1,
                transition: 'all 0.2s ease',
              }}>
                {done && (
                  <svg width={dotSize * 0.55} height={dotSize * 0.55} viewBox="0 0 10 10" fill="none">
                    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {showLabel && (
                <span style={{
                  fontSize: '0.55rem',
                  fontWeight: isToday ? '700' : '400',
                  color: isToday ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)',
                }}>
                  {slotLabels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Status label ── */}
      {showLabel && (
        <div style={{ textAlign: 'center' }}>
          {isComplete ? (
            <span style={{
              fontSize: '0.72rem', fontWeight: '700', color: '#4ade80',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
              padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              ✦ Week Complete!
            </span>
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
              {daysPerWeek - completed} session{daysPerWeek - completed !== 1 ? 's' : ''} left this week
            </span>
          )}
        </div>
      )}
    </div>
  );
}
