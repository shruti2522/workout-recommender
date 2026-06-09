import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const messages = [
    'Analysing your profile…',
    'Selecting the best exercises…',
    'Ordering movements for maximum effect…',
    'Adding sets, reps, and rest times…',
    'Almost ready…',
  ];
  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setMsgIndex((i) => (i + 1) % messages.length), 1800);
    return () => clearInterval(interval);
  }, [messages.length]); 

  return (
    <div className="loading-screen animate-fade-in">
      <div className="loading-spinner" aria-label="Generating plan" />
      <p className="loading-title">Building your custom plan</p>
      <p className="loading-msg">{messages[msgIndex]}</p>
    </div>
  );
}
