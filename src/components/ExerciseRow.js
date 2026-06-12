import React, { useState } from 'react';
import { formatCategoryLabel, CATEGORY_COLORS, getExerciseImageUrl } from '../utils/helpers';
import PickExerciseModal from './PickExerciseModal';
import { GripVertical, Check } from 'lucide-react';

export default function ExerciseRow({ exercise, index, isCompleted, filteredPool, onShuffle, onDelete, onPick, isReordering, onDragStart, onDragEnter, onDragEnd, caloriesBurned }) {
  const [showPicker, setShowPicker] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!exercise) return null;

  const categoryClass = CATEGORY_COLORS[exercise.category] || 'badge-gray';
  const effort = exercise.durationSeconds
    ? `${exercise.sets} set${exercise.sets > 1 ? 's' : ''} × ${exercise.durationSeconds}s`
    : exercise.sets ? `${exercise.sets} set${exercise.sets > 1 ? 's' : ''} × ${exercise.reps} reps` : null;

  const imageUrl = exercise.images && exercise.images[0]
    ? getExerciseImageUrl(exercise.images[0])
    : null;

  return (
    <>
      <div 
        className={`ex-row ${isReordering ? 'ex-row-reordering' : ''} ${isCompleted ? 'ex-row-completed' : ''}`}
        draggable={isReordering}
        onDragStart={(e) => onDragStart && onDragStart(e, index)}
        onDragEnter={(e) => onDragEnter && onDragEnter(e, index)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
      >
        {isReordering ? (
          <div className="ex-row-drag-handle">
            <GripVertical size={16} />
          </div>
        ) : (
          <span className="ex-row-num">{index + 1}</span>
        )}

        {imageUrl && !imgError && (
          <div className="ex-row-thumb">
            <img
              src={imageUrl}
              alt={exercise.name}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          </div>
        )}

        <div className="ex-row-info">
          <div className="ex-row-header-wrap">
            <span className={`ex-row-name ${isCompleted ? 'completed-text' : ''}`}>
              {exercise.name}
            </span>
            {isCompleted ? (
              <span className="ex-row-done-badge">
                Done
                <Check size={12} strokeWidth={3} />
              </span>
            ) : (
              <span className="badge badge-neutral ex-row-cat-badge">
                {formatCategoryLabel(exercise.category)}
              </span>
            )}
          </div>

          <div className="ex-row-meta">
            {effort && <span>{effort}</span>}
            {exercise.restSeconds > 0 && (
              <>
                <span className="meta-divider">|</span>
                <span>Rest {exercise.restSeconds}s</span>
              </>
            )}
            {caloriesBurned > 0 && (
              <>
                <span className="meta-divider">|</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  color: '#059669', fontSize: '0.75rem', fontWeight: '700',
                }}>
                  ~{caloriesBurned} kcal
                </span>
              </>
            )}
          </div>

          {exercise.note && (
            <p className="ex-row-note">
              {exercise.note}
            </p>
          )}
        </div>

        <div className="ex-row-actions">
          <button
            className="ex-action-btn"
            title="Shuffle - swap with a random similar exercise"
            onClick={onShuffle}
            aria-label="Shuffle exercise"
          >
            ⇄
          </button>
          <button
            className="ex-action-btn"
            title="Pick - choose a specific exercise"
            onClick={() => setShowPicker(true)}
            aria-label="Pick exercise"
          >
            ✎
          </button>
          <button
            className="ex-action-btn ex-action-btn--danger"
            title="Remove this exercise"
            onClick={onDelete}
            aria-label="Delete exercise"
          >
            ×
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
