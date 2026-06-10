import React, { useState } from 'react';

const HERO_IMAGES = [
  'Barbell_Squat/0.jpg',
  'Dumbbell_Bench_Press/0.jpg',
  'Pullups/0.jpg',
  'Romanian_Deadlift/0.jpg',
  'Dumbbell_Shoulder_Press/0.jpg',
  'Pushups/0.jpg',
  'Barbell_Deadlift/0.jpg',
  'Dumbbell_Lunges/0.jpg',
  'Alternating_Kettlebell_Press/0.jpg',
  'Arnold_Dumbbell_Press/0.jpg',
  'Cable_Crossover/0.jpg',
  'Seated_Cable_Rows/0.jpg',
  'Leg_Press/0.jpg',
  'Standing_Calf_Raises/0.jpg',
  'Plank/0.jpg',
  'Wide-Grip_Lat_Pulldown/0.jpg',
  'Incline_Dumbbell_Press/0.jpg',
  'Barbell_Full_Squat/0.jpg',
  'Dips_-_Triceps_Version/0.jpg',
  'Crunches/0.jpg',
  'One-Arm_Kettlebell_Swings/0.jpg',
  'Lying_T-Bar_Row/0.jpg',
  'Alternate_Hammer_Curl/0.jpg',
];

const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

function buildUrl(path) {
  return BASE + encodeURIComponent(path).replace(/%2F/g, '/');
}

function pickImages() {
  const shuffled = [...HERO_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

export default function HeroPage({ onStart }) {
  const [images] = useState(() => pickImages());
  const [errored, setErrored] = useState({});

  const handleImgError = (i) => setErrored(prev => ({ ...prev, [i]: true }));

  return (
    <div className="hero2-root">
      <div className="hero2-copy">

        <h1 className="hero2-heading">
          Build a workout<br />
          <em>made for you.</em>
        </h1>

        <p className="hero2-body">
          Tell us your goals and experience, and we'll build the perfect scientifically backed weekly plan for you.
        </p>

        <div className="hero2-actions">
          <button
            id="get-started-btn"
            className="hero2-btn-primary"
            onClick={onStart}
          >
            Build my plan
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      <div className="hero2-photos">
        <div className="hero2-photos-grid">
          {images.map((src, i) => (
            <div key={src + i} className="hero2-photo-cell">
              {!errored[i] ? (
                <img
                  src={buildUrl(src)}
                  alt="exercise"
                  className="hero2-photo-img"
                  onError={() => handleImgError(i)}
                  loading="eager"
                />
              ) : (
                <div className="hero2-photo-fallback" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
