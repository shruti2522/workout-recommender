import React from 'react';
import { getLevelProgress } from '../utils/gamification';
import { Zap, Flame, Sword, Trophy, Leaf } from 'lucide-react';

const ICON_MAP = {
  'seedling': Leaf,
  'zap': Zap,
  'flame': Flame,
  'sword': Sword,
  'trophy': Trophy,
};

export default function XPBar({ xp = 0, collapsed = false }) {
  const { level, pct, current, needed } = getLevelProgress(xp);
  const Icon = ICON_MAP[level.icon] || Trophy;

  if (collapsed) {
    return (
      <div style={{
        marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: level.color,
        }} title={level.name}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>L{level.index + 1}</span>
      </div>
    );

  }

  return (
    <div style={{
      margin: '12px 8px 0', padding: '10px 12px',
      background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: level.color, flexShrink: 0,
        }}>
          <Icon size={14} strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: level.color }}>
              Lv.{level.index + 1} {level.name}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {current}{needed > 0 ? ` / ${needed}` : ''} XP
            </span>
          </div>
        </div>
      </div>
      {needed > 0 && (
        <div style={{ height: '4px', background: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: level.color,
            borderRadius: '2px', transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </div>
      )}
    </div>
  );
}
