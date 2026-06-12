import React, { useState, useMemo, useEffect, useRef } from 'react';
import './PlanPage.css';
import { filterExercises, inferLevel, getDayCount } from '../filterExercises';
import { capitalize } from '../utils/helpers';
import { generatePlan } from '../services/geminiService';
import { GOAL_OPTIONS } from '../utils/constants';
import LoadingScreen from './LoadingScreen';
import ExerciseRow from './ExerciseRow';
import PickExerciseModal from './PickExerciseModal';
import DashboardLayout from "./DashboardLayout";
import StreakWidget from './StreakWidget';
import DailyQuestCard from './DailyQuestCard';
import { getDailyQuests, isQuestDoneToday } from '../utils/gamification';
import { Trophy, Plus, CheckCircle2 } from 'lucide-react';

const DAY_LABELS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

// ── Color tokens ────────────────────────────────────────────────────────────
const G = '#4ade80';               // primary green (new design)
const G_DIM = 'rgba(74,222,128,0.1)';  // badge fill
const G_BORDER = 'rgba(74,222,128,0.2)'; // badge border
const BLACK = '#0f0f0d';           // main bg (new design)
const BLACK_CARD = '#1c1c1a';      // card bg (new design)
const WHITE_60 = 'rgba(255,255,255,0.6)';
const WHITE_40 = 'rgba(255,255,255,0.4)';
const WHITE_10 = 'rgba(255,255,255,0.08)';

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
  exercises, prefs, savedPlan, setSavedPlan, onReset, onStartSession,
  onViewChange, sidebarOpen, onToggleSidebar, isMobile, onOpenSidebar,
  onCloseSidebar, streak = 0, history = [], completedQuests = [], onCompleteQuest,
  showCommitmentAfterPlan = false, setShowCommitmentAfterPlan,
}) {
  const [activeDay, setActiveDay] = useState(0);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(!savedPlan);
  const [planError, setPlanError] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyQuests = useMemo(() => getDailyQuests(todayStr), [todayStr]);

  const [isReordering, setIsReordering] = useState(false);
  const [sessionMode, setSessionMode] = useState('full');

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
        const planResult = await generatePlan({ ...prefs, level, score }, filtered, controller.signal);
        setSavedPlan(planResult); setIsLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        setPlanError(err.message); setIsLoading(false);
      }
    }
    if (filtered.length > 0) fetchPlan();
    else setIsLoading(false);
    return () => controller.abort();
  }, [filtered, prefs, level, score, savedPlan, setSavedPlan]);

  // Navigate to commitment page after plan finishes loading
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
  const dayCount = getDayCount(prefs.frequency);
  const currentDay = savedPlan ? (savedPlan[activeDay] ?? savedPlan[0]) : null;

  if (!prefs) return null;

  const workedOutToday = history.some(h => h.date === todayStr);

  const sessionExercises = (() => {
    if (!currentDay) return [];
    if (sessionMode === 'full') return currentDay.exercises;
    if (sessionMode === 'quick') return currentDay.exercises.filter(ex => ex?.category === 'strength' || ex?.category === 'plyometrics').slice(0, 3);
    if (sessionMode === 'recovery') return currentDay.exercises.filter(ex => ex?.category === 'stretching');
    return currentDay.exercises;
  })();

  const estMinutes = sessionExercises.length > 0
    ? Math.round(sessionExercises.reduce((sum, ex) => sum + ((ex?.sets || 0) * ((ex?.reps || 10) * 4 + (ex?.restSeconds || 60))), 0) / 60)
    : 0;
  const totalSets = sessionExercises.reduce((sum, ex) => sum + (ex?.sets || 0), 0);
  const totalReps = sessionExercises.reduce((sum, ex) => sum + ((ex?.sets || 0) * (ex?.reps || 0)), 0);
  const totalKcal = sessionExercises.reduce((sum, ex) => sum + estimateCalories(ex), 0);
  const currentStepIdx = currentDay?.progress?.stepIdx || 0;

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

  // ─── Right Summary Panel ───────────────────────────────────────────────────
  const totalExercisesCount = sessionExercises.length;
  const completedExercisesCount = currentDay?.completed ? totalExercisesCount : Math.min(currentStepIdx, totalExercisesCount);
  const progressPct = totalExercisesCount > 0 ? Math.round((completedExercisesCount / totalExercisesCount) * 100) : 0;
  const ringR = 36;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc - (ringCirc * progressPct) / 100;

  const completedQuestCount = dailyQuests.filter(q => isQuestDoneToday(q.id, completedQuests, history, streak)).length;

  const summaryPanel = (
    <>
      {/* ── Session Progress Ring ─────────────────────────────────────── */}
      <div className="plan-progress-ring">
        <div className="plan-ring-wrap">
          <svg width="80" height="80" viewBox="0 0 80 80">
            {/* Track */}
            <circle cx="40" cy="40" r={ringR} fill="none" stroke={WHITE_10} strokeWidth="7" />
            {/* Progress arc — green */}
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
          <div>
            {currentDay?.completed ? (
              <span className="plan-ring-badge">✓ Complete</span>
            ) : currentStepIdx > 0 ? (
              <span style={{ fontSize: '0.72rem', color: WHITE_40 }}>
                {completedExercisesCount} / {totalExercisesCount} done
              </span>
            ) : (
              <span style={{ fontSize: '0.72rem', color: WHITE_40 }}>
                {totalExercisesCount} exercises · ~{estMinutes} min
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Daily Quests ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={12} color={G} />
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

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div style={{ height: '1px', background: WHITE_10, marginBottom: '16px' }} />

      {/* ── Session Mode Picker ───────────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: '700', color: WHITE_40, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Mode
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { key: 'full',     label: 'Full session', desc: `${currentDay?.exercises?.length || 0} ex · ~${Math.round(currentDay?.exercises?.reduce((s, ex) => s + ((ex?.sets || 0) * ((ex?.reps || 10) * 4 + (ex?.restSeconds || 60))), 0) / 60) || 0} min`, badge: 'REC' },
            { key: 'quick',    label: 'Quick',        desc: '3 exercises · ~12 min' },
            { key: 'recovery', label: 'Recovery',     desc: 'Stretch only · ~10 min' },
          ].map((mode) => {
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
                    {mode.badge && isActive && <span className="plan-mode-badge">{mode.badge}</span>}
                  </div>
                  <div className="plan-mode-detail">{mode.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Muscles Targeted ─────────────────────────────────────────── */}
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
    >
      <div className="plan-page animate-fade-in" style={{ padding: '20px 24px', maxWidth: '100%' }}>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="plan-page-header">
          <div className="plan-page-title-group">
            <h1 className="plan-page-title">Your Weekly Plan</h1>
            <div className="plan-page-meta">
              <span>{capitalize(level)}</span>
              <span>/</span>
              {goalLabel && <span>{goalLabel}</span>}
              {goalLabel && <span>/</span>}
              <span>{dayCount} days/week</span>
            </div>
          </div>
          <StreakWidget streak={streak} workedOutToday={workedOutToday} compact />
        </div>

        {/* ── Weekly Day Strip ─────────────────────────────────────────────── */}
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
                {isDone && <div className="plan-day-tab-dot" />}
              </button>
            );
          })}
        </div>

        {/* ── Day Summary Bar ──────────────────────────────────────────────── */}
        {currentDay && (
          <div className="plan-day-summary">
            {/* Left — title + meta */}
            <div className="plan-day-summary-left">
              <div className="plan-day-summary-info">
                <h3>
                  {currentDay.label}
                  {currentDay.completed && (
                    <span className="plan-day-summary-badge">✓ DONE</span>
                  )}
                </h3>
                <p className="plan-day-summary-meta">
                  Day {currentDay.dayNumber} · {currentDay.exercises?.length} exercises · ~{estMinutes} min
                </p>
              </div>
            </div>

            {/* Right — stats + button */}
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
                  onClick={() => onStartSession({ ...currentDay, exercises: sessionExercises })}
                  className="plan-day-summary-button"
                >
                  {currentStepIdx > 0 ? 'Resume Session' : 'Start Session'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Exercise List Header ─────────────────────────────────────────── */}
        {currentDay && (
          <div className="plan-ex-list-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="plan-ex-count">
                {currentDay.exercises?.length} Exercises
              </span>
              {currentDay.completed && (
                <CheckCircle2 size={15} color={G} />
              )}
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

        {/* ── Exercise List ────────────────────────────────────────────────── */}
        {currentDay && (
          <>
            {sessionExercises.length === 0 ? (
              <div className="ex-list-empty">
                <p>No exercises for this mode. Try selecting another mode.</p>
              </div>
            ) : (
              <div className="ex-list animate-fade-up">
                {sessionExercises.filter(Boolean).map((ex, exIdx) => {
                  if (!ex) return null;
                  const kcal = estimateCalories(ex);
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
                      caloriesBurned={kcal}
                    />
                  );
                })}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}