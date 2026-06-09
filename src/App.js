import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import './App.css';

import { EXERCISES_URL } from './utils/helpers';
import HeroPage from './components/HeroPage';
import Wizard from './components/Wizard/Wizard';
import PlanPage from './components/PlanPage';
import LibraryPage from './components/LibraryPage';

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const prevIsMobile = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      if (prevIsMobile.current === null) {
        setIsMobile(mobile);
        setIsSidebarOpen(!mobile);
      } else if (prevIsMobile.current !== mobile) {
        setIsMobile(mobile);
        setIsSidebarOpen(!mobile);
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
    setView('results');
  }, [setPrefs, setView]);

  const handleReset = useCallback(() => {
    setPrefs(null);
    setSavedPlan(null);
    setView('wizard');
  }, [setPrefs, setSavedPlan, setView]);

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
    setView('complete');
  }, [sessionDay, setWorkoutElapsed, setSavedPlan, setView]);

  const handleBackToPlan = useCallback(() => {
    setSessionDay(null);
    setView('results');
  }, [setSessionDay, setView]);

  return (
    <>
      {}
      {view !== 'session' && view !== 'results' && view !== 'library' && (
        <nav className="site-nav" aria-label="Site navigation">
          <a href="/" className="site-logo" id="site-logo-link">
            <span className="site-logo-icon">T</span>
            Trainr
          </a>
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
            sidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(v => !v)}
            isMobile={isMobile}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onCloseSidebar={() => setIsSidebarOpen(false)}
          />
        ) : view === 'library' ? (
          <LibraryPage
            exercises={exercises}
            onViewChange={setView}
            savedPlan={savedPlan}
            setSavedPlan={setSavedPlan}
            sidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(v => !v)}
            isMobile={isMobile}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onCloseSidebar={() => setIsSidebarOpen(false)}
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
