import React, { useState } from 'react';
import { formatCategoryLabel, CATEGORY_COLORS } from '../utils/helpers';
import PickExerciseModal from './PickExerciseModal';

export default function ExerciseRow({ exercise, index, isCompleted, filteredPool, onShuffle, onDelete, onPick, isReordering, onDragStart, onDragEnter, onDragEnd }) {
  const [showPicker, setShowPicker] = useState(false);
  
  if (!exercise) return null;
  
  const categoryClass = CATEGORY_COLORS[exercise.category] || 'badge-gray';
  const effort = exercise.durationSeconds 
    ? `${exercise.sets} sets × ${exercise.durationSeconds}s`
    : exercise.sets ? `${exercise.sets} sets × ${exercise.reps} reps` : null;

  // Completion state comes from props now

  return (
    <>
      <div 
        className={`ex-row ${isReordering ? 'ex-row-reordering' : ''} ${isCompleted ? 'ex-row-completed' : ''}`}
        draggable={isReordering}
        onDragStart={(e) => onDragStart && onDragStart(e, index)}
        onDragEnter={(e) => onDragEnter && onDragEnter(e, index)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        style={{ 
          cursor: isReordering ? 'grab' : 'default',
          padding: '12px 16px',
          gap: '16px',
          border: '0.5px solid var(--border-subtle)',
          boxShadow: 'none',
          opacity: isCompleted ? 0.6 : 1
        }}
      >
        {isReordering ? (
          <div className="ex-row-drag-handle" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', width: '24px', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
        ) : (
          <span className="ex-row-num" style={{ fontSize: '0.9rem', minWidth: '20px' }}>{index + 1}</span>
        )}

        <div className="ex-row-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="ex-row-name" style={{ margin: 0, textDecoration: isCompleted ? 'line-through' : 'none' }}>
              {exercise.name}
            </span>
            {isCompleted ? (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Done
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            ) : (
              <span className={`badge ${categoryClass}`} style={{ fontSize: '0.75rem', padding: '3px 10px', background: '#fff', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', borderRadius: '4px', fontWeight: '500' }}>
                {formatCategoryLabel(exercise.category)}
              </span>
            )}
          </div>
          
          <div className="ex-row-meta" style={{ marginTop: '8px', marginBottom: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {effort && <span>{effort}</span>}
            {exercise.restSeconds && (
              <>
                <span style={{ padding: '0 2px', color: 'var(--border-subtle)' }}>|</span>
                <span>Rest {exercise.restSeconds}s</span>
              </>
            )}
          </div>
          
          {exercise.note && (
            <p className="ex-row-note" style={{ 
              marginTop: '2px', 
              fontSize: '0.85rem', 
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}>
              {exercise.note}
            </p>
          )}
        </div>

        <div className="ex-row-actions" style={{ flexDirection: 'row', gap: '6px' }}>
          <button
            className="ex-action-btn"
            title="Shuffle - swap with a random similar exercise"
            onClick={onShuffle}
            aria-label="Shuffle exercise"
            style={{ width: '28px', height: '28px', border: '0.5px solid var(--border-subtle)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
          </button>
          <button
            className="ex-action-btn"
            title="Pick - choose a specific exercise"
            onClick={() => setShowPicker(true)}
            aria-label="Pick exercise"
            style={{ width: '28px', height: '28px', border: '0.5px solid var(--border-subtle)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button
            className="ex-action-btn ex-action-btn--danger"
            title="Remove this exercise"
            onClick={onDelete}
            aria-label="Delete exercise"
            style={{ width: '28px', height: '28px', border: '0.5px solid var(--border-subtle)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {showPicker && (
        <PickExerciseModal
          allExercises={filteredPool}
          currentId={exercise.id}
          onPick={(ex) => { onPick(ex); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
