import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './PlanPage.css';
import { filterExercises, inferLevel } from '../../filterExercises';
import { capitalize } from '../../utils/helpers';
import { generatePlan } from '../../services/geminiService';
import { GOAL_OPTIONS } from '../../utils/constants';
import LoadingScreen from '../WorkoutSession/LoadingScreen';
import ExerciseRow from './ExerciseRow';
import PickExerciseModal from './PickExerciseModal';
import DashboardLayout from "../Layout/DashboardLayout";
import StreakWidget from './StreakWidget';
import DailyQuestCard from './DailyQuestCard';
import { getDailyQuests, isQuestDoneToday } from '../../utils/xp';
import { Plus, Check, AlertTriangle } from 'lucide-react';

const DAY_LABELS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

const G = 'var(--plan-green)';               
const G_DIM = 'var(--plan-green-dim)';  
const G_BORDER = 'var(--plan-green-faint)'; 
const WHITE_60 = 'var(--text-secondary)';
const WHITE_40 = 'var(--text-muted)';
const WHITE_10 = 'var(--border-subtle)';

function estimateCalories(exercise) {
  const sets = exercise?.sets || 3;
  const reps = exercise?.reps || 10;
  const durationSec = exercise?.durationSeconds || null;
  const restSec = exercise?.restSeconds || 60;
  const MET_MAP = {
    strength: 5, cardio: 8, stretching: 2.5, plyometrics: 7,
    powerlifting: 6, olympic_weightlifting: 6, strongman: 6,
  };
  const met = MET_MAP[exercise?.category] || 4;
  const activeTimeSec = durationSec ? sets * durationSec : sets * (reps * 3);
  const totalTimeMin = (activeTimeSec + sets * restSec) / 60;
  return Math.round(met * 70 * (totalTimeMin / 60));
}

