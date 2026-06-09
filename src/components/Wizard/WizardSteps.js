import React from 'react';
import { FREQUENCY_OPTIONS, DURATION_OPTIONS, EQUIPMENT_OPTIONS, INJURY_MUSCLES } from '../../filterExercises';

export const SESSION_DURATION_OPTIONS = [
  { key: '20_30',   label: '20 – 30 min',  desc: 'Quick, focused session — perfect for busy schedules' },
  { key: '30_45',   label: '30 – 45 min',  desc: 'Efficient session with solid working volume' },
  { key: '45_60',   label: '45 – 60 min',  desc: 'Standard gym session with good exercise variety' },
  { key: '60_90',   label: '60 – 90 min',  desc: 'Extended session for comprehensive training blocks' },
  { key: '90_plus', label: '90 + min',     desc: 'High-volume session for advanced training goals' },
];

export const WEEKLY_TIME_OPTIONS = [
  { key: 'under_2h', label: 'Under 2 hrs / week', desc: 'Minimal time — high-efficiency workouts only' },
  { key: '2_4h',     label: '2 – 4 hrs / week',   desc: 'Moderate commitment, consistent progress' },
  { key: '4_6h',     label: '4 – 6 hrs / week',   desc: 'Solid training volume for clear results' },
  { key: '6_plus',   label: '6 + hrs / week',     desc: 'High commitment — serious performance gains' },
];

