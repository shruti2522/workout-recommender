import React, { useState, useEffect, useRef } from 'react';
import { getExerciseImageUrl, capitalize } from '../../utils/helpers';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

function SetTimer({ durationSeconds, onDone }) {
	const isCountdown = !!durationSeconds;
	const [elapsed, setElapsed] = useState(0);
	const startRef = useRef(Date.now());
	const onDoneRef = useRef(onDone);

	useEffect(() => {
		onDoneRef.current = onDone;
	}, [onDone]);

	useEffect(() => {
		startRef.current = Date.now();
		setElapsed(0);
	}, [durationSeconds]);

	useEffect(() => {
		const t = setInterval(() => {
			const currentElapsed = Math.floor((Date.now() - startRef.current) / 1000);
			if (isCountdown && currentElapsed >= durationSeconds) {
				setElapsed(durationSeconds);
				clearInterval(t);
				onDoneRef.current();
			} else {
				setElapsed(currentElapsed);
			}
		}, 200);
		return () => clearInterval(t);
	}, [isCountdown, durationSeconds]);

	const remaining = isCountdown ? Math.max(0, durationSeconds - elapsed) : elapsed;
	
	
	const pct = isCountdown
		? (elapsed / durationSeconds) * 100
		: ((elapsed % 60) / 60) * 100;

	return (
		<div className="set-timer-wrap">
			<div className="rest-timer-circle" style={{ width: 120, height: 120 }}>
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

export default function WorkoutSession({ day, onBack, onComplete, onUpdateProgress }) {
	const exercises = day.exercises;

	const steps = exercises.flatMap((ex, ei) =>
		Array.from({ length: ex.sets || 1 }, (_, si) => ({ ei, si, total: ex.sets || 1 }))
	);

	const [stepIdx, setStepIdx] = useState(() => {
		if (day.startExerciseIdx !== undefined) {
			const idx = steps.findIndex(s => s.ei === day.startExerciseIdx);
			return idx >= 0 ? idx : 0;
		}
		return day.progress?.stepIdx || 0;
	});
	const [completedSteps, setCompletedSteps] = useState(() => {
		return day.progress?.completedSteps || [];
	});
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
			onUpdateProgress(stepIdx, 'exercise', completedSteps);
		}
	}, [stepIdx, completedSteps, onUpdateProgress]);

	const totalSteps = steps.length;
	const progress = (stepIdx / totalSteps) * 100;

	const currentStep = steps[stepIdx];
	if (!currentStep) return null;
	const ex = exercises[currentStep.ei];
	const isLastStep = stepIdx === totalSteps - 1;
	const imageUrl1 = ex.images?.[0] ? getExerciseImageUrl(ex.images[0]) : null;
	const imageUrl2 = ex.images?.[1] ? getExerciseImageUrl(ex.images[1]) : null;

	function advance() {
		if (isLastStep) {
			onComplete(elapsed);
		} else {
			setStepIdx((i) => i + 1);
			setSetTimerKey((k) => k + 1);
		}
	}

	function nextExercise() {
		const nextStepIdx = steps.findIndex((s, i) => i > stepIdx && s.ei > currentStep.ei);
		if (nextStepIdx === -1) {
			onComplete(elapsed);
		} else {
			setStepIdx(nextStepIdx);
			setSetTimerKey((k) => k + 1);
		}
	}

	function prevExercise() {
		const prevExIdx = currentStep.ei - 1;
		if (prevExIdx >= 0) {
			const targetStepIdx = steps.findIndex(s => s.ei === prevExIdx);
			if (targetStepIdx !== -1) {
				setStepIdx(targetStepIdx);
				setSetTimerKey((k) => k + 1);
			}
		}
	}

	function finishSet() {
		setCompletedSteps(prev => Array.from(new Set([...prev, stepIdx])));
		advance();
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
			{ }
			<div className="session-header">
				<button className="btn btn-ghost btn-sm" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={16} /> Back to Plan
        </button>
				<span className="session-elapsed">{formatTime(elapsed)}</span>
			</div>

			{ }
			<div className="session-progress-wrap" aria-label={`${Math.round(progress)}% complete`}>
				<div className="session-progress-bar" style={{ width: `${progress}%` }} />
			</div>
			<p className="session-progress-label">
				Exercise {currentStep.ei + 1} of {exercises.length}
			</p>

			{ }
			<div className="session-exercise split-layout animate-fade-in">
				
				<div className="session-ex-left">
					<div className="session-ex-images">
						{imageUrl1 && !imgError ? (
							<img src={imageUrl1} alt={ex.name} className="session-ex-image" onError={() => setImgError(true)} />
						) : <div className="session-ex-image-fallback" />}
						{imageUrl2 && !imgError && (
							<img src={imageUrl2} alt={ex.name} className="session-ex-image" onError={() => setImgError(true)} />
						)}
					</div>
				</div>

				
				<div className="session-ex-center">
					<div className="session-ex-info">
						{ex.phase && (
							<div style={{ color: 'var(--plan-green)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
								{ex.phase === 'warmup' ? 'Warm-up' : ex.phase === 'cooldown' ? 'Cool-down' : 'Main Workout'}
							</div>
						)}
						<h2 className="session-ex-name">{ex.name}</h2>

						<div className="session-ex-badges">
							<span className="prescription-effort">
								{ex.durationSeconds ? `${ex.durationSeconds}s hold` : `${ex.reps || 0} reps`}
							</span>
							{ex.restSeconds > 0 && (
								<span className="prescription-rest">Rest {ex.restSeconds}s after</span>
							)}
						</div>

						<p className="session-ex-muscles">
							{(ex.primaryMuscles || []).map(capitalize).join(', ')}
						</p>
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
					{ex.note && <p className="session-ex-note">{ex.note}</p>}
				</div>

				
				<div className="session-ex-right">
					<div className="session-ex-controls">
						<div className="session-sets-container">
							{Array.from({ length: currentStep.total }).map((_, i) => {
								let statusClass = '';
								if (i < currentStep.si) statusClass = 'session-set-complete';
								else if (i === currentStep.si) statusClass = 'session-set-active';
								return (
									<div key={i} className={`session-set-badge ${statusClass}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
										{i < currentStep.si && <Check size={14} />}
										Set {i + 1}
									</div>
								);
							})}
						</div>

						<SetTimer
							key={setTimerKey}
							durationSeconds={ex.durationSeconds || null}
							onDone={handleSetTimerDone}
						/>
					</div>

					<div className="session-actions" style={{ flexDirection: 'column', gap: '12px' }}>
						<button
							id="done-set-btn"
							className="btn btn-primary btn-lg session-done-btn"
							onClick={finishSet}
						>
							{isLastStep ? 'Finish Workout' : 'Set Done'}
						</button>

						<div style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%' }}>
                {currentStep.ei > 0 && (
                  <button className="btn session-skip-btn" onClick={prevExercise} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <ChevronLeft size={16} /> Prev
                  </button>
                )}
                
                {currentStep.ei < exercises.length - 1 && (
                  <button className="btn session-skip-btn" onClick={nextExercise} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    Next <ChevronRight size={16} />
                  </button>
                )}
              </div>
              
              {ex.restSeconds > 0 && !isLastStep && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                  Rest {ex.restSeconds}s after this {(currentStep.si === currentStep.total - 1) ? 'exercise' : 'set'}
                </div>
              )}
					</div>
				</div>
			</div>
		</div>
	);
}