export default function PlanPage({
  exercises, prefs, savedPlan, setSavedPlan, onUpdatePrefs, onReset, onStartSession,
  onViewChange, sidebarOpen, onToggleSidebar, isMobile, onOpenSidebar,
  onCloseSidebar, streak = 0, history = [], completedQuests = [], onCompleteQuest,
  showCommitmentAfterPlan = false, setShowCommitmentAfterPlan,
  theme = 'dark', onToggleTheme, xp = 0,
}) {
  const [activeDay, setActiveDay] = useState(0);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(!savedPlan);
  const [planError, setPlanError] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyQuests = useMemo(() => getDailyQuests(todayStr), [todayStr]);

  const [isReordering, setIsReordering] = useState(false);
  const [sessionMode, setSessionMode] = useState('full');
  
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [injuryInput, setInjuryInput] = useState('');

  const handleReportInjury = () => {
    if (!injuryInput.trim() || !onUpdatePrefs) {
      setShowInjuryModal(false);
      return;
    }
    const newInjuries = injuryInput.split(',').map(s => s.trim()).filter(Boolean);
    const existing = Array.isArray(prefs?.injuries) ? prefs.injuries : [];
    const combined = Array.from(new Set([...existing, ...newInjuries]));
    
    onUpdatePrefs({ ...prefs, injuries: combined });
    setSavedPlan(null); 
    setShowInjuryModal(false);
    setInjuryInput('');
  };

  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (e, position) => {
    dragItem.current = position;
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    const targetNode = e.currentTarget;
    setTimeout(() => { if (targetNode?.style) targetNode.style.opacity = '0.4'; }, 0);
  };
  const handleDragEnter = (e, position) => { dragOverItem.current = position; };
  const handleDragEnd = (e) => {
    if (e.currentTarget?.style) e.currentTarget.style.opacity = '1';
    const fromIdx = dragItem.current;
    const toIdx = dragOverItem.current;
    if (typeof fromIdx === 'number' && typeof toIdx === 'number' && fromIdx !== toIdx) {
      setSavedPlan((prev) => {
        if (!prev || !prev[activeDay]) return prev;
        const next = [...prev];
        const dayExercises = [...next[activeDay].exercises];
        if (fromIdx >= 0 && fromIdx < dayExercises.length && toIdx >= 0 && toIdx < dayExercises.length) {
          const [movedItem] = dayExercises.splice(fromIdx, 1);
          if (movedItem) dayExercises.splice(toIdx, 0, movedItem);
          next[activeDay] = { ...next[activeDay], exercises: dayExercises.filter(Boolean) };
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

  const muscleCoverage = useMemo(() => {
    try {
      const day = savedPlan ? (savedPlan[activeDay] ?? savedPlan[0]) : null;
      if (!day?.exercises?.length) return [];
      const muscleCounts = {};
      const totalExercises = day.exercises.length;
      day.exercises.forEach(ex => {
        if (!ex) return;
        let primaryMuscles = ex.primaryMuscles;
        let secondaryMuscles = ex.secondaryMuscles;
        if (!primaryMuscles && !secondaryMuscles && ex.id && Array.isArray(exercises)) {
          const fullExercise = exercises.find(e => e?.id === ex.id);
          if (fullExercise) { primaryMuscles = fullExercise.primaryMuscles; secondaryMuscles = fullExercise.secondaryMuscles; }
        }
        primaryMuscles?.forEach(muscle => { if (typeof muscle === 'string') { const k = muscle.toLowerCase(); muscleCounts[k] = (muscleCounts[k] || 0) + 1; } });
        secondaryMuscles?.forEach(muscle => { if (typeof muscle === 'string') { const k = muscle.toLowerCase(); muscleCounts[k] = (muscleCounts[k] || 0) + 0.5; } });
      });
      return Object.entries(muscleCounts)
        .map(([muscle, count]) => ({ muscle: muscle.charAt(0).toUpperCase() + muscle.slice(1), percentage: Math.round((count / totalExercises) * 100) }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 6);
    } catch { return []; }
  }, [savedPlan, activeDay, exercises]);

  useEffect(() => {
    if (savedPlan) return;
    const controller = new AbortController();
    async function fetchPlan() {
      setIsLoading(true); setPlanError(null);
      try {
        const planResult = await generatePlan(
          { ...prefs, level, score },
          filtered,
          controller.signal,
          exercises,
        );
        setSavedPlan(planResult); setIsLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        setPlanError(err.message); setIsLoading(false);
      }
    }
    if (filtered.length > 0) fetchPlan();
    else setIsLoading(false);
    return () => controller.abort();
  }, [filtered, level, score, savedPlan, setSavedPlan, prefs, exercises]);

  useEffect(() => {
    if (!savedPlan || savedPlan.length === 0) return;
    const firstExercise = savedPlan[0]?.exercises?.[0];
    const isStale = firstExercise && !firstExercise.phase;
    if (isStale) {
      setSavedPlan(null);
    }
  }, [savedPlan, setSavedPlan]);

  
  useEffect(() => {
    if (showCommitmentAfterPlan && savedPlan && !isLoading) {
      onViewChange('commitment');
    }
  }, [showCommitmentAfterPlan, savedPlan, isLoading, onViewChange]);

  if (isLoading) return <LoadingScreen />;

  if (planError) {
    return (
      <div className="plan-page animate-fade-in">
        <div className="results-empty" style={{ marginTop: '80px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>!</div>
          <h3>Plan Generation Failed</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', color: 'var(--text-secondary)' }}>{planError}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '24px' }}>Retry Generation</button>
          <button className="btn btn-ghost" onClick={() => onViewChange('hero')} style={{ marginTop: '12px', display: 'block', margin: '12px auto 0' }}>← Change Preferences</button>
        </div>
      </div>
    );
  }

  if (!savedPlan || savedPlan.length === 0) {
    return (
      <div className="plan-page animate-fade-in">
        <div className="results-empty" style={{ marginTop: '80px' }}>
          <h3>No exercises matched your preferences</h3>
          <p>Try adjusting your equipment or injury settings.</p>
          <button className="btn btn-secondary" onClick={() => onViewChange('hero')} style={{ marginTop: '12px' }}>← Change Preferences</button>
        </div>
      </div>
    );
  }

  const goalLabel = GOAL_OPTIONS.find((o) => o.key === prefs.goal)?.label || '';
  const currentDay = savedPlan ? (savedPlan[activeDay] ?? savedPlan[0]) : null;

  if (!prefs) return null;

  const workedOutToday = history.some(h => h.date === todayStr);

  const PHASE_WARMUP   = (phase) => phase === 'warmup'   || phase === 'warm_up'   || phase === 'Phase 1';
  const PHASE_MAIN     = (phase) => phase === 'main'     || phase === 'Phase 2';
  const PHASE_COOLDOWN = (phase) => phase === 'cooldown' || phase === 'cool_down' || phase === 'Phase 3';

  const sessionExercises = (() => {
    if (!currentDay) return [];
    const all = currentDay.exercises;

    if (sessionMode === 'full') return all;

    if (sessionMode === 'quick') {
      const mainPhase = all.filter((ex) => ex?.phase && PHASE_MAIN(ex.phase));
      const fallback  = all.filter((ex) => !PHASE_WARMUP(ex?.phase) && !PHASE_COOLDOWN(ex?.phase) && ex?.category !== 'stretching');
      const pool = mainPhase.length > 0 ? mainPhase : fallback.length > 0 ? fallback : all;
      const count = prefs.sessionDuration === '20_30' ? 3 : prefs.sessionDuration === '30_45' ? 4 : 5;
      return pool.slice(0, count);
    }

    if (sessionMode === 'recovery') {
      const structured = all.filter((ex) => ex?.phase && (PHASE_WARMUP(ex.phase) || PHASE_COOLDOWN(ex.phase)));
      const fallback   = all.filter((ex) => ex?.category === 'stretching');
      return structured.length > 0 ? structured : fallback;
    }

    return all;
  })();

  function exDurationMinutes(ex) {
    if (!ex) return 0;
    const sets    = ex.sets || 1;
    const restSec = ex.restSeconds || 60;
    if (ex.durationSeconds) {
      return (sets * ex.durationSeconds + sets * restSec) / 60;
    }
    return (sets * ((ex.reps || 10) * 4) + sets * restSec) / 60;
  }

  const totalSets = sessionExercises.reduce((sum, ex) => sum + (ex?.sets || 0), 0);
  const totalReps = sessionExercises.reduce((sum, ex) => sum + ((ex?.sets || 0) * (ex?.reps || 0)), 0);
  const totalKcal = sessionExercises.reduce((sum, ex) => sum + estimateCalories(ex), 0);
  const isCorrectMode = currentDay?.progress?.mode === sessionMode || (!currentDay?.progress?.mode && sessionMode === 'full');
  const sessionProgress = isCorrectMode ? currentDay?.progress : null;
  const currentStepIdx = sessionProgress?.stepIdx || 0;

  function handleShuffle(dayIdx, exIdx) {
    setSavedPlan((prev) => {
      const next = prev.map((d) => ({ ...d, exercises: [...d.exercises] }));
      const day = next[dayIdx];
      const current = day.exercises[exIdx];
      const usedIds = new Set(day.exercises.map((e) => e.id));
      const candidates = filtered.filter((e) => e.category === current.category && !usedIds.has(e.id));
      if (candidates.length === 0) return prev;
      const replacement = candidates[Math.floor(Math.random() * candidates.length)];
      day.exercises[exIdx] = { ...replacement, sets: current.sets, reps: current.reps, durationSeconds: current.durationSeconds, restSeconds: current.restSeconds, note: `Focus on controlled movement throughout.` };
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
      day.exercises[exIdx] = { ...newExercise, sets: current.sets, reps: current.reps, durationSeconds: current.durationSeconds, restSeconds: current.restSeconds, note: `Focus on controlled movement throughout.` };
      return next;
    });
  }

  function handleAdd(dayIdx, newExercise) {
    setSavedPlan((prev) => {
      const next = prev.map((d) => ({ ...d, exercises: [...d.exercises] }));
      const day = next[dayIdx];
      day.exercises.push({ ...newExercise, sets: 3, reps: 10, durationSeconds: null, restSeconds: 60, note: `Focus on controlled movement throughout.` });
      return next;
    });
  }

  

  
  const steps = sessionExercises.flatMap((ex, ei) =>
    Array.from({ length: ex.sets || 1 }, (_, si) => ({ ei }))
  );

  
  
  
  const progressPct = currentDay?.completed 
    ? 100 
    : steps.length > 0 ? Math.round((currentStepIdx / steps.length) * 100) : 0;
  const ringR = 36;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc - (ringCirc * progressPct) / 100;

  const completedQuestCount = dailyQuests.filter(q => isQuestDoneToday(q.id, completedQuests, history, streak)).length;

  const summaryPanel = (
    <>
      
      <div className="plan-progress-ring">
        <div className="plan-ring-wrap">
          <svg width="80" height="80" viewBox="0 0 80 80">
            
            <circle cx="40" cy="40" r={ringR} fill="none" stroke={WHITE_10} strokeWidth="7" />
            
            <circle
              cx="40" cy="40" r={ringR} fill="none"
              stroke={currentDay?.completed ? G : G}
              strokeWidth="7" strokeLinecap="round"
              strokeDasharray={ringCirc} strokeDashoffset={ringOffset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="plan-ring-percentage">{progressPct}%</div>
        </div>

        <div>
          <p className="plan-ring-label">Session Progress</p>
          <p className="plan-ring-session">{currentDay?.label || 'Today'}</p>
          
        </div>
      </div>

      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: '700', color: WHITE_40, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Mode
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {(() => {
            const allEx = currentDay?.exercises || [];

            const quickMain = allEx.filter((ex) => ex?.phase && PHASE_MAIN(ex.phase));
            const quickFallback = allEx.filter((ex) => !PHASE_WARMUP(ex?.phase) && !PHASE_COOLDOWN(ex?.phase) && ex?.category !== 'stretching');
            const quickPool = quickMain.length > 0 ? quickMain : quickFallback.length > 0 ? quickFallback : allEx;
            const quickCount = prefs.sessionDuration === '20_30' ? 3 : prefs.sessionDuration === '30_45' ? 4 : 5;
            const quickExs = quickPool.slice(0, quickCount);
            const quickMins = Math.round(quickExs.reduce((s, ex) => s + exDurationMinutes(ex), 0));

            const recovExs = (() => {
              const structured = allEx.filter((ex) => ex?.phase && (PHASE_WARMUP(ex.phase) || PHASE_COOLDOWN(ex.phase)));
              const fb = allEx.filter((ex) => ex?.category === 'stretching');
              return structured.length > 0 ? structured : fb;
            })();
            const recovMins = Math.round(recovExs.reduce((s, ex) => s + exDurationMinutes(ex), 0));

            const fullMins = Math.round(allEx.reduce((s, ex) => s + exDurationMinutes(ex), 0));

            const modes = [
              { key: 'full',     label: 'Full session', desc: <>{allEx.length} ex <span style={{ opacity: 0.3 }}>|</span> ~{fullMins} min</>,                      badge: 'Recommended' },
              { key: 'quick',    label: 'Quick session',        desc: <>{quickExs.length} ex <span style={{ opacity: 0.3 }}>|</span> ~{quickMins || 12} min</>,             badge: null },
              { key: 'recovery', label: 'Recovery',     desc: <>{recovExs.length} ex <span style={{ opacity: 0.3 }}>|</span> ~{recovMins || 10} min (mobility)</>, badge: null },
            ];

            return modes.map((mode) => {
              const isActive = sessionMode === mode.key;
              return (
                <button
                  key={mode.key}
                  onClick={() => setSessionMode(mode.key)}
                  className={`plan-mode-row ${isActive ? 'active' : ''}`}
                >
                  <div className="plan-mode-radio"><div className="plan-mode-radio-dot"></div></div>
                  <div className="plan-mode-info">
                    <div className="plan-mode-name">
                      {mode.label}
                      {mode.badge && <span className="plan-mode-badge">{mode.badge}</span>}
                    </div>
                    <div className="plan-mode-detail">{mode.desc}</div>
                  </div>
                </button>
              );
            });
          })()}
        </div>
      </div>

      
      <div style={{ height: '1px', background: WHITE_10, marginBottom: '16px' }} />

      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: '700', color: WHITE_40, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Daily Quests
            </p>
          </div>
          <span style={{
            fontSize: '0.65rem', fontWeight: '700',
            background: completedQuestCount === dailyQuests.length ? G_DIM : WHITE_10,
            color: completedQuestCount === dailyQuests.length ? G : WHITE_60,
            border: `1px solid ${completedQuestCount === dailyQuests.length ? G_BORDER : WHITE_10}`,
            padding: '2px 8px', borderRadius: '20px',
          }}>
            {completedQuestCount}/{dailyQuests.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {dailyQuests.map((quest) => {
            const isDone = isQuestDoneToday(quest.id, completedQuests, history, streak);
            return (
              <DailyQuestCard
                key={quest.id}
                quest={quest}
                isDone={isDone}
                onComplete={onCompleteQuest}
                compact
              />
            );
          })}
        </div>
      </div>

      
      {muscleCoverage.length > 0 && (
        <>
          <div style={{ height: '1px', background: WHITE_10, marginBottom: '16px' }} />
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: '700', color: WHITE_40, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Muscles Targeted
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {muscleCoverage.map(({ muscle, percentage }) => (
                <div key={muscle} className="plan-muscle-row">
                  <span className="plan-muscle-name">{muscle}</span>
                  <div className="plan-muscle-bar-track">
                    <div className="plan-muscle-bar-fill" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="plan-muscle-pct">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />
    </>
  );

  return (
    <DashboardLayout
      activeTab="plan"
      onViewChange={onViewChange}
      summaryPanel={summaryPanel}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
      isMobile={isMobile}
      onOpenSidebar={onOpenSidebar}
      onCloseSidebar={onCloseSidebar}
      theme={theme}
      onToggleTheme={onToggleTheme}
      xp={xp}
    >
      <div className="plan-page animate-fade-in" style={{ padding: '20px 24px', maxWidth: '100%' }}>

        
        <div className="plan-page-header">
          <div className="plan-page-title-group">
            <h1 className="plan-page-title">This Week's Plan</h1>
            <div className="plan-page-meta">
              <span>{capitalize(level)}</span>
              <span>/</span>
              {goalLabel && <span>{goalLabel}</span>}
              <button 
                onClick={() => setShowInjuryModal(true)} 
                className="btn btn-ghost" 
                style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', fontSize: '0.75rem', height: 'auto', marginLeft: '12px', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}
              >
                <AlertTriangle size={14} style={{ marginRight: '6px', color: 'var(--text-muted)' }} />
                Report Injury
              </button>
            </div>
          </div>
          <StreakWidget streak={streak} workedOutToday={workedOutToday} compact />
        </div>

        
        <div className="plan-day-tabs">
          {savedPlan.map((day, i) => {
            const dayLabel = DAY_LABELS[i] || `D${i + 1}`;
            const isActive = activeDay === i;
            const isDone = day.completed;
            return (
              <button
                key={day.key}
                onClick={() => setActiveDay(i)}
                className={`plan-day-tab ${isActive ? 'active' : ''}`}
              >
                <span>{dayLabel}</span>
                {isDone && <Check size={12} strokeWidth={3} color="currentColor" style={{ marginLeft: '4px' }} />}
              </button>
            );
          })}
        </div>

        
        {currentDay && (
          <div className="plan-day-summary">
            
            <div className="plan-day-summary-left">
              <div className="plan-day-summary-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0 }}>{currentDay.label}</h3>
                </div>
                {currentDay.coachNote && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4', borderLeft: '2px solid var(--plan-green)', paddingLeft: '8px' }}>
                    {currentDay.coachNote}
                  </p>
                )}
              </div>
            </div>

            
            <div className="plan-day-summary-right">
              <div className="plan-day-summary-stats">
                {[
                  { val: totalSets, label: 'Sets' },
                  { val: totalReps, label: 'Reps' },
                  { val: `~${totalKcal}`, label: 'Kcal' },
                ].map((stat) => (
                  <div key={stat.label} className="plan-day-summary-stat">
                    <div className="plan-day-summary-stat-val">{stat.val}</div>
                    <div className="plan-day-summary-stat-lbl">{stat.label}</div>
                  </div>
                ))}
              </div>

              {!currentDay.completed && (
                <button
                  onClick={() => onStartSession({ ...currentDay, exercises: sessionExercises, mode: sessionMode, progress: sessionProgress })}
                  className="plan-day-summary-button"
                >
                  {currentStepIdx > 0 ? 'Resume Session' : 'Start Session'}
                </button>
              )}
            </div>
          </div>
        )}

        
        {currentDay && (
          <div className="plan-ex-list-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="plan-ex-count">
                {sessionExercises.length} Exercises
                {sessionMode !== 'full' && (
                  <span style={{ fontSize: '0.65rem', color: WHITE_40, fontWeight: 400, marginLeft: '6px' }}>
                    ({sessionMode} mode)
                  </span>
                )}
              </span>
            </div>
            <div className="plan-ex-actions-header">
              <button
                onClick={() => setShowAddPicker(true)}
                className="plan-btn-icon"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setIsReordering(!isReordering)}
                className="plan-btn-secondary"
                style={{
                  background: isReordering ? G_DIM : 'var(--bg-elevated)',
                  color: isReordering ? G : 'var(--text-secondary)',
                  borderColor: isReordering ? G_BORDER : 'var(--border-subtle)',
                }}
              >
                {isReordering ? '✓ Done' : 'Edit Order'}
              </button>
            </div>
          </div>
        )}

        
        {currentDay && (
          <>
            {sessionExercises.length === 0 ? (
              <div className="ex-list-empty">
                <p>No exercises for this mode. Try selecting another mode.</p>
              </div>
            ) : (
              <div className="ex-list animate-fade-up">
                {(() => {
                  let currentPhase = null;
                  return sessionExercises.filter(Boolean).map((ex, exIdx) => {
                    const kcal = estimateCalories(ex);
                    const isNewPhase = ex.phase && ex.phase !== currentPhase;
                    if (isNewPhase) currentPhase = ex.phase;
                    const phaseLabel = ex.phase === 'warmup' ? 'Warm-up' : ex.phase === 'cooldown' ? 'Cool-down' : 'Main Workout';

                    return (
                      <React.Fragment key={`${ex.id}-${exIdx}`}>
                        {isNewPhase && (
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--plan-green)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: exIdx === 0 ? '0' : '12px', marginBottom: '4px', paddingLeft: '4px' }}>
                            {phaseLabel}
                          </div>
                        )}
                        {(() => {
                          const completedSteps = sessionProgress?.completedSteps || [];
                          const exStepIndices = steps.map((s, i) => s.ei === exIdx ? i : -1).filter(i => i !== -1);
                          const isExCompleted = currentDay?.completed || (
                            exStepIndices.length > 0 && exStepIndices.every(i => completedSteps.includes(i))
                          );
                          return (
                            <ExerciseRow
                              exercise={ex}
                              index={exIdx}
                              isCompleted={isExCompleted}
                              filteredPool={filtered}
                              onShuffle={() => handleShuffle(activeDay, exIdx)}
                              onDelete={() => handleDelete(activeDay, exIdx)}
                              onPick={(newEx) => handlePick(activeDay, exIdx, newEx)}
                              isReordering={isReordering}
                              onDragStart={isReordering ? handleDragStart : undefined}
                              onDragEnter={isReordering ? handleDragEnter : undefined}
                              onDragEnd={isReordering ? handleDragEnd : undefined}
                              caloriesBurned={kcal}
                              onStartFromHere={() => onStartSession({ ...currentDay, exercises: sessionExercises, startExerciseIdx: exIdx, mode: sessionMode, progress: sessionProgress })}
                            />
                          );
                        })()}
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            )}

            {showAddPicker && (
              <PickExerciseModal
                allExercises={filtered}
                currentId={null}
                onPick={(ex) => { handleAdd(activeDay, ex); setShowAddPicker(false); }}
                onClose={() => setShowAddPicker(false)}
              />
            )}

            {showInjuryModal && createPortal(
              <div className="modal-overlay">
                <div className="modal-content animate-pop-in" style={{ maxWidth: '400px' }}>
                  <div className="modal-header">
                    <h2 className="modal-title">Report Injury</h2>
                    <button className="modal-close-btn" onClick={() => setShowInjuryModal(false)}>×</button>
                  </div>
                  <div className="modal-body">
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Please describe any new injuries or restrictions (e.g. "Knee pain", "Lower back"). We'll instantly adapt your current plan to keep you safe.
                    </p>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Bad shoulder"
                      value={injuryInput}
                      onChange={(e) => setInjuryInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleReportInjury(); }}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', marginBottom: '20px' }}
                    />
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button className="btn" onClick={() => setShowInjuryModal(false)}>Cancel</button>
                      <button className="btn btn-primary" onClick={handleReportInjury} disabled={!injuryInput.trim()}>
                        Update Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}