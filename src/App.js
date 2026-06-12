import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import './App.css';

import { EXERCISES_URL } from './utils/helpers';
import HeroPage from './components/HeroPage';
import IntakeChat from './components/IntakeChat/IntakeChat';
import CommitmentPage from './components/CommitmentPage';
import PlanPage from './components/PlanPage';
import LibraryPage from './components/LibraryPage';
import ProgressPage from './components/ProgressPage';
import GoalPage from './components/GoalPage';
import HistoryPage from './components/HistoryPage';

import WorkoutSession from './components/WorkoutSession';
import WorkoutComplete from './components/WorkoutComplete';
import BadgeToast from './components/BadgeToast';
import { calculateStreak, calculateTotalXP, getUnlockedBadges } from './utils/gamification';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading localStorage', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn('Error setting localStorage', error);
    }
  }, [key]);

  return [storedValue, setValue];
}

function App() {
  const [view, setView] = useLocalStorage('fs_view', 'hero'); 
  const [exercises, setExercises] = useState([]);
  const [prefs, setPrefs] = useLocalStorage('fs_prefs', null);
  const [sessionDay, setSessionDay] = useLocalStorage('fs_sessionDay', null);
  const [workoutElapsed, setWorkoutElapsed] = useLocalStorage('fs_elapsed', 0);
  const [savedPlan, setSavedPlan] = useLocalStorage('fs_plan', null);
  const [history, setHistory] = useLocalStorage('fs_history', []);
  const [completedQuests, setCompletedQuests] = useLocalStorage('fs_quests', []);
  const [unlockedBadges, setUnlockedBadges] = useLocalStorage('fs_badges', []);
  const [newBadgeQueue, setNewBadgeQueue] = useState([]);
  
  // New habit-first model state
  const [habitContract, setHabitContract] = useLocalStorage('fs_habitContract', null);
  const [currentWeek, setCurrentWeek] = useLocalStorage('fs_currentWeek', null);
  const [momentum, setMomentum] = useLocalStorage('fs_momentum', null);
  const [showCommitmentAfterPlan, setShowCommitmentAfterPlan] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prevIsMobile = useRef(null);

  // Derived state
  const streak = calculateStreak(history);
  const totalXP = calculateTotalXP(history, completedQuests);

  // Check for newly unlocked badges whenever history/streak/quests change
  useEffect(() => {
    if (!history) return;
    const currentUnlocked = getUnlockedBadges(history, streak, completedQuests);
    const newlyUnlocked = currentUnlocked.filter(id => !unlockedBadges.includes(id));
    if (newlyUnlocked.length > 0) {
      setUnlockedBadges(currentUnlocked);
      import('./utils/gamification').then(({ ALL_BADGES }) => {
        const fullBadges = newlyUnlocked.map(id => ALL_BADGES.find(b => b.id === id)).filter(Boolean);
        setNewBadgeQueue(prev => [...prev, ...fullBadges]);
      });
    }
  }, [history, streak, completedQuests, unlockedBadges, setUnlockedBadges]);


  // Fetch exercises on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch(EXERCISES_URL);
        if (!response.ok) throw new Error('Failed to fetch exercises');
        const data = await response.json();
        setExercises(data || []);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setExercises([]);
      }
    };
    fetchExercises();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      if (prevIsMobile.current === null) {
        setIsMobile(mobile);
        setIsSidebarOpen(false);
      } else if (prevIsMobile.current !== mobile) {
        setIsMobile(mobile);
        setIsSidebarOpen(false);
      }
      prevIsMobile.current = mobile;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  const handleWizardComplete = useCallback((preferences) => {
    setPrefs(preferences);
    setSavedPlan(null);
    setHistory([]);
    setWorkoutElapsed(0);
    const daysPerWeek = parseInt(preferences.frequency) || 3;
    const sessionLength = parseInt(preferences.duration) || 30;
    
    setHabitContract({
      daysPerWeek,
      sessionLength,
      resetDay: 'sunday',
      confirmedAt: new Date().toISOString(),
    });
    setMomentum({
      totalSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
      consistentWeeks: 0,
      weeklyCompletionLog: [],
      goalMetrics: {},
    });
    
    setCurrentWeek({
      weekNumber: 1,
      startDate: new Date().toISOString().slice(0, 10),
      commitment: daysPerWeek,
      sessions: [],
      completed: 0,
      generatedFrom: 'onboarding',
    });
    
    setShowCommitmentAfterPlan(true);
    setView('results');
    setIsSidebarOpen(false);
  }, [setPrefs, setSavedPlan, setHistory, setWorkoutElapsed, setHabitContract, setMomentum, setCurrentWeek, setView]);

  const handleReset = useCallback(() => {
    setPrefs(null);
    setSavedPlan(null);
    setHistory([]);
    setWorkoutElapsed(0);
    setHabitContract(null);
    setCurrentWeek(null);
    setMomentum(null);
    setView('wizard');
  }, [setPrefs, setSavedPlan, setHistory, setWorkoutElapsed, setHabitContract, setCurrentWeek, setMomentum, setView]);

  const handleStartWeek = useCallback(() => {
    setShowCommitmentAfterPlan(false);
    setView('results');
    setIsSidebarOpen(false);
  }, [setView]);

  const handleViewCommitment = useCallback(() => {
    setView('commitment');
    setIsSidebarOpen(false);
  }, [setView]);

  const handleStart = useCallback(() => setView('wizard'), [setView]);

  const handleStartSession = useCallback((day) => {
    setSessionDay(day);
    setView('session');
  }, [setSessionDay, setView]);

  const handleUpdateSessionProgress = useCallback((stepIdx, phase) => {
    setSavedPlan(prev => {
      if (!prev) return prev;
      return prev.map(d => d.key === sessionDay.key ? { ...d, progress: { stepIdx, phase } } : d);
    });
  }, [sessionDay, setSavedPlan]);

  const handleSessionComplete = useCallback((elapsed) => {
    setWorkoutElapsed(elapsed);
    setSavedPlan(prev => {
      if (!prev) return prev;
      return prev.map(d => d.key === sessionDay.key ? { ...d, completed: true } : d);
    });
    // Record in history
    if (sessionDay) {
      const muscles = [...new Set(
        (sessionDay.exercises ?? []).flatMap(ex => ex.primaryMuscles ?? [])
          .map(m => m.charAt(0).toUpperCase() + m.slice(1))
      )].slice(0, 6);
      const totalSets = (sessionDay.exercises ?? []).reduce((s, ex) => s + (ex.sets ?? 1), 0);
      setHistory(prev => [
        ...(prev ?? []),
        {
          date: new Date().toISOString().slice(0, 10),
          dayLabel: sessionDay.label ?? '',
          elapsed,
          totalSets,
          exercises: sessionDay.exercises?.length ?? 0,
          muscles,
        },
      ]);
    }
    setView('complete');
  }, [sessionDay, setWorkoutElapsed, setSavedPlan, setHistory, setView]);

  const handleBackToPlan = useCallback(() => {
    setSessionDay(null);
    setView('results');
  }, [setSessionDay, setView]);

  // Shared sidebar props for all dashboard pages
  const sidebarProps = {
    sidebarOpen: isSidebarOpen,
    onToggleSidebar: () => setIsSidebarOpen(v => !v),
    isMobile,
    onOpenSidebar: () => setIsSidebarOpen(true),
    onCloseSidebar: () => setIsSidebarOpen(false),
    xp: totalXP,
  };

  // Function to handle manual quest completion
  const handleCompleteQuest = useCallback((questId) => {
    setCompletedQuests(prev => [
      ...(prev || []),
      { date: new Date().toISOString().slice(0, 10), questId }
    ]);
  }, [setCompletedQuests]);


  return (
    <>
      <main className="app-main" id="main-content">
        {view === 'hero' ? (
          <HeroPage onStart={handleStart} onComplete={handleWizardComplete} />
        ) : view === 'wizard' ? (
          <IntakeChat onComplete={handleWizardComplete} />
        ) : view === 'commitment' && prefs && habitContract ? (
          <CommitmentPage
            prefs={prefs}
            habitContract={habitContract}
            currentWeek={currentWeek}
            exercises={exercises}
            onStartWeek={handleStartWeek}
            onReset={handleReset}
            onViewChange={setView}
            streak={streak}
            {...sidebarProps}
          />
        ) : view === 'results' && prefs ? (
          <PlanPage
            exercises={exercises}
            prefs={prefs}
            savedPlan={savedPlan}
            setSavedPlan={setSavedPlan}
            onReset={handleReset}
            onStartSession={handleStartSession}
            onViewChange={setView}
            onViewCommitment={handleViewCommitment}
            streak={streak}
            history={history}
            completedQuests={completedQuests}
            onCompleteQuest={handleCompleteQuest}
            showCommitmentAfterPlan={showCommitmentAfterPlan}
            setShowCommitmentAfterPlan={setShowCommitmentAfterPlan}
            {...sidebarProps}
          />
        ) : view === 'library' ? (
          <LibraryPage
            exercises={exercises}
            onViewChange={setView}
            savedPlan={savedPlan}
            setSavedPlan={setSavedPlan}
            {...sidebarProps}
          />
        ) : view === 'progress' ? (
          <ProgressPage
            savedPlan={savedPlan}
            history={history}
            xp={totalXP}
            completedQuests={completedQuests}
            onViewChange={setView}
            {...sidebarProps}
          />
        ) : view === 'goal' ? (
          <GoalPage
            prefs={prefs}
            savedPlan={savedPlan}
            habitContract={habitContract}
            momentum={momentum}
            history={history}
            streak={streak}
            onReset={handleReset}
            onViewChange={setView}
            unlockedBadgeIds={unlockedBadges}
            xp={totalXP}
            {...sidebarProps}
          />
        ) : view === 'history' ? (
          <HistoryPage
            history={history}
            onViewChange={setView}
            {...sidebarProps}
          />
        ) : view === 'session' && sessionDay ? (
          <WorkoutSession
            day={sessionDay}
            onBack={handleBackToPlan}
            onComplete={handleSessionComplete}
            onUpdateProgress={handleUpdateSessionProgress}
          />
        ) : view === 'complete' ? (
          <WorkoutComplete
            elapsed={workoutElapsed}
            dayLabel={sessionDay?.label || ''}
            onBackToPlan={handleBackToPlan}
            onHome={() => setView('hero')}
          />
        ) : null}
      </main>

      {/* Render the next badge in queue if any */}
      {newBadgeQueue.length > 0 && (
        <BadgeToast
          badge={newBadgeQueue[0]}
          onClose={() => setNewBadgeQueue(prev => prev.slice(1))}
        />
      )}
    </>
  );
}

export default App;
