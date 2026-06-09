import React, { useState, useEffect, useRef } from 'react';
import { getExerciseImageUrl, capitalize } from '../utils/helpers';

function SetTimer({ durationSeconds, onDone }) {
  const isCountdown = !!durationSeconds;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
  }, [durationSeconds]);

  useEffect(() => {
    if (isCountdown && elapsed >= durationSeconds) { onDone(); return; }
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [elapsed, isCountdown, durationSeconds, onDone]);

  const remaining = isCountdown ? Math.max(0, durationSeconds - elapsed) : elapsed;
  const pct = isCountdown ? (elapsed / durationSeconds) * 100 : 0;

  return (
    <div className="set-timer-wrap">
      <div className="rest-timer-circle" style={{ width: 120, height: 120 }}>
        <svg viewBox="0 0 100 100" className="rest-timer-svg">
          <circle cx="50" cy="50" r="44" className="rest-circle-bg" />
          {isCountdown && (
            <circle
              cx="50" cy="50" r="44"
              className="rest-circle-fill"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * pct) / 100}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          )}
        </svg>
        <span className="rest-timer-count" style={{ fontSize: '1.7rem' }}>
          {isCountdown ? `${remaining}s` : `${elapsed}s`}
        </span>
      </div>
      <p className="set-timer-label">
        {isCountdown ? 'Hold it!' : 'Time elapsed'}
      </p>
    </div>
  );
}

function RestTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="rest-timer animate-fade-in">
      <p className="rest-timer-label">Rest</p>
      <div className="rest-timer-circle">
        <svg viewBox="0 0 100 100" className="rest-timer-svg">
          <circle cx="50" cy="50" r="44" className="rest-circle-bg" />
          <circle
            cx="50" cy="50" r="44"
            className="rest-circle-fill"
            strokeDasharray="276.46"
            strokeDashoffset={276.46 - (276.46 * pct) / 100}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <span className="rest-timer-count">{remaining}s</span>
      </div>
      <p className="rest-timer-sub">Next set coming up…</p>
    </div>
  );
}

export default function WorkoutSession({ day, onBack, onComplete, onUpdateProgress }) {
  const exercises = day.exercises;

  
  const steps = exercises.flatMap((ex, ei) =>
    Array.from({ length: ex.sets || 1 }, (_, si) => ({ ei, si, total: ex.sets || 1 }))
  );

  const [stepIdx, setStepIdx] = useState(day.progress?.stepIdx || 0);
  const [phase, setPhase] = useState(day.progress?.phase || 'exercise'); 
  const [elapsed, setElapsed] = useState(0);
  const [setTimerKey, setSetTimerKey] = useState(0); 
  const [imgError, setImgError] = useState(false);
  const startRef = useRef(Date.now());

  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onUpdateProgress) {
      onUpdateProgress(stepIdx, phase);
    }
  }, [stepIdx, phase, onUpdateProgress]);

  const totalSteps = steps.length;
  const progress = ((stepIdx + (phase === 'rest' ? 0.5 : 0)) / totalSteps) * 100;

  const currentStep = steps[stepIdx];
  if (!currentStep) return null;
  const ex = exercises[currentStep.ei];
  const isLastStep = stepIdx === totalSteps - 1;
  const imageUrl = ex.images?.[0] ? getExerciseImageUrl(ex.images[0]) : null;

  function advance() {
    if (isLastStep) {
      onComplete(elapsed);
    } else {
      setStepIdx((i) => i + 1);
      setSetTimerKey((k) => k + 1); 
      setPhase('exercise');
    }
  }

  function skipExercise() {
    const nextStepIdx = steps.findIndex((s, i) => i > stepIdx && s.ei > currentStep.ei);
    if (nextStepIdx === -1) {
      onComplete(elapsed);
    } else {
      setStepIdx(nextStepIdx);
      setSetTimerKey((k) => k + 1);
      setPhase('exercise');
    }
  }

  function finishSet() {
    if (ex.restSeconds && ex.restSeconds > 0 && !isLastStep) {
      setPhase('rest');
    } else {
      advance();
    }
  }

  
  function handleSetTimerDone() {
    finishSet();
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  return (
    <div className="session-page animate-fade-in">
      {}
      <div className="session-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back to Plan</button>
        <span className="session-elapsed">{formatTime(elapsed)}</span>
      </div>

      {}
      <div className="session-progress-wrap" aria-label={`${Math.round(progress)}% complete`}>
        <div className="session-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="session-progress-label">
        Exercise {currentStep.ei + 1} of {exercises.length}
      </p>

      {}
      {phase === 'rest' ? (
        <RestTimer
          key={`rest-${stepIdx}`}
          seconds={ex.restSeconds}
          onDone={advance}
        />
      ) : (
        <div className="session-exercise animate-fade-in">
          {}
          <div className="session-ex-info">
            <p className="session-day-label">{day.label}</p>
            <h2 className="session-ex-name">{ex.name}</h2>

            <div className="session-ex-badges">
              <span className="prescription-effort">
                {ex.durationSeconds ? `${ex.durationSeconds}s hold` : `${ex.reps} reps`}
              </span>
              {ex.restSeconds > 0 && (
                <span className="prescription-rest">Rest {ex.restSeconds}s after</span>
              )}
            </div>

            <p className="session-ex-muscles">
              {(ex.primaryMuscles || []).map(capitalize).join(', ')}
            </p>
          </div>

          {}
          <div className="session-ex-layout">
            <div className="session-ex-image-wrap">
              {imageUrl && !imgError ? (
                <img
                  src={imageUrl}
                  alt={ex.name}
                  className="session-ex-image"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="session-ex-image-fallback" />
              )}
            </div>

            {ex.instructions && ex.instructions.length > 0 && (
              <div className="session-instructions">
                <ol>
                  {ex.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {}
          <div className="session-ex-info">
            {}
            <div className="session-sets-container">
              {Array.from({ length: currentStep.total }).map((_, i) => {
                let statusClass = '';
                if (i < currentStep.si) statusClass = 'session-set-complete';
                else if (i === currentStep.si) statusClass = 'session-set-active';
                return (
                  <div key={i} className={`session-set-badge ${statusClass}`}>
                    Set {i + 1}
                  </div>
                );
              })}
            </div>

            {}
            <SetTimer
              key={setTimerKey}
              durationSeconds={ex.durationSeconds || null}
              onDone={handleSetTimerDone}
            />

            {ex.note && <p className="session-ex-note">{ex.note}</p>}
          </div>
        </div>
      )}

      {}
      <div className="session-actions">
        {phase === 'exercise' && (
          <button
            id="done-set-btn"
            className="btn btn-primary btn-lg session-done-btn"
            onClick={finishSet}
          >
            {isLastStep ? 'Finish Workout' : ex.durationSeconds ? 'Skip Timer' : 'Done Set'}
          </button>
        )}
        {phase === 'rest' && (
          <button
            className="btn btn-secondary session-skip-btn"
            onClick={advance}
          >
            Skip Rest
          </button>
        )}
        {phase === 'exercise' && currentStep.ei < exercises.length - 1 && (
          <button
            className="btn btn-ghost session-skip-btn"
            onClick={skipExercise}
          >
            Skip Exercise
          </button>
        )}
      </div>
    </div>
  );
}
