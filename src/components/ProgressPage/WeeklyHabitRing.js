import React, { useMemo } from 'react';

export default function WeeklyHabitRing({
  history = [],
  daysPerWeek = 3,
  startDate,
  size = 'md',
  showLabel = true,
}) {
  const { completed, slots, slotLabels, todaySlotIdx } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const anchorDOW = 1; 

    const todayDOW = today.getDay();
    const daysBack = (todayDOW - anchorDOW + 7) % 7;
    const windowStart = new Date(today);
    windowStart.setDate(today.getDate() - daysBack);

    const toLocalISO = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const slots = [];
    const slotLabels = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(windowStart);
      d.setDate(windowStart.getDate() + i);
      slots.push(toLocalISO(d));
      slotLabels.push(DOW[d.getDay()]);
    }

    const histSet = new Set((history || []).map(h => h.date));
    const todayStr = toLocalISO(today);
    const todaySlotIdx = slots.indexOf(todayStr);
    const completed = slots.filter(d => histSet.has(d)).length;

    return { completed, slots, slotLabels, todaySlotIdx };
  }, [history]);

  const historyDates = useMemo(() => new Set((history || []).map(h => h.date)), [history]);
  const isComplete = completed >= daysPerWeek;

  
  const cfg = {
    sm: { r: 32, strokeW: 6,  size: 80,  fontSize: '1rem',   subSize: '0.6rem' },
    md: { r: 48, strokeW: 8,  size: 112, fontSize: '1.5rem', subSize: '0.7rem' },
    lg: { r: 60, strokeW: 10, size: 136, fontSize: '1.9rem', subSize: '0.75rem' },
  }[size] || { r: 48, strokeW: 8, size: 112, fontSize: '1.5rem', subSize: '0.7rem' };

  const circumference = 2 * Math.PI * cfg.r;
  const pct = Math.min(1, completed / Math.max(1, daysPerWeek));
  const strokeOffset = circumference - circumference * pct;

  const dotSize = size === 'sm' ? 14 : 18;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>

      
      <div style={{ position: 'relative', width: cfg.size, height: cfg.size, flexShrink: 0 }}>
        <svg width={cfg.size} height={cfg.size} viewBox={`0 0 ${cfg.size} ${cfg.size}`}>
          <circle
            cx={cfg.size / 2} cy={cfg.size / 2} r={cfg.r}
            fill="none" stroke="var(--border-subtle)" strokeWidth={cfg.strokeW}
          />
          <circle
            cx={cfg.size / 2} cy={cfg.size / 2} r={cfg.r}
            fill="none" stroke="var(--accent-success)" strokeWidth={cfg.strokeW}
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
            <span style={{ fontSize: cfg.fontSize, lineHeight: 1, color: 'var(--accent-success)' }}>✓</span>
          ) : (
            <>
              <span style={{ fontSize: cfg.fontSize, fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                {completed}
              </span>
              <span style={{ fontSize: cfg.subSize, color: 'var(--text-muted)', marginTop: '2px' }}>
                of {daysPerWeek}
              </span>
            </>
          )}
        </div>
      </div>

      
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
                  ? 'var(--accent-success)'
                  : isToday ? 'transparent' : 'var(--border-subtle)',
                border: isToday && !done ? '1.5px solid var(--text-muted)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isFuture ? 0.35 : 1,
                transition: 'all 0.2s ease',
              }}>
                {done && (
                  <svg width={dotSize * 0.55} height={dotSize * 0.55} viewBox="0 0 10 10" fill="none">
                    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="var(--bg-surface)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {showLabel && (
                <span style={{
                  fontSize: '0.55rem',
                  fontWeight: isToday ? '700' : '400',
                  color: isToday ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}>
                  {slotLabels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      
      {showLabel && (
        <div style={{ textAlign: 'center' }}>
          {isComplete ? (
            <span style={{
              fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent-success)',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              ✦ Week Complete!
            </span>
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {daysPerWeek - completed} session{daysPerWeek - completed !== 1 ? 's' : ''} left this week
            </span>
          )}
        </div>
      )}
    </div>
  );
}
