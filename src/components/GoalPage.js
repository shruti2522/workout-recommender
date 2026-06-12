import React, { useMemo, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { getLevelProgress, ALL_BADGES, RARITY_STYLES } from '../utils/gamification';
import { Flame, Activity, Calendar, Dumbbell, Target, Shield, Thermometer, Star, Sunrise, Zap, Crown, RefreshCw, CheckCircle, Flame as FlameIcon, User, Crosshair, Wrench, ShieldAlert, RefreshCcw } from 'lucide-react';

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

const GOAL_META = {
  build_muscle:         { label: 'Build Muscle',        icon: Dumbbell, color: '#7c3aed' },
  lose_weight:          { label: 'Lose Weight',          icon: Flame, color: '#dc2626' },
  improve_endurance:    { label: 'Improve Endurance',    icon: Activity, color: '#0284c7' },
  increase_flexibility: { label: 'Increase Flexibility', icon: Target, color: '#059669' },
  general_fitness:      { label: 'General Fitness',      icon: Zap, color: '#d97706' },
};

const AREA_META = {
  upper_body: { label: 'Upper Body',  muscles: 'Chest, Back, Shoulders & Arms' },
  lower_body: { label: 'Lower Body',  muscles: 'Quads, Hamstrings, Glutes & Calves' },
  core:       { label: 'Core & Abs',  muscles: 'Abdominals, Obliques & Stability' },
  full_body:  { label: 'Full Body',   muscles: 'Balanced across all muscle groups' },
};

const FREQ_LABELS = {
  never:     'New to training',
  rarely:    '1–2× / week',
  sometimes: '2–3× / week',
  often:     '4–5× / week',
  daily:     '6–7× / week',
};

const DURATION_LABELS = {
  under_3: 'Under 3 months',
  '3_12':  '3–12 months',
  '1_3':   '1–3 years',
  over_3:  '3+ years',
};


function getHabitMilestones(goalKey, currentStreak, totalSessions, consistentWeeks) {
  const shortTermMap = {
    build_muscle:         ['First workout complete', 'Hit a 5-day streak', '10 strength sessions', 'First consistent week'],
    lose_weight:          ['First cardio session', 'Hit a 7-day streak', 'Complete 1 consistent week', 'Hit 15 sessions all-time'],
    improve_endurance:    ['First endurance session', 'Hit a 7-day streak', 'Complete 1 consistent week', '10 endurance sessions'],
    increase_flexibility: ['First stretching session', 'Hit a 3-day streak', 'Complete 1 consistent week', '5 flexibility sessions'],
    general_fitness:      ['First workout complete', 'Hit a 5-day streak', 'Complete 1 consistent week', '10 total sessions'],
  };
  const longTermMap = {
    build_muscle:         ['3 consistent weeks', '30-day streak', '50 strength sessions', 'Advanced fitness level'],
    lose_weight:          ['3 consistent weeks', '30-day streak', '50 cardio sessions', 'Reached fitness goal'],
    improve_endurance:    ['3 consistent weeks', '30-day streak', '40 endurance sessions', 'Doubled capacity'],
    increase_flexibility: ['3 consistent weeks', '30-day streak', '30 flexibility sessions', 'Full mobility'],
    general_fitness:      ['3 consistent weeks', '30-day streak', '50 total sessions', 'Advanced program'],
  };

  const shortGoals = (shortTermMap[goalKey] || shortTermMap.general_fitness).map((text, i) => {
    let done = false;
    if (i === 0) done = totalSessions >= 1;
    else if (i === 1) done = currentStreak >= 5;
    else if (i === 2) {
      if (goalKey === 'lose_weight' || goalKey === 'improve_endurance') done = totalSessions >= 15;
      else done = totalSessions >= 10;
    }
    else if (i === 3) done = consistentWeeks >= 1;
    
    return { text, done, milestone: `Milestone ${i + 1}` };
  });

  const longGoals = (longTermMap[goalKey] || longTermMap.general_fitness).map((text, i) => {
    let done = false;
    if (i === 0) done = consistentWeeks >= 3;
    else if (i === 1) done = currentStreak >= 30;
    else if (i === 2) {
      if (goalKey === 'lose_weight') done = totalSessions >= 50;
      else if (goalKey === 'improve_endurance') done = totalSessions >= 40;
      else if (goalKey === 'increase_flexibility') done = totalSessions >= 30;
      else done = totalSessions >= 50;
    }
    else if (i === 3) done = true;
    
    return { text, done, milestone: `Milestone ${i + 1}` };
  });

  return { shortGoals, longGoals };
}

export default function GoalPage({ 
  prefs, 
  savedPlan, 
  habitContract,
  momentum = {},
  history = [],
  streak = 0,
  onReset, 
  onViewChange, 
  sidebarOpen, 
  onToggleSidebar, 
  isMobile, 
  onOpenSidebar, 
  onCloseSidebar, 
  unlockedBadgeIds = [], 
  xp = 0 
}) {
  const [activeGoalTab, setActiveGoalTab] = useState('short');

  const { level } = getLevelProgress(xp);
  const goalMeta = GOAL_META[prefs?.goal] || { label: prefs?.goal || 'Not set', icon: Target, color: '#64748b' };

  
  const totalSessions = history?.length ?? 0;
  const currentStreak = streak || 0;
  
  
  const daysPerWeek = habitContract?.daysPerWeek ?? parseInt(prefs?.frequency) ?? 3;
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

  
  const ringPct = totalSessions > 0 ? Math.min(100, Math.round((currentStreak / 30) * 100)) : 0; 
  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (circumference * ringPct) / 100;

  const totalExercises = useMemo(() => {
    if (!savedPlan) return 0;
    return savedPlan.reduce((sum, d) => sum + (d.exercises?.length ?? 0), 0);
  }, [savedPlan]);

  const targetAreas = prefs?.targetAreas ?? [];
  const injuries = prefs?.injuries ?? [];

  const { shortGoals, longGoals } = getHabitMilestones(prefs?.goal, currentStreak, totalSessions, consistentWeeks);
  const shortDone = shortGoals.filter(g => g.done).length;
  const longDone = longGoals.filter(g => g.done).length;

  return (
    <DashboardLayout
      activeTab="goal"
      onViewChange={onViewChange}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
      isMobile={isMobile}
      onOpenSidebar={onOpenSidebar}
      onCloseSidebar={onCloseSidebar}
    >
      <div className="inner-page animate-fade-in">

        {/* Header */}
        <div className="inner-page-header">
          <h1 className="inner-page-title">Your Goal</h1>
          <p className="inner-page-subtitle">Personalised training profile, objectives & milestones.</p>
        </div>

        {/* Hero Goal Card */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)', padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px', position: 'relative', overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0, color: 'var(--text-primary)' }}>
              <Target size={32} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '700' }}>Primary Goal</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{goalMeta.label}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Week {habitContract?.weekNumber ?? 1} · {totalSessions} sessions all-time
              </div>
              
              {/* Level indicator within hero */}
              <div style={{
                marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: '20px',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>Lv.{level.index + 1} {level.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {xp} XP</span>
              </div>
            </div>
          </div>

          {/* Ring — showing streak out of 30 days */}
          <div style={{ position: 'relative', width: '128px', height: '128px', flexShrink: 0, zIndex: 1 }}>
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
              <circle cx="64" cy="64" r="54" fill="none" stroke="var(--accent-success)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px', transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{currentStreak}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>day streak</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Total Sessions', value: totalSessions, icon: Calendar, accent: false },
            { label: 'Current Streak', value: currentStreak, icon: FlameIcon, accent: true },
            { label: 'Consistent Weeks', value: consistentWeeks, icon: CheckCircle, accent: false },
            { label: 'Exercises', value: totalExercises, icon: Dumbbell, accent: false },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                background: s.accent ? '#d1fae5' : 'var(--bg-surface)',
                border: s.accent ? '1px solid #00e676' : '1px solid var(--border-subtle)',
                borderRadius: '16px', padding: '18px 16px', textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{ marginBottom: '8px', color: s.accent ? '#059669' : 'var(--text-muted)', display: 'flex', justifyContent: 'center' }}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.accent ? '#065f46' : 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: s.accent ? '#059669' : 'var(--text-muted)', marginTop: '3px', fontWeight: '600' }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Goals Section — Short & Long Term */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Milestones & Goals</h2>
            {/* Tab switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
              {[{ key: 'short', label: 'Short-term', done: shortDone, total: shortGoals.length }, { key: 'long', label: 'Long-term', done: longDone, total: longGoals.length }].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveGoalTab(tab.key)}
                  style={{
                    padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontWeight: '600', fontSize: '0.82rem', transition: 'all 0.2s',
                    background: activeGoalTab === tab.key ? 'var(--bg-surface)' : 'transparent',
                    color: activeGoalTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: activeGoalTab === tab.key ? 'var(--shadow-card)' : 'none',
                  }}
                >
                  {tab.label} <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>({tab.done}/{tab.total})</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(activeGoalTab === 'short' ? shortGoals : longGoals).map((goal, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: goal.done ? '#f0fdf4' : 'var(--bg-surface)',
                  border: goal.done ? '1px solid #00e676' : '1px solid var(--border-subtle)',
                  borderRadius: '14px', padding: '16px 20px',
                  transition: 'all 0.2s',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: goal.done ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  border: goal.done ? '2px solid var(--accent-primary)' : '2px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: '#000', fontWeight: '700',
                }}>
                  {goal.done ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0, fontSize: '0.9rem', fontWeight: '500',
                    color: goal.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: goal.done ? 'line-through' : 'none',
                  }}>{goal.text}</p>
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: '700',
                  color: goal.done ? 'var(--accent-primary)' : 'var(--text-muted)',
                  background: goal.done ? '#d1fae5' : 'var(--bg-elevated)',
                  padding: '3px 10px', borderRadius: '20px', flexShrink: 0,
                }}>
                  {goal.milestone}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Collection Section */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Achievements</h2>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {unlockedBadgeIds.length} / {ALL_BADGES.length} unlocked
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {ALL_BADGES.map(badge => {
              const isUnlocked = unlockedBadgeIds.includes(badge.id);
              const style = RARITY_STYLES[badge.rarity];
              const BadgeIcon = ICON_MAP[badge.icon] || Star;
              
              return (
                <div key={badge.id} style={{
                  background: isUnlocked ? style.bg : 'var(--bg-surface)',
                  border: isUnlocked ? `1px solid ${style.border}` : '1px solid var(--border-subtle)',
                  borderRadius: '16px', padding: '16px 12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  opacity: isUnlocked ? 1 : 0.6,
                  filter: isUnlocked ? 'none' : 'grayscale(100%)',
                  transition: 'all 0.2s', position: 'relative',
                  boxShadow: isUnlocked ? 'var(--shadow-card)' : 'none',
                }} title={badge.desc}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: isUnlocked ? style.bg : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '10px', color: isUnlocked ? style.color : 'var(--text-muted)',
                    border: isUnlocked ? `1px solid ${style.border}` : 'none'
                  }}>
                    <BadgeIcon size={24} strokeWidth={2.5} />
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.8rem', fontWeight: '700', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {badge.name}
                  </h4>
                  <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isUnlocked ? style.color : 'var(--text-muted)', fontWeight: '800' }}>
                    {badge.unlockPoints || style.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom grid — training profile + focus areas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {/* Training Profile */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} /> Training Profile
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {prefs?.frequency && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Frequency</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{FREQ_LABELS[prefs.frequency] ?? prefs.frequency}</span>
                </div>
              )}
              {prefs?.duration && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Training Experience</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{DURATION_LABELS[prefs.duration] ?? prefs.duration}</span>
                </div>
              )}
              {prefs?.daysPerWeek && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Days per Week</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{prefs.daysPerWeek} days</span>
                </div>
              )}
              {prefs?.sessionDuration && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', padding: '6px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Session Length</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{prefs.sessionDuration.replace('_', '–')} min</span>
                </div>
              )}
            </div>
          </div>

          {/* Focus Areas */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Crosshair size={14} /> Focus Areas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {targetAreas.length > 0 ? targetAreas.map(key => {
                const meta = AREA_META[key] ?? { label: key, icon: '●', muscles: '' };
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{meta.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meta.muscles}</div>
                    </div>
                  </div>
                );
              }) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No specific areas selected — full body training.</p>}
            </div>
          </div>

          {/* Equipment */}
          {prefs?.equipment?.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={14} /> Equipment Available
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {prefs.equipment.map(e => (
                  <span key={e} style={{ padding: '4px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Injuries */}
          {injuries.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} /> Excluded Areas (Injuries)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {injuries.map(inj => (
                  <span key={inj} style={{ padding: '4px 12px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '20px', fontSize: '0.82rem', color: '#dc2626', fontWeight: '500' }}>
                    {inj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => onViewChange('results')}>
            View My Plan
          </button>
          <button className="btn btn-secondary" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCcw size={16} /> Rebuild Plan
          </button>
        </div>
      </div>

    </DashboardLayout>
  );
}
