import React from 'react';

export default function WorkoutComplete({ elapsed, dayLabel, onBackToPlan, onHome }) {
  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  }

  return (
    <div className="complete-page animate-fade-in">
      <div className="complete-card">
        <div className="complete-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h1 className="complete-title">Workout Complete!</h1>
        <p className="complete-subtitle">{dayLabel}</p>

        <div className="complete-stats">
          <div className="complete-stat">
            <span className="complete-stat-value">{formatTime(elapsed)}</span>
            <span className="complete-stat-label">Total Time</span>
          </div>
        </div>

        <p className="complete-message">
          You crushed it! Rest, refuel, and come back stronger.
        </p>

        <div className="complete-actions">
          <button
            id="back-to-plan-btn"
            className="btn btn-primary btn-lg"
            onClick={onBackToPlan}
          >
            ← Back to Plan
          </button>
          <button
            className="btn btn-ghost"
            onClick={onHome}
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
