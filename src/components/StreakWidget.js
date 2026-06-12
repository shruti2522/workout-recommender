import React from 'react';
import { Flame, CheckCircle2 } from 'lucide-react';

const STREAK_STATES = [
  { min: 0,  max: 0,  label: 'Start your streak!',  color: '#94a3b8',         bg: '#f1f5f9' },
  { min: 1,  max: 2,  label: 'Getting warmed up…',  color: '#f59e0b',         bg: '#fef3c7' },
  { min: 3,  max: 6,  label: 'You\'re on a roll!',  color: '#f97316',         bg: '#ffedd5' },
  { min: 7,  max: 13, label: 'On fire! Keep it up', color: '#ef4444',         bg: '#fee2e2' },
  { min: 14, max: 29, label: 'Unstoppable force',   color: '#ea580c',        bg: '#ffedd5' },
  { min: 30, max: Infinity, label: 'LEGENDARY streak', color: '#00e676', bg: 'rgba(0, 230, 118, 0.1)' },
];

function getStreakState(streak) {
  return STREAK_STATES.find(s => streak >= s.min && streak <= s.max) || STREAK_STATES[0];
}

export default function StreakWidget({ streak = 0, workedOutToday = false, compact = false }) {
  const state = getStreakState(streak);

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: state.bg, border: `1px solid ${state.color}33`,
        borderRadius: '20px', padding: '4px 10px 4px 8px',
      }}>
        <Flame size={13} strokeWidth={2.5} color={streak === 0 ? '#94a3b8' : state.color} style={{ fill: streak > 2 ? `${state.color}33` : 'none' }} />
        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: streak === 0 ? '#94a3b8' : state.color }}>
          {streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : '0'}
        </span>
        {workedOutToday && (
          <CheckCircle2 size={11} color="var(--accent-success)" />
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: '16px 20px',
      marginBottom: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '12px',
        background: state.bg, color: state.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Flame size={28} strokeWidth={2.5} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontSize: '2rem', fontWeight: '800', lineHeight: 1,
            color: streak === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
          }}>
            {streak}
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            day streak
          </span>
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {state.label}
        </p>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0,
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: workedOutToday ? 'var(--accent-success)' : 'var(--bg-elevated)',
          color: workedOutToday ? '#fff' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s',
        }}>
          {workedOutToday ? <CheckCircle2 size={20} /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid currentColor', opacity: 0.5 }} />}
        </div>
        <span style={{ fontSize: '0.65rem', fontWeight: '700', color: workedOutToday ? 'var(--accent-success)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {workedOutToday ? 'Done!' : 'Today'}
        </span>
      </div>
      {streak > 0 && streak < 30 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0,
          paddingLeft: '14px', borderLeft: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Next</span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {streak < 3 ? 3 : streak < 7 ? 7 : streak < 14 ? 14 : 30}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {(streak < 3 ? 3 : streak < 7 ? 7 : streak < 14 ? 14 : 30) - streak}d away
          </span>
        </div>
      )}
    </div>
  );
}
