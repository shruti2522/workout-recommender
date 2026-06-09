import React, { useState } from 'react';
import {
  ProgressIndicator,
  StepFrequency,
  StepSessionDuration,
  StepWeeklyTime,
  StepDuration,
  StepGoal,
  StepTargetAreas,
  StepEquipment,
  StepInjuries,
} from './WizardSteps';

const TOTAL_STEPS = 8;

export default function Wizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [frequency,       setFrequency]       = useState('');
  const [sessionDuration, setSessionDuration] = useState('');
  const [weeklyTime,      setWeeklyTime]      = useState('');
  const [duration,        setDuration]        = useState('');
  const [goal,            setGoal]            = useState('');
  const [targetAreas,     setTargetAreas]     = useState([]);
  const [equipment,       setEquipment]       = useState([]);
  const [injuries,        setInjuries]        = useState([]);

  const canProceed =
    step === 1 ? !!frequency :
    step === 2 ? !!sessionDuration :
    step === 3 ? !!weeklyTime :
    step === 4 ? !!duration :
    step === 5 ? !!goal :
    true;

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      onComplete({
        frequency,
        sessionDuration,
        weeklyTime,
        duration,
        goal,
        targetAreas,
        equipment,
        injuries,
      });
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  return (
    <div className="wizard-container">
      <div className="wizard-card glass-panel-strong">
        <ProgressIndicator step={step} totalSteps={TOTAL_STEPS} />

        <div className="wizard-body">
          {step === 1 && <StepFrequency       value={frequency}       onChange={setFrequency} />}
          {step === 2 && <StepSessionDuration value={sessionDuration} onChange={setSessionDuration} />}
          {step === 3 && <StepWeeklyTime      value={weeklyTime}      onChange={setWeeklyTime} />}
          {step === 4 && <StepDuration        value={duration}        onChange={setDuration} />}
          {step === 5 && <StepGoal            value={goal}            onChange={setGoal} />}
          {step === 6 && <StepTargetAreas     selected={targetAreas}  onChange={setTargetAreas} />}
          {step === 7 && <StepEquipment       selected={equipment}    onChange={setEquipment} />}
          {step === 8 && <StepInjuries        selected={injuries}     onChange={setInjuries} />}
        </div>

        <div className="wizard-footer">
          {step > 1 && (
            <button
              id="wizard-back-btn"
              className="btn btn-ghost"
              onClick={handleBack}
            >
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            id="wizard-next-btn"
            className="btn btn-primary btn-lg"
            onClick={handleNext}
            disabled={!canProceed}
          >
            {step === TOTAL_STEPS ? 'Build My Plan' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
