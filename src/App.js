import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import './App.css';

import { EXERCISES_URL } from './utils/helpers';
import HeroPage from './components/HeroPage';
import Wizard from './components/Wizard/Wizard';
import PlanPage from './components/PlanPage';
import LibraryPage from './components/LibraryPage';
import ProgressPage from './components/ProgressPage';
import GoalPage from './components/GoalPage';
import HistoryPage from './components/HistoryPage';

import WorkoutSession from './components/WorkoutSession';
import WorkoutComplete from './components/WorkoutComplete';

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
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [prefs, setPrefs] = useLocalStorage('fs_prefs', null);
  const [sessionDay, setSessionDay] = useLocalStorage('fs_sessionDay', null);
  const [workoutElapsed, setWorkoutElapsed] = useLocalStorage('fs_elapsed', 0);
  const [savedPlan, setSavedPlan] = useLocalStorage('fs_plan', null);
  const [history, setHistory] = useLocalStorage('fs_history', []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prevIsMobile = useRef(null);

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

  
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch(EXERCISES_URL);
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setExercises(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load exercise database');
          setFetchError('Unable to load exercises. Please check your connection and try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleWizardComplete = useCallback((preferences) => {
    setPrefs(preferences);
    setSavedPlan(null);
    setHistory([]);
    setWorkoutElapsed(0);
    setView('results');
    setIsSidebarOpen(false);
  }, [setPrefs, setSavedPlan, setHistory, setWorkoutElapsed, setView]);

  const handleReset = useCallback(() => {
    setPrefs(null);
    setSavedPlan(null);
    setHistory([]);
    setWorkoutElapsed(0);
    setView('wizard');
  }, [setPrefs, setSavedPlan, setHistory, setWorkoutElapsed, setView]);

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
  };

  const isDashboardView = ['results', 'library', 'progress', 'goal', 'history'].includes(view);

  return (
    <>
      {}
      {!isDashboardView && view !== 'session' && (
        <nav className="site-nav" aria-label="Site navigation">
          <button 
            className="site-logo" 
            id="site-logo-link"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}
            onClick={() => setView('hero')}
          >
            <span className="site-logo-icon">T</span>
            Trainr
          </button>
          {view !== 'hero' && view !== 'complete' && (
            <button
              id="nav-home-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => setView('hero')}
            >
              ← Home
            </button>
          )}
        </nav>
      )}

      {}
      <main className="app-main" id="main-content">
        {loading ? (
          <div className="loading-page animate-fade-in">
            <div className="loading-spinner" aria-label="Loading exercises" />
            <p className="loading-text">Loading exercise database…</p>
          </div>
        ) : fetchError ? (
          <div className="error-page animate-fade-in">
            <div className="error-icon">!</div>
            <h2>Something went wrong</h2>
            <p>{fetchError}</p>
            <button id="retry-btn" className="btn btn-primary" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : view === 'hero' ? (
          <HeroPage onStart={handleStart} />
        ) : view === 'wizard' ? (
          <Wizard onComplete={handleWizardComplete} />
        ) : view === 'results' && prefs ? (
          <PlanPage
            exercises={exercises}
            prefs={prefs}
            savedPlan={savedPlan}
            setSavedPlan={setSavedPlan}
            onReset={handleReset}
            onStartSession={handleStartSession}
            onViewChange={setView}
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
            onViewChange={setView}
            {...sidebarProps}
          />
        ) : view === 'goal' ? (
          <GoalPage
            prefs={prefs}
            savedPlan={savedPlan}
            onReset={handleReset}
            onViewChange={setView}
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
    </>
  );
}

export default App;
