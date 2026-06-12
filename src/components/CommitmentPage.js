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
  const sessionLength = habitContract.sessionLength || parseInt(prefs.duration) || 30;
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

        <div className="commitment-wrap">
          <div className="commitment-header">
            <div className="commitment-eyebrow">Week {weekNumber} · Starting out</div>
            <h1 className="commitment-title">Your commitment,<br />laid out.</h1>
            <p className="commitment-sub">This is what the next seven days look like. Read it over before you lock it in.</p>
          </div>
          <div className="commitment-goal">
            <div className="commitment-field-label">Primary goal</div>
            <div className="commitment-goal-name">{goalLabel}</div>
          </div>
          <div>
            <div className="commitment-field-label" style={{ marginBottom: '14px' }}>Your weekly habit</div>
            <div className="commitment-stats-band">
              <div className="commitment-stat-cell">
                <div className="commitment-stat-num">
                  {daysPerWeek}<span className="commitment-stat-unit">×</span>
                </div>
                <div className="commitment-stat-desc">sessions<br />per week</div>
              </div>
              <div className="commitment-stat-cell">
                <div className="commitment-stat-num">
                  {sessionLength}<span className="commitment-stat-unit">m</span>
                </div>
                <div className="commitment-stat-desc">approx. per<br />session</div>
              </div>
              <div className="commitment-stat-cell">
                <div className="commitment-stat-num" style={{ fontSize: '1.6rem', paddingTop: '6px', lineHeight: '1.1' }}>
                  Sun<br />reset
                </div>
                <div className="commitment-stat-desc">week resets<br />on Sunday</div>
              </div>
            </div>
          </div>
          <div className="commitment-includes">
            <div className="commitment-field-label" style={{ marginBottom: '4px' }}>What's included in Week {weekNumber}</div>
            <div className="commitment-includes-list">
              <div className="commitment-includes-item"><strong>{daysPerWeek} personalized sessions</strong> — built around your goal and current fitness level</div>
              <div className="commitment-includes-item"><strong>About {daysPerWeek * sessionLength} minutes total</strong> across the week, spread however you like</div>
              <div className="commitment-includes-item"><strong>Daily check-ins</strong> to keep momentum between sessions</div>
              <div className="commitment-includes-item"><strong>Your habit resets Sunday</strong> so each week is a clean start</div>
            </div>
          </div>
          <p className="commitment-note">
            You can adjust your weekly frequency anytime from your Goal page. There's no subscription required and no penalty for changing your mind.
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
  );
}
