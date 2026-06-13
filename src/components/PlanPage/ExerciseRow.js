import React, { useState } from 'react';
import { formatCategoryLabel, getExerciseImageUrl } from '../../utils/helpers';
import PickExerciseModal from './PickExerciseModal';
import { GripVertical, Check, Play } from 'lucide-react';

export default function ExerciseRow({ exercise, index, isCompleted, filteredPool, onShuffle, onDelete, onPick, isReordering, onDragStart, onDragEnter, onDragEnd, caloriesBurned, onStartFromHere }) {
  const [showPicker, setShowPicker] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!exercise) return null;

  const setsNum = exercise.sets || 1;
  const effort = exercise.durationSeconds
    ? `${setsNum} set${setsNum > 1 ? 's' : ''} × ${exercise.durationSeconds}s`
    : `${setsNum} set${setsNum > 1 ? 's' : ''} × ${exercise.reps || 0} reps`;

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
        ) : isCompleted ? (
          <span className="ex-row-num" style={{ color: 'var(--plan-green)', background: 'rgba(34, 197, 94, 0.1)' }}>
            <Check size={16} strokeWidth={3} />
          </span>
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
            {exercise.mechanic && (
              <>
                <span className="meta-divider">|</span>
                <span style={{ textTransform: 'capitalize' }}>{exercise.mechanic}</span>
              </>
            )}
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
                  color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700',
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
          {onStartFromHere && !isReordering && (
            <button
              className="ex-action-btn ex-play-btn"
              title="Start session from this exercise"
              onClick={() => onStartFromHere(index)}
              aria-label="Start from here"
            >
              <Play size={14} style={{ marginLeft: '2px', opacity: 0.7 }} fill="currentColor" />
            </button>
          )}
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
