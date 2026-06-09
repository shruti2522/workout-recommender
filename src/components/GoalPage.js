import React, { useMemo } from 'react';
import DashboardLayout from './DashboardLayout';

const GOAL_META = {
  build_muscle:         { label: 'Build Muscle',       icon: 'ti-bolt',         color: '#7c3aed', bg: '#ede9fe' },
  lose_weight:          { label: 'Lose Weight',         icon: 'ti-flame',        color: '#dc2626', bg: '#fee2e2' },
  improve_endurance:    { label: 'Improve Endurance',   icon: 'ti-run',          color: '#0284c7', bg: '#e0f2fe' },
  increase_flexibility: { label: 'Increase Flexibility',icon: 'ti-yoga',         color: '#059669', bg: '#d1fae5' },
  general_fitness:      { label: 'General Fitness',     icon: 'ti-activity',     color: '#d97706', bg: '#fef3c7' },
};

const AREA_META = {
  upper_body: { label: 'Upper Body',  icon: 'ti-arm-flex',      muscles: 'Chest, Back, Shoulders & Arms' },
  lower_body: { label: 'Lower Body',  icon: 'ti-run',           muscles: 'Quads, Hamstrings, Glutes & Calves' },
  core:       { label: 'Core & Abs',  icon: 'ti-circle-half-2', muscles: 'Abdominals, Obliques & Stability' },
  full_body:  { label: 'Full Body',   icon: 'ti-body-scan',     muscles: 'Balanced across all muscle groups' },
};

const FREQ_LABELS = {
  never:      'New to training',
  rarely:     '1–2× / week',
  sometimes:  '2–3× / week',
  often:      '4–5× / week',
  daily:      '6–7× / week',
};

const DURATION_LABELS = {
  under_3:  'Under 3 months',
  '3_12':   '3–12 months',
  '1_3':    '1–3 years',
  over_3:   '3+ years',
};

export default function GoalPage({
  prefs,
  savedPlan,
  onReset,
  onViewChange,
  sidebarOpen,
  onToggleSidebar,
  isMobile,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const goalMeta = GOAL_META[prefs?.goal] || { label: prefs?.goal || 'Not set', icon: 'ti-target', color: '#22887b', bg: '#d1fae5' };

  const totalDays = savedPlan?.length ?? 0;
  const completedDays = savedPlan?.filter(d => d.completed).length ?? 0;
  const completionPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (circumference * completionPct) / 100;

  const totalExercises = useMemo(() => {
    if (!savedPlan) return 0;
    return savedPlan.reduce((sum, d) => sum + (d.exercises?.length ?? 0), 0);
  }, [savedPlan]);

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
          <h1 className="inner-page-title">Your Goal</h1>
          <p className="inner-page-subtitle">Your personalised training profile and objectives.</p>
        </div>

        {/* Hero Goal Card */}
        <div className="goal-hero-card" style={{ '--goal-color': goalMeta.color, '--goal-bg': goalMeta.bg }}>
          <div className="goal-hero-left">
            <div className="goal-hero-icon">
              <i className={`ti ${goalMeta.icon}`} />
            </div>
            <div>
              <div className="goal-hero-label">Primary Goal</div>
              <div className="goal-hero-name">{goalMeta.label}</div>
            </div>
          </div>

          {/* Plan completion ring */}
          <div className="goal-ring-wrap">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
              <circle
                cx="64" cy="64" r="54"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px', transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="goal-ring-text">
              <span className="goal-ring-pct">{completionPct}%</span>
              <span className="goal-ring-sub">plan done</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="goal-stats-row">
          {[
            { label: 'Training Days', value: totalDays, icon: 'ti-calendar' },
            { label: 'Completed', value: completedDays, icon: 'ti-circle-check' },
            { label: 'Exercises', value: totalExercises, icon: 'ti-barbell' },
            { label: 'Injuries Avoided', value: injuries.length, icon: 'ti-shield-check' },
          ].map(s => (
            <div key={s.label} className="goal-stat-card">
              <i className={`ti ${s.icon} goal-stat-icon`} />
              <div className="goal-stat-val">{s.value}</div>
              <div className="goal-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="goal-grid">
          {/* training Profile */}
          <div className="goal-section-card">
            <div className="goal-section-title">
              <i className="ti ti-user-circle" /> Training Profile
            </div>
            <div className="goal-profile-rows">
              {prefs?.frequency && (
                <div className="goal-profile-row">
                  <span className="goal-profile-key">Current Frequency</span>
                  <span className="goal-profile-val">{FREQ_LABELS[prefs.frequency] ?? prefs.frequency}</span>
                </div>
              )}
              {prefs?.duration && (
                <div className="goal-profile-row">
                  <span className="goal-profile-key">Training Experience</span>
                  <span className="goal-profile-val">{DURATION_LABELS[prefs.duration] ?? prefs.duration}</span>
                </div>
              )}
              {prefs?.daysPerWeek && (
                <div className="goal-profile-row">
                  <span className="goal-profile-key">Days per Week</span>
                  <span className="goal-profile-val">{prefs.daysPerWeek} days</span>
                </div>
              )}
              {prefs?.sessionDuration && (
                <div className="goal-profile-row">
                  <span className="goal-profile-key">Session Length</span>
                  <span className="goal-profile-val">{prefs.sessionDuration.replace('_', '–')} min</span>
                </div>
              )}
            </div>
          </div>

          {/* Target Areas */}
          <div className="goal-section-card">
            <div className="goal-section-title">
              <i className="ti ti-target" /> Focus Areas
            </div>
            <div className="goal-areas-grid">
              {targetAreas.length > 0 ? targetAreas.map(key => {
                const meta = AREA_META[key] ?? { label: key, icon: 'ti-circle', muscles: '' };
                return (
                  <div key={key} className="goal-area-chip">
                    <i className={`ti ${meta.icon}`} />
                    <div>
                      <div className="goal-area-name">{meta.label}</div>
                      <div className="goal-area-muscles">{meta.muscles}</div>
                    </div>
                  </div>
                );
              }) : <p className="goal-empty-note">No specific areas selected — full body training.</p>}
            </div>
          </div>

          {/* Equipment */}
          {prefs?.equipment?.length > 0 && (
            <div className="goal-section-card">
              <div className="goal-section-title">
                <i className="ti ti-tools" /> Equipment Available
              </div>
              <div className="goal-chips">
                {prefs.equipment.map(e => (
                  <span key={e} className="goal-chip">{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Injuries */}
          {injuries.length > 0 && (
            <div className="goal-section-card">
              <div className="goal-section-title">
                <i className="ti ti-shield-check" /> Excluded Areas (Injuries)
              </div>
              <div className="goal-chips">
                {injuries.map(inj => (
                  <span key={inj} className="goal-chip goal-chip-danger">{inj}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="goal-footer-actions">
          <button className="btn btn-primary" onClick={() => onViewChange('results')}>
            <i className="ti ti-calendar-check" /> View My Plan
          </button>
          <button className="btn btn-ghost goal-reset-btn" onClick={onReset}>
            <i className="ti ti-refresh" /> Rebuild Plan
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