export function StepSessionDuration({ value, onChange }) {
  return (
    <div className="wizard-step animate-fade-up">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">How long is each workout session?</h2>
        <p className="wizard-step-subtitle">
          We'll calibrate exercise count and rest periods to fit your time window.
        </p>
      </div>
      <div className="wizard-options-grid" role="radiogroup" aria-label="Session duration">
        {SESSION_DURATION_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            id={`session-duration-${opt.key}`}
            role="radio"
            aria-checked={value === opt.key}
            className={`select-card${value === opt.key ? ' selected' : ''}`}
            onClick={() => onChange(opt.key)}
          >
            <div className="select-card-content">
              <div className="select-card-title">{opt.label}</div>
              <div className="select-card-desc">{opt.desc}</div>
            </div>
            {value === opt.key && (
              <span className="select-card-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepWeeklyTime({ value, onChange }) {
  return (
    <div className="wizard-step animate-fade-up">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">How much time can you dedicate each week?</h2>
        <p className="wizard-step-subtitle">
          Your total weekly budget helps us balance volume across all sessions.
        </p>
      </div>
      <div className="wizard-options-grid" role="radiogroup" aria-label="Weekly time commitment">
        {WEEKLY_TIME_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            id={`weekly-time-${opt.key}`}
            role="radio"
            aria-checked={value === opt.key}
            className={`select-card${value === opt.key ? ' selected' : ''}`}
            onClick={() => onChange(opt.key)}
          >
            <div className="select-card-content">
              <div className="select-card-title">{opt.label}</div>
              <div className="select-card-desc">{opt.desc}</div>
            </div>
            {value === opt.key && (
              <span className="select-card-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}


export function ProgressIndicator({ step, totalSteps }) {
  return (
    <div className="wizard-progress" aria-label={`Step ${step} of ${totalSteps}`}>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
      <span className="wizard-progress-label">
        Step {step} of {totalSteps}
      </span>
    </div>
  );
}


export function StepFrequency({ value, onChange }) {
  return (
    <div className="wizard-step animate-fade-up">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">How often do you work out?</h2>
        <p className="wizard-step-subtitle">
          We'll calibrate exercise difficulty to match your fitness level.
        </p>
      </div>
      <div className="wizard-options-grid" role="radiogroup" aria-label="Workout frequency">
        {FREQUENCY_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            id={`frequency-${opt.key}`}
            role="radio"
            aria-checked={value === opt.key}
            className={`select-card${value === opt.key ? ' selected' : ''}`}
            onClick={() => onChange(opt.key)}
          >
            <div className="select-card-content">
              <div className="select-card-title">{opt.label}</div>
              <div className="select-card-desc">{opt.desc}</div>
            </div>
            {value === opt.key && (
              <span className="select-card-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepDuration({ value, onChange }) {
  return (
    <div className="wizard-step animate-fade-up">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">How long have you been training?</h2>
        <p className="wizard-step-subtitle">
          Combined with frequency, this helps us tailor the difficulty.
        </p>
      </div>
      <div className="wizard-options-grid" role="radiogroup" aria-label="Training duration">
        {DURATION_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            id={`duration-${opt.key}`}
            role="radio"
            aria-checked={value === opt.key}
            className={`select-card${value === opt.key ? ' selected' : ''}`}
            onClick={() => onChange(opt.key)}
          >
            <div className="select-card-content">
              <div className="select-card-title">{opt.label}</div>
              <div className="select-card-desc">{opt.desc}</div>
            </div>
            {value === opt.key && (
              <span className="select-card-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export const GOAL_OPTIONS = [
  { key: 'build_muscle',        label: 'Build Muscle',          desc: 'Increase strength and muscle mass with hypertrophy training' },
  { key: 'lose_weight',         label: 'Lose Weight',           desc: 'Burn fat with higher volume, circuit-style workouts' },
  { key: 'improve_endurance',   label: 'Improve Endurance',     desc: 'Build stamina with moderate weight and higher reps' },
  { key: 'increase_flexibility',label: 'Increase Flexibility',  desc: 'Mobility-focused with stretching and recovery work' },
  { key: 'general_fitness',     label: 'General Fitness',       desc: 'A balanced mix across strength, cardio, and mobility' },
];

export const TARGET_AREA_OPTIONS = [
  { key: 'upper_body', label: 'Upper Body',    desc: 'Chest, Back, Shoulders & Arms' },
  { key: 'lower_body', label: 'Lower Body',    desc: 'Quads, Hamstrings, Glutes & Calves' },
  { key: 'core',       label: 'Core & Abs',    desc: 'Abdominals, obliques & stability' },
  { key: 'full_body',  label: 'Full Body',     desc: 'Balanced across all muscle groups' },
];

export function StepGoal({ value, onChange }) {
  return (
    <div className="wizard-step animate-fade-up">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">What is your primary goal?</h2>
        <p className="wizard-step-subtitle">
          This shapes the type and structure of your workouts.
        </p>
      </div>
      <div className="wizard-options-grid" role="radiogroup" aria-label="Primary goal">
        {GOAL_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            id={`goal-${opt.key}`}
            role="radio"
            aria-checked={value === opt.key}
            className={`select-card${value === opt.key ? ' selected' : ''}`}
            onClick={() => onChange(opt.key)}
          >
            <div className="select-card-content">
              <div className="select-card-title">{opt.label}</div>
              <div className="select-card-desc">{opt.desc}</div>
            </div>
            {value === opt.key && (
              <span className="select-card-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepTargetAreas({ selected, onChange }) {
  const toggle = (key) => {
    onChange((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="wizard-step animate-fade-up">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">Which areas do you want to focus on?</h2>
        <p className="wizard-step-subtitle">
          Pick one or more - these will be prioritised in your plan.
        </p>
      </div>
      <div className="wizard-options-grid" role="group" aria-label="Target body areas">
        {TARGET_AREA_OPTIONS.map((opt) => {
          const isChecked = selected.includes(opt.key);
          return (
            <button
              key={opt.key}
              id={`area-${opt.key}`}
              role="checkbox"
              aria-checked={isChecked}
              className={`select-card${isChecked ? ' selected' : ''}`}
              onClick={() => toggle(opt.key)}
            >
              <div className="select-card-content">
                <div className="select-card-title">{opt.label}</div>
                <div className="select-card-desc">{opt.desc}</div>
              </div>
              {isChecked && (
                <span className="select-card-check">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StepEquipment({ selected, onChange }) {
  const toggle = (label) => {
    onChange((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="wizard-step animate-fade-up">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">What equipment do you have?</h2>
        <p className="wizard-step-subtitle">
          Select all that apply - bodyweight exercises are always included.
        </p>
      </div>
      <div className="wizard-check-grid" role="group" aria-label="Equipment selection">
        {EQUIPMENT_OPTIONS.map((opt) => {
          const isChecked = selected.includes(opt.label);
          return (
            <button
              key={opt.label}
              id={`equipment-${opt.label.replace(/\s+/g, '-').toLowerCase()}`}
              role="checkbox"
              aria-checked={isChecked}
              className={`check-card${isChecked ? ' checked' : ''}`}
              onClick={() => toggle(opt.label)}
            >
              <span className="check-card-box">{isChecked ? '✓' : ''}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StepInjuries({ selected, onChange }) {
  const injuryList = Object.keys(INJURY_MUSCLES);

  const toggle = (inj) => {
    onChange((prev) =>
      prev.includes(inj) ? prev.filter((i) => i !== inj) : [...prev, inj]
    );
  };

  return (
    <div className="wizard-step animate-fade-up">
      <div className="wizard-step-header">
        <h2 className="wizard-step-title">Any injuries or sensitivities?</h2>
        <p className="wizard-step-subtitle">
          We'll automatically exclude exercises that stress these areas.
          Skip if you have none.
        </p>
      </div>
      <div className="wizard-check-grid" role="group" aria-label="Injury areas">
        {injuryList.map((inj) => {
          const isChecked = selected.includes(inj);
          return (
            <button
              key={inj}
              id={`injury-${inj.replace(/\s+/g, '-').toLowerCase()}`}
              role="checkbox"
              aria-checked={isChecked}
              className={`check-card${isChecked ? ' checked' : ''}`}
              onClick={() => toggle(inj)}
            >
              <span className="check-card-box">{isChecked ? '✓' : ''}</span>
              {inj}
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {(INJURY_MUSCLES[inj] || []).slice(0, 2).join(', ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
