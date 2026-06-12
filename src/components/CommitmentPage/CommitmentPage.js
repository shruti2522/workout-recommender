import React from 'react';
import './CommitmentPage.css';

export default function CommitmentPage({
  prefs,
  habitContract,
  currentWeek,
  exercises,
  onStartWeek,
  onReset,
  onViewChange,
  streak,
  sidebarOpen,
  onToggleSidebar,
  isMobile,
  onOpenSidebar,
  onCloseSidebar,
}) {
  if (!prefs || !habitContract) return null;

  const goalOptions = {
    lose_weight: 'Lose Weight',
    build_muscle: 'Build Muscle',
    improve_endurance: 'Improve Endurance',
    general_fitness: 'General Fitness',
  };

  const goalLabel = goalOptions[prefs.goal] || prefs.goal;
  const daysPerWeek = habitContract.daysPerWeek || parseInt(prefs.frequency) || 3;
  const currentCommitment = currentWeek?.commitment || daysPerWeek;

  const today = new Date(habitContract.confirmedAt || Date.now());
  const day = today.getDay();
  // Wed-Sun (3, 4, 5, 6, 0)
  const isStarterPeriod = day === 0 || day >= 3;

  // Show the full selected range, not just the floor integer
  const SESSION_RANGE_LABELS = {
    '20_30':   '20–30',
    '30_45':   '30–45',
    '45_60':   '45–60',
    '60_90':   '60–90',
    '90_plus': '90+',
  };
  const sessionRangeLabel = SESSION_RANGE_LABELS[prefs.sessionDuration] || '45–60';
  const weekNumber = currentWeek?.weekNumber || 1;

  return (
    <div className="commitment-shell">
      <div className="commitment-main">
        <div className="commitment-mobile-bar">
          <div className="commitment-mobile-logo-text">
            <span className="commitment-logo-dot"></span>
            Trainr
          </div>
          <button className="commitment-hamburger" aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
            </svg>
          </button>
        </div>

        <div className="commitment-wrap commitment-split-layout">
          {/* Left Column */}
          <div className="commitment-left-col">
            <div className="commitment-header">
              <div className="commitment-eyebrow">Week {weekNumber} · Starting out</div>
              <h1 className="commitment-title">Your commitment,<br />laid out.</h1>
              <p className="commitment-sub">This is what the next seven days look like. Read it over before you lock it in.</p>
            </div>
            <div className="commitment-goal">
              <div className="commitment-field-label">Primary goal</div>
              <div className="commitment-goal-name">{goalLabel}</div>
            </div>
            <div className="commitment-includes">
              <div className="commitment-field-label" style={{ marginBottom: '4px' }}>What's included in Week {weekNumber}</div>
              <div className="commitment-includes-list">
                <div className="commitment-includes-item"><strong>{daysPerWeek} personalized sessions</strong>, built around your goal and current fitness level</div>
                <div className="commitment-includes-item"><strong>About {daysPerWeek * parseInt(sessionRangeLabel)} minutes total</strong> across the week, spread however you like</div>
                <div className="commitment-includes-item"><strong>Daily check-ins</strong> to keep momentum between sessions</div>
                <div className="commitment-includes-item"><strong>Your habit resets every week</strong> so each week is a clean start</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="commitment-right-col">
            <div>
              {isStarterPeriod && weekNumber === 1 && (
                <div className="commitment-warmup-banner" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--commitment-text)', fontWeight: '600', marginBottom: '4px', fontSize: '0.85rem' }}>Your week runs Monday–Sunday.</div>
                  <div style={{ color: 'var(--commitment-text-mid)', fontSize: '0.8rem', lineHeight: '1.4' }}>This week is a warmup. Your target is temporarily reduced to {currentCommitment} session(s) before your full {daysPerWeek}-day plan kicks in on Monday.</div>
                </div>
              )}
              <div className="commitment-stats-band">
                <div className="commitment-stat-cell">
                  <div className="commitment-stat-num">
                    {daysPerWeek}<span className="commitment-stat-unit">×</span>
                  </div>
                  <div className="commitment-stat-desc">sessions<br />per week</div>
                </div>
                <div className="commitment-stat-cell">
                  <div className="commitment-stat-num">
                     {sessionRangeLabel}<span className="commitment-stat-unit">m</span>
                  </div>
                  <div className="commitment-stat-desc">approx. per<br />session</div>
                </div>
                <div className="commitment-stat-cell">
                  <div className="commitment-stat-num" style={{ fontSize: '1.6rem', paddingTop: '6px', lineHeight: '1.1' }}>
                    Weekly<br />reset
                  </div>
                  <div className="commitment-stat-desc">resets every<br />Monday</div>
                </div>
              </div>
            </div>
            <p className="commitment-note">
              You can adjust your weekly frequency anytime from your Goal page.
            </p>
            <div className="commitment-actions">
              <button className="commitment-btn-primary" onClick={onStartWeek}>
                Start Week {weekNumber}
              </button>
              <button className="commitment-btn-ghost" onClick={() => onViewChange('hero')}>
                Change preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
