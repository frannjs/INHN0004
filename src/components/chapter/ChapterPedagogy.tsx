import React, { useState } from 'react';

export const QuickCheck: React.FC<{
  title: React.ReactNode;
  prompt: React.ReactNode;
  answer: React.ReactNode;
}> = ({ title, prompt, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="quick-check-box">
      <div className="quick-check-header">
        <span className="quick-check-badge">Quick Check</span>
        <button type="button" className="ctrl-btn" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide Answer' : 'Check Answer'}
        </button>
      </div>
      <div className="quick-check-title">{title}</div>
      <div style={{ fontSize: 17.5 }}>{prompt}</div>
      {open && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid rgba(244, 211, 94, 0.16)',
            fontSize: 16.5,
            color: 'var(--ink-body)',
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
};

export const RecognitionCue: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="recognition-cue">
    <div className="recognition-cue-label">What to Recognize Next Time</div>
    <div style={{ fontSize: 17 }}>{children}</div>
  </div>
);

export interface GradedProblemProps {
  badge: string;
  question: React.ReactNode;
  options: { label: React.ReactNode; isCorrect: boolean; feedback: React.ReactNode }[];
  hint: React.ReactNode;
  fullSolution: React.ReactNode;
}

export const GradedExercise: React.FC<GradedProblemProps> = ({
  badge,
  question,
  options,
  hint,
  fullSolution,
}) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSol, setShowSol] = useState(false);

  return (
    <div className="exercise-card">
      <div className="math-block-header">
        <span className="math-block-label">{badge}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="ctrl-btn" onClick={() => setShowHint((v) => !v)}>
            {showHint ? 'Hide Hint' : 'Hint'}
          </button>
          <button type="button" className="ctrl-btn" onClick={() => setShowSol((v) => !v)}>
            {showSol ? 'Hide Solution' : 'Solution'}
          </button>
        </div>
      </div>

      <div>{question}</div>

      <div style={{ marginTop: 10 }}>
        {options.map((opt, idx) => {
          let cls = 'option-row';
          if (picked === idx) cls += opt.isCorrect ? ' correct' : ' wrong';
          return (
            <button
              key={idx}
              type="button"
              className={cls}
              onClick={() => setPicked(idx)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div
          style={{
            marginTop: 12,
            fontSize: 16,
            color: options[picked].isCorrect ? 'var(--m-green)' : 'var(--m-red)',
          }}
        >
          {options[picked].feedback}
        </div>
      )}

      {showHint && (
        <div
          style={{
            marginTop: 12,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(244, 211, 94, 0.06)',
            fontSize: 16,
          }}
        >
          <strong>Hint:</strong> {hint}
        </div>
      )}

      {showSol && (
        <div className="proof-box" style={{ marginTop: 14, marginBottom: 0 }}>
          <div className="proof-header">Complete Solution</div>
          {fullSolution}
        </div>
      )}
    </div>
  );
};
