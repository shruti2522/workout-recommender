import React, { useEffect, useState } from 'react';
import { RARITY_STYLES } from '../utils/gamification';
import { Flame, Activity, Calendar, Dumbbell, Target, Shield, Thermometer, Star, Sunrise, Zap, Crown, RefreshCw } from 'lucide-react';

const ICON_MAP = {
  'flame': Flame,
  'activity': Activity,
  'calendar': Calendar,
  'dumbbell': Dumbbell,
  'target': Target,
  'shield': Shield,
  'thermometer': Thermometer,
  'star': Star,
  'sunrise': Sunrise,
  'zap': Zap,
  'crown': Crown,
  'refresh-cw': RefreshCw,
};

export default function BadgeToast({ badge, onClose }) {

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {

    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 400); 
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!badge) return null;

  const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
  const Icon = ICON_MAP[badge.icon] || Star;

  return (
    <div style={{
      position: 'fixed', bottom: '30px', left: '50%',
      transform: isVisible ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, 40px) scale(0.9)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      background: 'var(--bg-surface)',
      border: `1px solid ${style.border}`,
      borderRadius: 'var(--radius-lg)', padding: '16px 24px',
      display: 'flex', alignItems: 'center', gap: '20px',
      boxShadow: 'var(--shadow-lift)',
      zIndex: 9999,
      pointerEvents: 'auto', cursor: 'pointer',
    }}
    onClick={() => setIsVisible(false)}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: style.color, flexShrink: 0, border: `1px solid ${style.border}`
      }}>
        <Icon size={24} strokeWidth={2.5} />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', color: style.color }}>
            Achievement Unlocked
          </span>
          <span style={{ fontSize: '0.6rem', background: style.bg, color: style.color, padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
            {style.label}
          </span>
        </div>
        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          {badge.name}
        </h4>
        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {badge.desc}
        </p>
      </div>
    </div>
  );
}
