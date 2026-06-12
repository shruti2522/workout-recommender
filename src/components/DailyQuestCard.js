import React, { useState } from 'react';
import { Check, Trophy } from 'lucide-react';

export default function DailyQuestCard({ quest, isDone, onComplete, compact = false }) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCheck = () => {
    if (isDone || isCompleting) return;
    setIsCompleting(true);
    setTimeout(() => {
      if (onComplete) onComplete(quest.id);
      setIsCompleting(false);
    }, 600);
  };

  if (compact) {
    return (
      <div
        onClick={!quest.autoComplete ? handleCheck : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 10px', borderRadius: '9px',
          background: isDone ? 'var(--bg-elevated)' : 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          cursor: (!isDone && !quest.autoComplete) ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          transform: isCompleting ? 'scale(0.97)' : 'scale(1)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0,
          background: isDone ? 'var(--accent-success)' : 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isDone ? '#fff' : 'var(--text-muted)',
        }}>
          {isDone ? <Check size={13} strokeWidth={3} /> : <Trophy size={13} strokeWidth={2.5} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: '0.78rem', fontWeight: '600',
            color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: isDone ? 'line-through' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {quest.title}
          </p>
        </div>
        <span style={{
          fontSize: '0.65rem', fontWeight: '700',
          color: isDone ? 'var(--text-muted)' : '#d97706',
          flexShrink: 0,
        }}>
          +{quest.xp}
        </span>
        {isCompleting && (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--accent-success)', opacity: 0, animation: 'flashComplete 0.6s ease-out forwards', pointerEvents: 'none' }} />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={!quest.autoComplete ? handleCheck : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '12px 16px', borderRadius: 'var(--radius-lg)',
        background: isDone ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: isDone ? '1px solid var(--border-subtle)' : '1px solid var(--border-subtle)',
        cursor: (!isDone && !quest.autoComplete) ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: isCompleting ? 'scale(0.98)' : 'scale(1)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: isDone ? 'var(--accent-success)' : 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isDone ? '#fff' : 'var(--text-secondary)',
        transition: 'all 0.3s', flexShrink: 0,
      }}>
        {isDone ? <Check size={20} strokeWidth={3} /> : <Trophy size={18} strokeWidth={2.5} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <h4 style={{
            margin: 0, fontSize: '0.9rem', fontWeight: '700',
            color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
            textDecoration: isDone ? 'line-through' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {quest.title}
          </h4>
          {quest.autoComplete && !isDone && (
            <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'var(--bg-base)', borderRadius: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Auto
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {quest.desc}
        </p>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: isDone ? 'var(--bg-elevated)' : '#fef3c7',
        border: `1px solid ${isDone ? 'var(--border-subtle)' : '#fde68a'}`,
        padding: '4px 10px', borderRadius: '20px', flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: isDone ? 'var(--text-secondary)' : '#d97706' }}>
          +{quest.xp} XP
        </span>
      </div>
      {isCompleting && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--accent-success)',
          opacity: 0, animation: 'flashComplete 0.6s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

    </div>
  );
}
