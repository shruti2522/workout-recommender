import React, { useState, useMemo, useEffect, useRef } from 'react';
import { filterExercises, inferLevel, getDayCount } from '../filterExercises';
import { LEVEL_COLORS, capitalize } from '../utils/helpers';
import { generatePlan } from '../services/geminiService';
import { GOAL_OPTIONS, TARGET_AREA_OPTIONS } from './Wizard/WizardSteps';
import LoadingScreen from './LoadingScreen';
import ExerciseRow from './ExerciseRow';
import PickExerciseModal from './PickExerciseModal';

import DashboardLayout from "./DashboardLayout";

export default function PlanPage({ exercises, prefs, savedPlan, setSavedPlan, onReset, onStartSession, onViewChange }) {
  const [activeDay, setActiveDay] = useState(0);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(!savedPlan);
  const [planError, setPlanError] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (e, position) => {
    dragItem.current = position;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
    
    const targetNode = e.currentTarget;
    setTimeout(() => {
      if (targetNode && targetNode.style) {
        targetNode.style.opacity = '0.4';
      }
    }, 0);
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e) => {
    if (e.currentTarget && e.currentTarget.style) {
      e.currentTarget.style.opacity = '1';
    }
    
    const fromIdx = dragItem.current;
    const toIdx = dragOverItem.current;

    if (
      typeof fromIdx === 'number' && 
      typeof toIdx === 'number' && 
      fromIdx !== toIdx
    ) {
      setSavedPlan((prev) => {
        if (!prev || !prev[activeDay]) return prev;
        
        const next = [...prev];
        const dayExercises = [...next[activeDay].exercises];
        
        if (
          fromIdx >= 0 && fromIdx < dayExercises.length && 
          toIdx >= 0 && toIdx < dayExercises.length
        ) {
          const [movedItem] = dayExercises.splice(fromIdx, 1);
          if (movedItem) {
            dayExercises.splice(toIdx, 0, movedItem);
          }
          
          next[activeDay] = { 
            ...next[activeDay], 
            exercises: dayExercises.filter(Boolean) 
          };
        }
        return next;
      });
    }
    
    dragItem.current = undefined;
    dragOverItem.current = undefined;
  };

  const { level, score } = inferLevel(prefs.frequency, prefs.duration);

  const filtered = useMemo(
    () => filterExercises(exercises, { level, equipmentLabels: prefs.equipment, injuries: prefs.injuries }),
    [exercises, level, prefs.equipment, prefs.injuries]
  );

  
  useEffect(() => {
    if (savedPlan) return;
    let cancelled = false;
    async function fetchPlan() {
      setIsLoading(true);
      setPlanError(null);
      try {
        const planResult = await generatePlan({ ...prefs, level, score }, filtered);
        if (!cancelled) setSavedPlan(planResult);
      } catch (err) {
        if (!cancelled) setPlanError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    if (filtered.length > 0) fetchPlan();
    else setIsLoading(false);
    return () => { cancelled = true; };
  }, [filtered, prefs, level, score, savedPlan, setSavedPlan]);

  const currentDay = savedPlan ? (savedPlan[activeDay] ?? savedPlan[0]) : null;
  const dayCount = getDayCount(prefs.frequency);

  function handleShuffle(dayIdx, exIdx) {
    setSavedPlan((prev) => {
      const next = prev.map((d) => ({ ...d, exercises: [...d.exercises] }));
      const day = next[dayIdx];
      const current = day.exercises[exIdx];
      
      const usedIds = new Set(day.exercises.map((e) => e.id));
      const candidates = filtered.filter(
        (e) => e.category === current.category && !usedIds.has(e.id)
      );
      if (candidates.length === 0) return prev; 
      const replacement = candidates[Math.floor(Math.random() * candidates.length)];
      day.exercises[exIdx] = {
        ...replacement,
        sets: current.sets,
        reps: current.reps,
        durationSeconds: current.durationSeconds,
        restSeconds: current.restSeconds,
        note: `Focus on controlled movement throughout.`,
      };
      return next;
    });
  }

  function handleDelete(dayIdx, exIdx) {
    setSavedPlan((prev) => {
      const next = prev.map((d) => ({ ...d, exercises: [...d.exercises] }));
      next[dayIdx].exercises.splice(exIdx, 1);
      return next;
    });
  }

  function handlePick(dayIdx, exIdx, newExercise) {
    setSavedPlan((prev) => {
      const next = prev.map((d) => ({ ...d, exercises: [...d.exercises] }));
      const day = next[dayIdx];
      const current = day.exercises[exIdx];
      day.exercises[exIdx] = {
        ...newExercise,
        sets: current.sets,
        reps: current.reps,
        durationSeconds: current.durationSeconds,
        restSeconds: current.restSeconds,
        note: `Focus on controlled movement throughout.`,
      };
      return next;
    });
  }

  function handleAdd(dayIdx, newExercise) {
    setSavedPlan((prev) => {
      const next = prev.map((d) => ({ ...d, exercises: [...d.exercises] }));
      const day = next[dayIdx];
      day.exercises.push({
        ...newExercise,
        sets: 3,
        reps: 10,
        durationSeconds: null,
        restSeconds: 60,
        note: `Focus on controlled movement throughout.`,
      });
      return next;
    });
  }

  if (isLoading) return <LoadingScreen />;

  if (planError) {
    return (
      <div className="plan-page animate-fade-in">
        <div className="results-empty" style={{ marginTop: '80px' }}>
          <div className="error-icon" style={{ fontSize: '3rem', marginBottom: '16px' }}>!</div>
          <h3>Plan Generation Failed</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', color: 'var(--text-secondary)' }}>{planError}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '24px' }}>
            Retry Generation
          </button>
          <button className="btn btn-ghost" onClick={onReset} style={{ marginTop: '12px', display: 'block', margin: '12px auto 0' }}>
            ← Change Preferences
          </button>
        </div>
      </div>
    );
  }

  const goalLabel = GOAL_OPTIONS.find((o) => o.key === prefs.goal)?.label || '';
  const areaLabels = prefs.targetAreas?.map((k) => TARGET_AREA_OPTIONS.find((o) => o.key === k)?.label).filter(Boolean) || [];

  if (!savedPlan || savedPlan.length === 0) {
    return (
      <div className="plan-page animate-fade-in">
        <div className="results-empty" style={{ marginTop: '80px' }}>
          <h3>No exercises matched your preferences</h3>
          <p>Try adjusting your equipment or injury settings.</p>
          <button className="btn btn-secondary" onClick={onReset} style={{ marginTop: '12px' }}>← Change Preferences</button>
        </div>
      </div>
    );
  }

  // Calculate metrics for right panel
  const totalSets = currentDay ? currentDay.exercises.reduce((sum, ex) => sum + (ex?.sets || 0), 0) : 0;
  const totalReps = currentDay ? currentDay.exercises.reduce((sum, ex) => sum + ((ex?.sets || 0) * (ex?.reps || 0)), 0) : 0;
  const estMinutes = currentDay ? Math.round(currentDay.exercises.reduce((sum, ex) => sum + ((ex?.sets || 0) * ((ex?.reps || 10) * 4 + (ex?.restSeconds || 60))), 0) / 60) : 0;


  
  // Session progress
  const currentStepIdx = currentDay?.progress?.stepIdx || 0;
  const sessionProgressPct = currentDay?.completed ? 100 : Math.round((currentStepIdx / Math.max(1, totalSets)) * 100);
  const setsDone = currentDay?.completed ? totalSets : currentStepIdx;
  const remMinutes = currentDay?.completed ? 0 : Math.max(0, Math.round(estMinutes * (1 - sessionProgressPct / 100)));


  const summaryPanel = (
    <>
      <div className="summary-section">
        <div className="summary-title">Session Progress</div>
        <div className="summary-progress-wrap">
          <div className="summary-circle">
            <svg viewBox="0 0 36 36">
              <circle className="summary-circle-bg" cx="18" cy="18" r="15.915" />
              <circle className="summary-circle-fill" cx="18" cy="18" r="15.915" strokeDasharray={`${sessionProgressPct}, 100`} />
            </svg>
            <div className="summary-circle-text">{sessionProgressPct}%</div>
          </div>
          <div className="summary-progress-info">
            <span className="summary-progress-done">{setsDone} of {totalSets} sets done</span>
            <span className="summary-progress-rem">~{remMinutes} min remaining</span>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-title">Today's Volume</div>
        <div className="summary-grid">
          <div>
            <div className="summary-stat-val">{totalSets}</div>
            <div className="summary-stat-label">Total sets</div>
          </div>
          <div>
            <div className="summary-stat-val">{totalReps}</div>
            <div className="summary-stat-label">Total reps</div>
          </div>
          <div>
            <div className="summary-stat-val">{estMinutes}</div>
            <div className="summary-stat-label">Est. minutes</div>
          </div>
          <div>
            <div className="summary-stat-val" style={{color: 'var(--accent-primary)'}}>~{Math.round(estMinutes * 7)}</div>
            <div className="summary-stat-label">Est. kcal</div>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-title">Muscles Targeted</div>
        <div className="summary-muscle-row">
          <div className="summary-muscle-name">Quadriceps</div>
          <div className="summary-muscle-bar-wrap"><div className="summary-muscle-bar" style={{width: '90%'}} /></div>
          <div className="summary-muscle-pct">90%</div>
        </div>
        <div className="summary-muscle-row">
          <div className="summary-muscle-name">Hamstrings</div>
          <div className="summary-muscle-bar-wrap"><div className="summary-muscle-bar" style={{width: '70%'}} /></div>
          <div className="summary-muscle-pct">70%</div>
        </div>
        <div className="summary-muscle-row">
          <div className="summary-muscle-name">Glutes</div>
          <div className="summary-muscle-bar-wrap"><div className="summary-muscle-bar" style={{width: '55%'}} /></div>
          <div className="summary-muscle-pct">55%</div>
        </div>
        <div className="summary-muscle-row">
          <div className="summary-muscle-name">Calves</div>
          <div className="summary-muscle-bar-wrap"><div className="summary-muscle-bar" style={{width: '30%'}} /></div>
          <div className="summary-muscle-pct">30%</div>
        </div>
      </div>



      <div className="sidebar-spacer" />
      <button className="btn btn-primary btn-lg" style={{width: '100%', marginBottom: '12px'}} onClick={() => onStartSession(currentDay)}>
        {currentDay?.completed ? 'Review Session' : currentStepIdx > 0 ? 'Resume Session' : 'Start Session'}
      </button>
      <button className="btn btn-ghost" style={{width: '100%', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)'}} onClick={onReset}>
        Change Preferences
      </button>
    </>
  );

  return (
    <DashboardLayout activeTab="plan" onViewChange={onViewChange} summaryPanel={summaryPanel}>
      <div className="plan-page">


          {/* Banner */}
          <div className="plan-banner">
            <div className="plan-banner-inner">
              <div>
                <h1 className="plan-title">Your Custom Plan</h1>
                <div className="plan-meta">
                  <span className={`badge ${LEVEL_COLORS[level] || 'badge-gray'}`}>{capitalize(level)}</span>
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-subtle)", margin: "0 4px" }} />
                  <span className="badge badge-gray" style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}>
                    Level: {score}/10
                  </span>
                  {goalLabel && <><span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-subtle)", margin: "0 4px" }} /><span>{goalLabel}</span></>}
                  {areaLabels.length > 0 && <><span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-subtle)", margin: "0 4px" }} /><span>{areaLabels.join(', ')}</span></>}
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border-subtle)", margin: "0 4px" }} />
                  <span>{dayCount} day{dayCount !== 1 ? 's' : ''}/week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="plan-tabs-wrap">
            <div className="plan-tabs" role="tablist" aria-label="Workout days">
              {savedPlan.map((day, i) => (
                <button
                  key={day.key}
                  id={`day-tab-${i}`}
                  role="tab"
                  aria-selected={activeDay === i}
                  aria-controls={`day-panel-${i}`}
                  className={`plan-tab${activeDay === i ? ' active' : ''}`}
                  onClick={() => setActiveDay(i)}
                >
                  <span className="plan-tab-inner">
                    <span className="plan-tab-day">
                      Day {day.dayNumber}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {currentDay && (
            <div id={`day-panel-${activeDay}`} className="plan-day-content" role="tabpanel" aria-labelledby={`day-tab-${activeDay}`}>
              <div className="plan-day-header">
                <div className="plan-day-header-text">
                  <h2 className="plan-day-title">Day {currentDay.dayNumber} — {currentDay.label}</h2>
                  <p className="plan-day-focus">{currentDay.focus}</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.85rem', fontWeight: '500' }}>
                  <button 
                    className="btn btn-sm btn-ghost" 
                    onClick={() => setIsReordering(!isReordering)}
                    style={{ color: isReordering ? 'var(--accent-primary)' : 'var(--text-primary)', padding: 0 }}
                  >
                    {isReordering ? 'Done Editing' : 'Edit Order'}
                  </button>
                  <span>{currentDay.exercises.length} exercises</span>
                  <span className="badge badge-gray" style={{fontSize: "0.85rem", padding: "4px 10px", fontWeight: "600"}}>~{estMinutes} min</span>
                </div>
              </div>

              {currentDay.exercises.length === 0 ? (
                <div className="results-empty" style={{ padding: '40px 0' }}>
                  <p>No exercises left. Go back to add more.</p>
                </div>
              ) : (
                <div className="ex-list animate-fade-up">
                  {currentDay.exercises.filter(Boolean).map((ex, exIdx) => {
                    if (!ex) return null;
                    return (
                      <ExerciseRow
                        key={`${ex.id}-${exIdx}`}
                        exercise={ex}
                        index={exIdx}
                        filteredPool={filtered}
                        onShuffle={() => handleShuffle(activeDay, exIdx)}
                        onDelete={() => handleDelete(activeDay, exIdx)}
                        onPick={(newEx) => handlePick(activeDay, exIdx, newEx)}
                        isReordering={isReordering}
                        onDragStart={isReordering ? handleDragStart : undefined}
                        onDragEnter={isReordering ? handleDragEnter : undefined}
                        onDragEnd={isReordering ? handleDragEnd : undefined}
                      />
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: '20px', paddingBottom: '40px' }}>
                <button className="btn btn-sm btn-ghost" onClick={() => setShowAddPicker(true)} style={{ color: 'var(--text-primary)', padding: 0 }}>
                  + Add Exercise
                </button>
              </div>

              {showAddPicker && (
                <PickExerciseModal
                  allExercises={filtered}
                  currentId={null}
                  onPick={(ex) => { handleAdd(activeDay, ex); setShowAddPicker(false); }}
                  onClose={() => setShowAddPicker(false)}
                />
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
  );
}