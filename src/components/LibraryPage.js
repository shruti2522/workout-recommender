import React, { useState, useMemo } from 'react';
import DashboardLayout from './DashboardLayout';
import { formatCategoryLabel, CATEGORY_COLORS, getExerciseImageUrl } from '../utils/helpers';
import { TARGET_AREA_OPTIONS } from './Wizard/WizardSteps';
import { INJURY_MUSCLES } from '../filterExercises';


const TARGET_AREA_MUSCLES = {
  upper_body: ['chest', 'lats', 'middle back', 'lower back', 'shoulders', 'biceps', 'triceps', 'forearms', 'neck', 'traps'],
  lower_body: ['quadriceps', 'hamstrings', 'calves', 'glutes', 'abductors', 'adductors'],
  core: ['abdominals', 'obliques', 'lower back'],
  full_body: [] // Full body matches everything
};

export default function LibraryPage({ exercises, onViewChange, savedPlan, setSavedPlan }) {
  const [toastMsg, setToastMsg] = useState(null);

  const handleShowToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(exercises.map(e => e.category).filter(Boolean));
    return ['all', ...Array.from(cats).sort()];
  }, [exercises]);

  const levels = useMemo(() => {
    const lvls = new Set(exercises.map(e => e.level).filter(Boolean));
    return ['all', ...Array.from(lvls).sort()];
  }, [exercises]);

  const equipmentList = useMemo(() => {
    const eq = new Set(exercises.map(e => e.equipment).filter(Boolean));
    return ['all', ...Array.from(eq).sort()];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      if (categoryFilter !== 'all' && ex.category !== categoryFilter) return false;
      if (levelFilter !== 'all' && ex.level !== levelFilter) return false;
      if (equipmentFilter !== 'all' && ex.equipment !== equipmentFilter) return false;
      if (areaFilter !== 'all' && areaFilter !== 'full_body') {
        const targetMuscles = TARGET_AREA_MUSCLES[areaFilter] || [];
        const matchesMuscle = ex.primaryMuscles?.some(m => targetMuscles.includes(m.toLowerCase()));
        const matchesSecondary = ex.secondaryMuscles?.some(m => targetMuscles.includes(m.toLowerCase()));
        if (!matchesMuscle && !matchesSecondary) return false;
      }
      if (search) {
        if (!ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [exercises, categoryFilter, areaFilter, levelFilter, equipmentFilter, search]);

  return (
    <DashboardLayout activeTab="library" onViewChange={onViewChange}>
      <div className="plan-page animate-fade-in" style={{ maxWidth: 'none', margin: '0', padding: '32px 24px', background: 'var(--bg-base)', minHeight: '100%' }}>
        <div className="plan-day-header">
          <div className="plan-day-header-text">
            <h1 className="plan-day-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Exercise Library</h1>
            <p className="plan-day-focus">Browse and search through our entire database of exercises.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: showFilters ? '16px' : '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search exercises by name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: showFilters ? 'var(--bg-surface)' : 'transparent', borderColor: showFilters ? 'var(--accent-primary)' : 'var(--border-subtle)', color: showFilters ? 'var(--accent-primary)' : 'var(--text-primary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filters
            {(categoryFilter !== 'all' || areaFilter !== 'all' || levelFilter !== 'all' || equipmentFilter !== 'all') && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', marginLeft: '4px' }} />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="modal-overlay" onClick={() => setShowFilters(false)} style={{ zIndex: 9999 }}>
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '540px',
                background: 'var(--bg-surface)',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                overflowY: 'auto',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>Filters</h2>
                <button 
                  className="modal-close-btn" 
                  onClick={() => setShowFilters(false)} 
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', borderRadius: '50%' }}
                >✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1, paddingRight: '8px' }}>
                {/* Category Chips */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Category</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button 
                      onClick={() => setCategoryFilter('all')} 
                      className="btn"
                      style={{ padding: '6px 14px', borderRadius: '24px', border: `1px solid ${categoryFilter === 'all' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: categoryFilter === 'all' ? 'rgba(42, 157, 143, 0.1)' : 'transparent', color: categoryFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                    >All</button>
                    {categories.slice(1).map(c => (
                      <button 
                        key={c}
                        onClick={() => setCategoryFilter(c)} 
                        className="btn"
                        style={{ padding: '6px 14px', borderRadius: '24px', border: `1px solid ${categoryFilter === c ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: categoryFilter === c ? 'rgba(42, 157, 143, 0.1)' : 'transparent', color: categoryFilter === c ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                      >{formatCategoryLabel(c)}</button>
                    ))}
                  </div>
                </div>

                {/* Area Chips */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Target Area</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button 
                      onClick={() => setAreaFilter('all')} 
                      className="btn"
                      style={{ padding: '6px 14px', borderRadius: '24px', border: `1px solid ${areaFilter === 'all' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: areaFilter === 'all' ? 'rgba(42, 157, 143, 0.1)' : 'transparent', color: areaFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                    >All</button>
                    {TARGET_AREA_OPTIONS.map(o => (
                      <button 
                        key={o.key}
                        onClick={() => setAreaFilter(o.key)} 
                        className="btn"
                        style={{ padding: '6px 14px', borderRadius: '24px', border: `1px solid ${areaFilter === o.key ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: areaFilter === o.key ? 'rgba(42, 157, 143, 0.1)' : 'transparent', color: areaFilter === o.key ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>

                {/* Level Chips */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Level</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button 
                      onClick={() => setLevelFilter('all')} 
                      className="btn"
                      style={{ padding: '6px 14px', borderRadius: '24px', border: `1px solid ${levelFilter === 'all' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: levelFilter === 'all' ? 'rgba(42, 157, 143, 0.1)' : 'transparent', color: levelFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                    >All</button>
                    {levels.slice(1).map(l => (
                      <button 
                        key={l}
                        onClick={() => setLevelFilter(l)} 
                        className="btn"
                        style={{ padding: '6px 14px', borderRadius: '24px', border: `1px solid ${levelFilter === l ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: levelFilter === l ? 'rgba(42, 157, 143, 0.1)' : 'transparent', color: levelFilter === l ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                      >{capitalize(l)}</button>
                    ))}
                  </div>
                </div>

                {/* Equipment Chips */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Equipment</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button 
                      onClick={() => setEquipmentFilter('all')} 
                      className="btn"
                      style={{ padding: '6px 14px', borderRadius: '24px', border: `1px solid ${equipmentFilter === 'all' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: equipmentFilter === 'all' ? 'rgba(42, 157, 143, 0.1)' : 'transparent', color: equipmentFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                    >All</button>
                    {equipmentList.slice(1).map(eq => (
                      <button 
                        key={eq}
                        onClick={() => setEquipmentFilter(eq)} 
                        className="btn"
                        style={{ padding: '6px 14px', borderRadius: '24px', border: `1px solid ${equipmentFilter === eq ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, background: equipmentFilter === eq ? 'rgba(42, 157, 143, 0.1)' : 'transparent', color: equipmentFilter === eq ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                      >{capitalize(eq.replace(/_/g, ' '))}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowFilters(false)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Show Results ({filteredExercises.length})
                </button>
                {(categoryFilter !== 'all' || areaFilter !== 'all' || levelFilter !== 'all' || equipmentFilter !== 'all') && (
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => { setCategoryFilter('all'); setAreaFilter('all'); setLevelFilter('all'); setEquipmentFilter('all'); }}
                    style={{ width: '100%', justifyContent: 'center', color: 'var(--text-secondary)' }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredExercises.length}</strong> exercises
        </div>

        <div className="ex-list" style={{ marginTop: '0' }}>
          {filteredExercises.length === 0 ? (
            <div className="results-empty" style={{ padding: '60px 0' }}>
              <p>No exercises found matching your criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredExercises.map((ex, i) => (
                <ExerciseCard key={ex.id} exercise={ex} savedPlan={savedPlan} setSavedPlan={setSavedPlan} onAdded={handleShowToast} />
              ))}
            </div>
          )}
        </div>
      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-round)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e0f2f0', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{toastMsg}</span>
        </div>
      )}
    </DashboardLayout>
  );
}

function ExerciseCard({ exercise, savedPlan, setSavedPlan, onAdded }) {
  const [showInstructions, setShowInstructions] = useState(false);
  const categoryClass = CATEGORY_COLORS[exercise.category] || 'badge-gray';

  // Determine what injuries this might aggravate
  const avoidFor = useMemo(() => {
    const avoid = [];
    const allMuscles = [...(exercise.primaryMuscles || []), ...(exercise.secondaryMuscles || [])].map(m => m.toLowerCase());
    
    Object.entries(INJURY_MUSCLES).forEach(([injury, muscles]) => {
      if (muscles.some(m => allMuscles.includes(m.toLowerCase()))) {
        avoid.push(injury);
      }
    });
    return avoid;
  }, [exercise]);

  return (
    <>
      <div 
        className="exercise-card" 
        onClick={() => setShowInstructions(true)}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div className="exercise-card-image-wrap" style={{ aspectRatio: '4/3', backgroundColor: '#f4f5f7' }}>
          {exercise.images?.[0] ? (
            <img src={getExerciseImageUrl(exercise.images[0])} alt={exercise.name} className="exercise-card-image" loading="lazy" style={{ mixBlendMode: 'multiply' }} />
          ) : (
            <div className="exercise-card-image-fallback">No Image</div>
          )}
        </div>
        <div className="exercise-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <h3 className="exercise-card-title" style={{ margin: 0, fontSize: '1.1rem' }}>{exercise.name}</h3>
            <span className={`badge ${categoryClass}`} style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#e0f2f0', color: 'var(--accent-primary)', border: 'none', whiteSpace: 'nowrap' }}>
              {formatCategoryLabel(exercise.category)}
            </span>
          </div>
          
          <div className="ex-row-meta" style={{ marginBottom: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
            <span>{exercise.equipment && exercise.equipment !== 'other' ? capitalize(exercise.equipment.replace(/_/g, ' ')) : 'Body Only'}</span>
            {exercise.primaryMuscles?.length > 0 && (
              <>
                <span style={{ padding: '0 4px', color: 'var(--border-subtle)' }}>|</span>
                <span>{exercise.primaryMuscles.map(capitalize).join(', ')}</span>
              </>
            )}
          </div>
          

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
            {exercise.level && (
              <div>
                <span className="badge badge-gray" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Level: {capitalize(exercise.level)}</span>
              </div>
            )}
            <AddToPlanButton exercise={exercise} savedPlan={savedPlan} setSavedPlan={setSavedPlan} onAdded={onAdded} />
          </div>

        </div>
      </div>

      {showInstructions && (
        <div className="modal-overlay" onClick={() => setShowInstructions(false)} style={{ zIndex: 9999, padding: '20px' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', padding: 0 }}>
            <div style={{ padding: '40px', overflowY: 'auto', flex: 1 }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span className={`badge ${categoryClass}`} style={{ background: '#e0f2f0', color: 'var(--accent-primary)', border: 'none' }}>
                    {formatCategoryLabel(exercise.category)}
                  </span>
                  <span className="badge badge-gray">{capitalize(exercise.level)}</span>
                  <span className="badge badge-gray">{exercise.equipment && exercise.equipment !== 'other' ? capitalize(exercise.equipment.replace(/_/g, ' ')) : 'Body Only'}</span>
                </div>
                <h2 style={{ fontSize: '2.2rem', margin: '0', color: 'var(--text-primary)', fontWeight: 800 }}>{exercise.name}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowInstructions(false)} style={{ position: 'relative', top: '-10px', right: '-10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', borderRadius: '50%' }}>✕</button>
            </div>

            {/* Modal Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }}>
              
              {/* Left Column: Execution Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Execution Steps</h3>
                  {exercise.instructions && exercise.instructions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {exercise.instructions.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <div style={{ 
                            width: '28px', height: '28px', 
                            borderRadius: '50%', 
                            background: 'var(--accent-primary)', 
                            color: '#fff', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No detailed instructions available.</p>
                  )}
                </div>

                {/* Avoid For (Injuries) */}
                {avoidFor.length > 0 && (
                  <div style={{ background: '#fdf0ed', border: '1px solid #fad3cc', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#e74c3c', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#c0392b', fontSize: '1.05rem' }}>Injury Warning</h4>
                      <p style={{ margin: 0, color: '#d35400', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Avoid this exercise if you have injuries in your <strong style={{ color: '#c0392b', textDecoration: 'underline' }}>{avoidFor.join(', ')}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Images, Muscles, Avoid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Images */}
                {exercise.images && exercise.images.length > 0 ? (
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {exercise.images.slice(0, 2).map((img, idx) => (
                      <div key={idx} style={{
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '240px'
                      }}>
                        <img 
                          src={getExerciseImageUrl(img)} 
                          alt={`${exercise.name} step ${idx + 1}`} 
                          style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ borderRadius: 'var(--radius-lg)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)' }}>
                    No Image Available
                  </div>
                )}

                {/* Muscles Targeted */}
                <div>
                  <h3 style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Muscles Targeted</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {exercise.primaryMuscles?.map(m => (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{capitalize(m)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '100px', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                            <div style={{ width: '100%', height: '100%', background: 'var(--accent-primary)', borderRadius: '2px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '45px', textAlign: 'right' }}>Primary</span>
                        </div>
                      </div>
                    ))}
                    {exercise.secondaryMuscles?.map(m => (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{capitalize(m)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '100px', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px' }}>
                            <div style={{ width: '40%', height: '100%', background: '#a5d6d1', borderRadius: '2px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '45px', textAlign: 'right' }}>Secondary</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
            </div>
      )}
    </>
  );
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function AddToPlanButton({ exercise, savedPlan, setSavedPlan, onAdded }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAdd = (e, dayIdx) => {
    e.stopPropagation();
    if (!savedPlan) return;
    
    setSavedPlan(prev => {
      const next = prev.map(d => ({ ...d, exercises: [...d.exercises] }));
      next[dayIdx].exercises.push({
        ...exercise,
        sets: 3,
        reps: 10,
        durationSeconds: null,
        restSeconds: 60,
        note: ''
      });
      return next;
    });
    setShowDropdown(false);
    
    if (onAdded) {
      onAdded(`Added ${exercise.name} to ${savedPlan[dayIdx].label}`);
    }
  };

  if (!savedPlan) return null;

  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button 
        className="btn btn-sm btn-add-plan" 
        onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add to Plan
      </button>
      
      {showDropdown && (
        <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 10, minWidth: '180px', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
            Select Day
          </div>
          {savedPlan.map((day, idx) => (
            <button 
              key={idx} 
              onClick={(e) => handleAdd(e, idx)}
              style={{ display: 'block', width: '100%', padding: '10px 12px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: idx < savedPlan.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase' }}>Day {idx + 1}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{day.label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
