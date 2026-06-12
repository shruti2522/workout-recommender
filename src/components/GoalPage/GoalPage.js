import React, { useMemo } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import WeeklyHabitRing from '../ProgressPage/WeeklyHabitRing';
import { getLevelProgress, ALL_BADGES, RARITY_STYLES } from '../../utils/xp';
import {
  Flame, Activity, Calendar, Dumbbell, Target, Shield,
  Thermometer, Star, Sunrise, Zap, Crown, RefreshCw,
  RefreshCcw, Lock,
} from 'lucide-react';

const ICON_MAP = {
  flame: Flame, activity: Activity, calendar: Calendar, dumbbell: Dumbbell,
  target: Target, shield: Shield, thermometer: Thermometer, star: Star,
  sunrise: Sunrise, zap: Zap, crown: Crown, 'refresh-cw': RefreshCw,
};

const GOAL_META = {
  build_muscle:         { label: 'Build Muscle',        icon: Dumbbell, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  lose_weight:          { label: 'Lose Weight',          icon: Flame,    color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  improve_endurance:    { label: 'Improve Endurance',    icon: Activity, color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  increase_flexibility: { label: 'Increase Flexibility', icon: Target,   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  general_fitness:      { label: 'General Fitness',      icon: Zap,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

const AREA_META = {
  upper_body: { label: 'Upper Body',  muscles: 'Chest, Back, Shoulders & Arms' },
  lower_body: { label: 'Lower Body',  muscles: 'Quads, Hamstrings, Glutes & Calves' },
  core:       { label: 'Core & Abs',  muscles: 'Abdominals, Obliques & Stability' },
  full_body:  { label: 'Full Body',   muscles: 'Balanced across all muscle groups' },
};

const FREQ_LABELS = {
  never: 'New to training', rarely: '1–2× / week',
  sometimes: '2–3× / week', often: '4–5× / week', daily: '6–7× / week',
};

const DURATION_LABELS = {
  under_3: 'Under 3 months', '3_12': '3–12 months',
  '1_3': '1–3 years', over_3: '3+ years',
};

/* ── Milestone journey (visual path) ──────────────────────────────── */
function MilestoneJourney({ milestones, title }) {
  return (
    <div className="milestone-list" style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {milestones.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: m.done ? 0.6 : 1 }}>
            <div style={{ 
              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
              border: m.done ? 'none' : '1.5px solid var(--border-subtle)',
              background: m.done ? 'var(--text-muted)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {m.done && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', color: m.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: m.done ? 'line-through' : 'none' }}>
                {m.text}
              </div>
              {m.active && !m.done && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Working on this right now</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Next badge spotlight ──────────────────────────────────────────── */
function NextBadgeSpotlight({ unlockedBadgeIds, history, streak, completedQuestLog, xp }) {
  const nextBadge = useMemo(() => {
    const locked = ALL_BADGES.filter(b => !unlockedBadgeIds.includes(b.id));
    if (locked.length === 0) return null;

    // Score each locked badge by "how close"
    const scored = locked.map(badge => {
      let closeness = 0;
      try {
        const h = history || [];
        if (badge.id === 'first_spark')      closeness = Math.min(1, h.length / 1);
        else if (badge.id === 'three_streak') closeness = Math.min(1, streak / 3);
        else if (badge.id === 'week_warrior') closeness = Math.min(1, streak / 7);
        else if (badge.id === 'ten_sessions') closeness = Math.min(1, h.length / 10);
        else if (badge.id === 'twenty_five_sessions') closeness = Math.min(1, h.length / 25);
        else if (badge.id === 'inferno')      closeness = Math.min(1, streak / 14);
        else if (badge.id === 'iron_will')    closeness = Math.min(1, streak / 30);
        else if (badge.id === 'centurion')    closeness = Math.min(1, h.length / 50);
        else if (badge.id === 'early_bird')   closeness = Math.min(1, h.filter(x => x.completedAt && new Date(x.completedAt).getHours() < 12).length / 5);
        else if (badge.id === 'quest_master') closeness = Math.min(1, (completedQuestLog?.length || 0) / 10);
        else if (badge.id === 'legend_status') closeness = Math.min(1, xp / 1400);
        else if (badge.id === 'comeback_kid') closeness = 0.1;
        else closeness = 0;
      } catch { closeness = 0; }
      return { badge, closeness };
    }).filter(x => x.closeness > 0);

    if (scored.length === 0) return locked[0] ? { badge: locked[0], closeness: 0 } : null;
    scored.sort((a, b) => b.closeness - a.closeness);
    return scored[0];
  }, [unlockedBadgeIds, history, streak, completedQuestLog, xp]);

  if (!nextBadge) return (
    <div className="next-badge-spotlight">
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All badges unlocked!</span>
    </div>
  );

  const { badge, closeness } = nextBadge;
  const style = RARITY_STYLES[badge.rarity];
  const BadgeIcon = ICON_MAP[badge.icon] || Star;
  const pct = Math.round(closeness * 100);

  return (
    <div className="next-badge-spotlight" style={{ borderColor: style.border }}>
      <div className="next-badge-header">
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700' }}>
          Next achievement
        </div>
        <span style={{ fontSize: '0.65rem', color: style.color, fontWeight: '700', background: style.bg, padding: '2px 8px', borderRadius: '10px' }}>
          {badge.rarity}
        </span>
      </div>
      <div className="next-badge-body">
        <div className="next-badge-icon-wrap" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
          <BadgeIcon size={22} color={style.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
            {badge.name}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{badge.desc}</div>
          <div className="next-badge-bar-wrap">
            <div className="next-badge-bar-track">
              <div className="next-badge-bar-fill" style={{ width: `${pct}%`, background: style.color, boxShadow: `0 0 8px ${style.color}55` }} />
            </div>
            <span style={{ fontSize: '0.68rem', color: style.color, fontWeight: '700', flexShrink: 0 }}>{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
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
  xp = 0,
}) {
  const { level } = getLevelProgress(xp);
  const goalMeta = GOAL_META[prefs?.goal] || { label: prefs?.goal || 'Not set', icon: Target, color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
  const GoalIcon = goalMeta.icon;

  const totalSessions = history?.length ?? 0;
  const currentStreak = streak || 0;
  const daysPerWeek = habitContract?.daysPerWeek ?? parseInt(prefs?.frequency) ?? 3;

  const consistentWeeks = useMemo(() => {
    if (!history || history.length === 0) return 0;
    const weekMap = {};
    history.forEach(h => {
      const date = new Date(h.date);
      const weekStart = new Date(date);
      const dayOffset = (date.getDay() + 6) % 7; // Monday=0
      weekStart.setDate(date.getDate() - dayOffset);
      const weekKey = weekStart.toISOString().slice(0, 10);
      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    });
    return Object.values(weekMap).filter(count => count >= daysPerWeek).length;
  }, [history, daysPerWeek]);

  // This week's count
  const thisWeekCount = useMemo(() => {
    const today = new Date();
    const dayOffset = (today.getDay() + 6) % 7; // Monday=0
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const startStr = weekStart.toISOString().slice(0, 10);
    return (history || []).filter(h => h.date >= startStr).length;
  }, [history]);

  // Habit contract summary line
  const habitSummary = useMemo(() => {
    const remaining = Math.max(0, daysPerWeek - thisWeekCount);
    if (thisWeekCount >= daysPerWeek) return { text: 'Week complete! You hit your target.', accent: '#4ade80' };
    if (remaining === 1) return { text: `1 more session this week to hit your goal.`, accent: '#f59e0b' };
    return { text: `${remaining} more sessions this week to hit your ${daysPerWeek}× goal.`, accent: '#b0b0b0' };
  }, [daysPerWeek, thisWeekCount]);

  // ETA message
  const etaMessage = useMemo(() => {
    if (totalSessions === 0) return null;
    const sessionsPerWeek = daysPerWeek;
    const goal = prefs?.goal || 'general_fitness';
    const targetSessions = goal === 'lose_weight' ? 15 : goal === 'increase_flexibility' ? 10 : 12;
    const remaining = Math.max(0, targetSessions - totalSessions);
    if (remaining === 0) return '✓ First major milestone reached!';
    const weeksLeft = Math.ceil(remaining / sessionsPerWeek);
    return `At your pace, ~${weeksLeft} week${weeksLeft !== 1 ? 's' : ''} to your first major milestone.`;
  }, [totalSessions, daysPerWeek, prefs?.goal]);

  // Build milestone journey
  const { shortTermGoals, longTermGoals } = useMemo(() => {
    const shortItems = [
      { text: 'Complete first workout', done: totalSessions >= 1 },
      { text: `3-day streak`, done: currentStreak >= 3 },
      { text: `Complete ${daysPerWeek} sessions in a week`, done: consistentWeeks >= 1 },
      { text: `7-day streak`, done: currentStreak >= 7 },
    ];
    
    const longItems = [
      { text: `3 consistent weeks`, done: consistentWeeks >= 3 },
      { text: `25 total sessions`, done: totalSessions >= 25 },
      { text: `30-day streak`, done: currentStreak >= 30 },
      { text: `50 total sessions`, done: totalSessions >= 50 },
    ];

    let foundActive = false;
    const processList = (items) => items.map(m => {
      const active = !m.done && !foundActive;
      if (active) foundActive = true;
      return { ...m, active };
    });

    return { 
      shortTermGoals: processList(shortItems), 
      longTermGoals: processList(longItems) 
    };
  }, [totalSessions, currentStreak, daysPerWeek, consistentWeeks]);

  const targetAreas = prefs?.targetAreas ?? [];
  const injuries = prefs?.injuries ?? [];

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

        <div className="inner-page-header">
          <h1 className="inner-page-title">My Goal</h1>
          <p className="inner-page-subtitle">Your mission, your habit, your progress.</p>
        </div>

        {/* ── Hero Goal Card ── */}
        <div className="goal-hero-card">
          <div className="goal-hero-left">
            <div>
              <div className="goal-hero-label">Primary Goal</div>
              <div className="goal-hero-name" style={{ color: goalMeta.color }}>{goalMeta.label}</div>
              <div className="goal-hero-level">Lv.{level.index + 1} {level.name} · {xp} XP</div>
              <div className="goal-hero-habit-summary" style={{ color: habitSummary.accent }}>
                {habitSummary.text}
              </div>
              {etaMessage && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {etaMessage}
                </div>
              )}
            </div>
          </div>

          {/* Weekly habit ring */}
          <div className="goal-hero-ring">
            <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', textAlign: 'center' }}>
              This Week
            </div>
            <WeeklyHabitRing
              history={history}
              daysPerWeek={daysPerWeek}
              startDate={habitContract?.confirmedAt}
              size="md"
              showLabel={true}
            />
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="goal-stats-row">
          {[
            { label: 'Sessions', value: totalSessions },
            { label: 'Streak', value: `${currentStreak}d` },
            { label: 'Consistent Weeks', value: consistentWeeks },
            { label: 'Badges', value: `${unlockedBadgeIds.length}/${ALL_BADGES.length}` },
          ].map(s => {
            return (
              <div key={s.label} className="goal-stat-card">
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '4px' }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Milestone Journey ── */}
        <div className="prog-section-card">
          <div className="prog-section-header" style={{ marginBottom: '24px' }}>
            <span className="prog-section-title">Milestones</span>
          </div>
          <MilestoneJourney milestones={shortTermGoals} title="Short-term Goals (Weekly)" />
          <MilestoneJourney milestones={longTermGoals} title="Long-term Goals (Lifetime)" />
        </div>

        {/* ── Next Badge Spotlight ── */}
        <NextBadgeSpotlight
          unlockedBadgeIds={unlockedBadgeIds}
          history={history}
          streak={currentStreak}
          completedQuestLog={[]}
          xp={xp}
        />

        {/* ── Achievements Grid ── */}
        <div className="prog-section-card">
          <div className="prog-section-header">
            <span className="prog-section-title">Achievements</span>
            <span className="prog-section-sub">{unlockedBadgeIds.length} / {ALL_BADGES.length} unlocked</span>
          </div>
          <div className="goal-badges-grid">
            {ALL_BADGES.map(badge => {
              const isUnlocked = unlockedBadgeIds.includes(badge.id);
              const style = RARITY_STYLES[badge.rarity];
              const BadgeIcon = ICON_MAP[badge.icon] || Star;
              return (
                <div key={badge.id} className={`goal-badge-card ${isUnlocked ? 'unlocked' : ''}`}
                  style={isUnlocked ? { background: style.bg, borderColor: style.border } : {}}
                  title={badge.desc}
                >
                  <div className="goal-badge-icon-wrap"
                    style={isUnlocked ? { background: style.bg, borderColor: style.border, color: style.color } : {}}
                  >
                    {isUnlocked ? <BadgeIcon size={22} /> : <Lock size={16} color="var(--text-muted)" />}
                  </div>
                  <div className="goal-badge-name" style={isUnlocked ? { color: 'var(--text-primary)' } : {}}>
                    {badge.name}
                  </div>
                  <div className="goal-badge-desc" style={isUnlocked ? { color: style.color } : {}}>
                    {badge.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Training Profile ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Training Profile
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {prefs?.frequency && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Frequency</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{FREQ_LABELS[prefs.frequency] ?? prefs.frequency}</span>
                </div>
              )}
              {prefs?.duration && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{DURATION_LABELS[prefs.duration] ?? prefs.duration}</span>
                </div>
              )}
              {habitContract?.daysPerWeek && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Days/Week Committed</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{habitContract.daysPerWeek}×</span>
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
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Focus Areas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {targetAreas.length > 0 ? targetAreas.map(key => {
                const meta = AREA_META[key] ?? { label: key, muscles: '' };
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{meta.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meta.muscles}</div>
                    </div>
                  </div>
                );
              }) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No specific areas selected — full body training.
                </p>
              )}
            </div>
          </div>

          {/* Equipment */}
          {prefs?.equipment?.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Equipment
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
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Excluded Areas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {injuries.map(inj => (
                  <span key={inj} style={{ padding: '4px 12px', background: '#1f0a0a', border: '1px solid #7f1d1d', borderRadius: '20px', fontSize: '0.82rem', color: '#f87171', fontWeight: '500' }}>
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
