// Grown-up check in front of Settings, deleting a profile and restoring a
// backup. A typed multiplication (6–9 × 6–9) is quick for a parent but stops a
// child tapping into difficulty or erase controls by accident. It is a speed
// bump, not security — see makeGateQuestion.
import { useEffect, useRef, useState } from 'react';
import { gateAnswerOk, makeGateQuestion } from '../app/forms.js';

export function ParentGate({ open, reason, onPass, onCancel }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [question, setQuestion] = useState(makeGateQuestion);
  const [typed, setTyped] = useState('');
  const [wrong, setWrong] = useState(false);

  // A fresh sum each time the gate opens, so it can't be learned by rote.
  useEffect(() => {
    if (!open) return;
    setQuestion(makeGateQuestion());
    setTyped('');
    setWrong(false);
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  function check(event) {
    event.preventDefault();
    if (gateAnswerOk(question, typed)) {
      onPass();
      return;
    }
    // A new sum after a wrong answer, so guessing through the range doesn't work.
    setWrong(true);
    setTyped('');
    setQuestion(makeGateQuestion());
    inputRef.current?.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="parent-gate-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <form className="confirm-body" onSubmit={check}>
        <h2 id="parent-gate-title">Grown-ups only</h2>
        <p className="small muted mt">
          {reason ?? 'Ask a grown-up to help with this bit.'}
        </p>
        <label className="small strong mt-lg gate-label" htmlFor="parent-gate-answer">
          {question.prompt}
        </label>
        <input
          ref={inputRef}
          id="parent-gate-answer"
          className="field mt"
          inputMode="numeric"
          autoComplete="off"
          value={typed}
          onChange={(event) => {
            setTyped(event.target.value);
            setWrong(false);
          }}
          aria-invalid={wrong}
        />
        {wrong && (
          <p className="small bad-note mt" role="status">
            Not quite — here’s another one.
          </p>
        )}
        <div className="btn-row mt-lg">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!typed.trim()}>
            Continue
          </button>
        </div>
      </form>
    </dialog>
  );
}
