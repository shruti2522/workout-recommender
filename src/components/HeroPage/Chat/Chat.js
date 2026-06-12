import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const TOTAL_STEPS = 6;

const STEPS = [
  {
    key: 'goal',
    question: "Hey! What's your main fitness goal right now?",
    chips: [
      { label: "Lose weight & tone up", value: "lose_weight" },
      { label: "Build muscle", value: "build_muscle" },
      { label: "Improve endurance", value: "improve_endurance" },
      { label: "Increase flexibility", value: "increase_flexibility" },
      { label: "General fitness", value: "general_fitness" }
    ],
    fallback: "general_fitness"
  },
  {
    key: 'targetAreas',
    question: "Awesome! Are there any specific areas you want to focus on?",
    chips: [
      { label: "Upper body", value: ["upper_body"] },
      { label: "Lower body", value: ["lower_body"] },
      { label: "Core", value: ["core"] },
      { label: "Full body (balanced)", value: ["full_body"] }
    ],
    fallback: ["full_body"]
  },
  {
    key: 'duration',
    question: "Got it. How long have you been consistently working out?",
    chips: [
      { label: "Just starting out", value: "under_6m" },
      { label: "A few months", value: "under_6m" },
      { label: "A year or two", value: "6m_2y" },
      { label: "Several years", value: "2y_plus" }
    ],
    fallback: "6m_2y"
  },
  {
    key: 'frequency',
    question: "How many days a week can you realistically commit to training?",
    chips: [
      { label: "2 days", value: "2" },
      { label: "3 days", value: "3" },
      { label: "4 days", value: "4" },
      { label: "5 days", value: "5" },
      { label: "6 days", value: "6" }
    ],
    fallback: "3"
  },
  {
    key: 'sessionDuration',
    question: "And how much time do you have for each session?",
    chips: [
      { label: "20–30 min", value: "20_30" },
      { label: "30–45 min", value: "30_45" },
      { label: "45–60 min", value: "45_60" },
      { label: "1+ hours", value: "60_90" }
    ],
    fallback: "45_60"
  },
  {
    key: 'equipment',
    question: "Last question! What equipment do you have access to?",
    chips: [
      { label: "No equipment (bodyweight)", value: ["No equipment (bodyweight)"] },
      { label: "Dumbbells", value: ["Dumbbells"] },
      { label: "Full gym", value: ["Gym machines", "Dumbbells", "Barbell", "Cables"] },
      { label: "Resistance bands", value: ["Resistance bands"] }
    ],
    fallback: ["No equipment (bodyweight)"]
  }
];

export default function Chat({ onComplete }) {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [prefs, setPrefs] = useState({
    goal: 'general_fitness',
    targetAreas: ['full_body'],
    duration: '6m_2y',
    frequency: '3',
    sessionDuration: '45_60',
    equipment: ['No equipment (bodyweight)'],
    injuries: [], // defaulting empty since we're keeping it concise
    weeklyTime: '2_4h'
  });

  const chatEndRef = useRef(null);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages([{
        sender: 'bot',
        text: STEPS[0].question,
        options: STEPS[0].chips.map(c => c.label),
      }]);
    }, 800);
  }, []);

  const appendBotMessage = (text, options = null) => {
    setMessages(prev => [...prev, { sender: 'bot', text, options }]);
  };

  const appendUserMessage = (text) => {
    setMessages(prev => {
      const msgs = [...prev];
      if (msgs.length > 0) msgs[msgs.length - 1].options = null;
      return [...msgs, { sender: 'user', text }];
    });
  };

  const handleSuggestionClick = (label) => {
    if (isTyping) return;
    processAnswer(label);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    processAnswer(inputText.trim());
    setInputText('');
  };

  const processAnswer = (answerText) => {
    appendUserMessage(answerText);
    
    // Find if it matches a chip, else use fallback mapping for robustness
    const currentStepConfig = STEPS[step];
    const matchedChip = currentStepConfig.chips.find(
      c => c.label.toLowerCase() === answerText.toLowerCase()
    );
    
    const extractedValue = matchedChip ? matchedChip.value : currentStepConfig.fallback;
    
    const updatedPrefs = { ...prefs, [currentStepConfig.key]: extractedValue };
    setPrefs(updatedPrefs);

    if (step < TOTAL_STEPS - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        if (nextStep === 3) {
          appendBotMessage("Awesome, we've got your foundation. Let's talk schedule.");
        }
        appendBotMessage(
          STEPS[nextStep].question,
          STEPS[nextStep].chips.map(c => c.label)
        );
      }, 600);
    } else {
      // Completed!
      setStep(TOTAL_STEPS);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendBotMessage("Perfect. Building your custom plan...");
        setTimeout(() => {
          onComplete(updatedPrefs);
        }, 1000);
      }, 600);
    }
  };

  // Removed ephemeral recap logic

  const knownFacts = Object.entries(prefs).filter(([k, v]) => {
    // Only show interesting known facts
    if (k === 'injuries' || k === 'weeklyTime') return false;
    const stepConfig = STEPS.find(s => s.key === k);
    if (!stepConfig) return false;
    
    // Check if it's the fallback or a default we haven't asked about yet
    const currentStepIndex = STEPS.findIndex(s => s.key === k);
    if (currentStepIndex >= step) return false;
    
    return true;
  }).map(([k, v]) => {
    const stepConfig = STEPS.find(s => s.key === k);
    const chip = stepConfig.chips.find(c => JSON.stringify(c.value) === JSON.stringify(v));
    return chip ? chip.label : String(v);
  });

  return (
    <div className="chat-container">
      <div className="chat-progress">
        <div className="chat-progress-dots">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`chat-progress-dot ${step > i ? 'done' : step === i ? 'active' : ''}`}
            />
          ))}
        </div>
        <span className="chat-progress-label" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
          {step < TOTAL_STEPS ? `${step + 1} of ${TOTAL_STEPS}` : 'Building plan…'}
        </span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <React.Fragment key={idx}>
            <div className={`chat-message-row ${msg.sender}`}>
              {msg.sender === 'bot' && <div className="chat-avatar">T</div>}
              <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
            </div>


            {msg.options && idx === messages.length - 1 && !isTyping && (
              <div className="chat-options">
                {msg.options.map((opt, i) => (
                  <button
                    key={i}
                    className="chat-chip"
                    onClick={() => handleSuggestionClick(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}

        {isTyping && (
          <div className="chat-message-row bot">
            <div className="chat-avatar">T</div>
            <div className="chat-bubble bot typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your answer..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping || messages.length === 0 || step >= TOTAL_STEPS}
          autoFocus
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!inputText.trim() || isTyping || step >= TOTAL_STEPS}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      {knownFacts.length > 0 && (
        <div className="chat-known-bar">
          <span className="chat-known-label">Known</span>
          {knownFacts.map((fact, i) => (
            <span key={i} className="chat-known-tag">{fact}</span>
          ))}
        </div>
      )}
    </div>
  );
}