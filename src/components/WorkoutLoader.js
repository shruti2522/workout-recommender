import React from 'react';
import './WorkoutLoader.css';

export default function WorkoutLoader() {
  return (
    <svg
      className="workout-loader"
      viewBox="0 0 120 60"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="0" y1="30" x2="120" y2="30" stroke="rgba(74,222,128,0.12)" strokeWidth="1" />
      <g className="ekg-track">
        <polyline
          className="ekg-line"
          points="0,30 12,30 16,10 20,50 24,22 28,30 60,30 72,30 76,10 80,50 84,22 88,30 120,30 132,30 136,10 140,50 144,22 148,30 180,30"
          fill="none"
          stroke="#4ade80"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}