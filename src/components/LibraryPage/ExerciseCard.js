import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { getExerciseImageUrl, capitalize, formatCategoryLabel, CATEGORY_COLORS, LEVEL_COLORS } from '../../utils/helpers';

function PrescriptionRow({ sets, reps, durationSeconds, restSeconds }) {
  const setsNum = sets || 1;
  const effort = durationSeconds
    ? `${setsNum} × ${durationSeconds}s`
    : `${setsNum} × ${reps || 0} reps`;

  const rest = restSeconds ? `Rest ${restSeconds}s` : null;

  return (
    <div className="exercise-prescription">
      <span className="prescription-effort">{effort}</span>
      {rest && <span className="prescription-rest">{rest}</span>}
    </div>
  );
}

export default function ExerciseCard({ exercise, sets, reps, durationSeconds, restSeconds, note }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = exercise.images && exercise.images[0]
    ? getExerciseImageUrl(exercise.images[0])
    : null;

  const categoryClass = CATEGORY_COLORS[exercise.category] || 'badge-gray';
  const levelClass    = LEVEL_COLORS[exercise.level] || 'badge-gray';

  return (
    <article className="exercise-card animate-fade-up">
      {}
      <div className="exercise-card-image-wrap">
        {imageUrl && !imgError ? (
          <img
            className="exercise-card-image"
            src={imageUrl}
            alt={exercise.name + ' exercise demonstration'}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="exercise-card-image-fallback" role="img" aria-label={exercise.name}>
            No Image
          </div>
        )}
      </div>

      {}
      <div className="exercise-card-body">
        <h3 className="exercise-card-title">{exercise.name}</h3>

        {}
        <PrescriptionRow
          sets={sets}
          reps={reps}
          durationSeconds={durationSeconds}
          restSeconds={restSeconds}
        />

        {}
        <div className="exercise-card-tags" aria-label="Exercise attributes">
          <span className={`badge ${categoryClass}`}>
            {formatCategoryLabel(exercise.category)}
          </span>
          <span className={`badge ${levelClass}`}>
            {capitalize(exercise.level)}
          </span>
          {exercise.equipment && (
            <span className="badge badge-gray">
              {capitalize(exercise.equipment)}
            </span>
          )}
          {exercise.mechanic && (
            <span className="badge badge-gray" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              {capitalize(exercise.mechanic)}
            </span>
          )}
        </div>

        {}
        {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
          <p className="exercise-card-muscles">
            <strong>Primary: </strong>
            {exercise.primaryMuscles.map(capitalize).join(', ')}
            {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
              <>
                <span style={{ opacity: 0.3 }}> | </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {exercise.secondaryMuscles.map(capitalize).join(', ')}
                </span>
              </>
            )}
          </p>
        )}

        {}
        {note && (
          <p className="exercise-note">{note}</p>
        )}

        {}
        {exercise.instructions && exercise.instructions.length > 0 && (
          <>
            <button
              className="exercise-card-expand-btn"
              onClick={() => setExpanded(true)}
            >
              <span>How to do it</span>
            </button>

            {expanded && createPortal(
              <div className="modal-overlay" onClick={() => setExpanded(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{exercise.name} Instructions</h3>
                    <button className="modal-close-btn" onClick={() => setExpanded(false)} aria-label="Close">
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <ol className="modal-instructions">
                      {exercise.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </>
        )}
      </div>
    </article>
  );
}
