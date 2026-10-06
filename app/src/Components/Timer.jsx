import React, { useState, useEffect, useRef } from 'react';

const PRESETS = [30, 60, 90, 120];

function formatTime(ms) {
// Convert milliseconds to a string in the format "M:SS"
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + ':' + String(seconds).padStart(2, '0');
}

// Plays when the rest is over.
// If a sound file was given, play it.
function playAlert(alertSound) {
    // play the costum alert sound
    new Audio(alertSound).play().catch((error) => {
      console.error('Could not play alert sound', error);
    });
}

export default function Timer({ initialSeconds = 60, alertSound, onComplete }) {
  const [durationSeconds, setDurationSeconds] = useState(initialSeconds);
  const [remainingMs, setRemainingMs] = useState(initialSeconds * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [customSeconds, setCustomSeconds] = useState('');

  // The exact time (from Date.now()) when the countdown should hit zero
  const endTimeRef = useRef(null);

  useEffect(() => {
    // if not running return early, no need to set up an interval
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      // check how much time is left in ms
      const msLeft = Math.max(0, endTimeRef.current - Date.now());
      setRemainingMs(msLeft);

      if (msLeft === 0) {
        // time is finished
        clearInterval(intervalId);
        setIsRunning(false);
        setIsComplete(true);
        playAlert(alertSound); // play sound
        // let the parent component know the rest is over (optional)
        if (onComplete) onComplete();
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [isRunning, alertSound, onComplete]);

  function handleStart() {
    // if remainingMs is over zero just restart from remaining 
    // else use the previous duration
    const msToRun = remainingMs > 0 ? remainingMs : durationSeconds * 1000;
    // set up when timer is supposed to finish
    endTimeRef.current = Date.now() + msToRun;
    setRemainingMs(msToRun);
    setIsComplete(false);
    setIsRunning(true);
  }

  function handlePause() {
    // pause - set running to false
    setIsRunning(false);
    setRemainingMs(Math.max(0, endTimeRef.current - Date.now()));
  }

  function handleReset() {
    // reset timer to old duration 
    setIsRunning(false);
    setIsComplete(false);
    setRemainingMs(durationSeconds * 1000);
  }

  function handleAddThirty() {
    // add 30s to ref
    if (isRunning) {
      endTimeRef.current += 30000;
    }

    // add 30s to state
    setRemainingMs((ms) => ms + 30000);
    setIsComplete(false);
  }

  function chooseDuration(seconds) {
    // set duration to choosen seconds
    setDurationSeconds(seconds);
    setRemainingMs(seconds * 1000);
    setIsComplete(false);
  }

  function handleCustomSubmit(event) {
    event.preventDefault();
    const seconds = parseInt(customSeconds, 10);
    if (seconds > 0) {
      // set duration to choosen seconds and clear input field
      chooseDuration(seconds);
      setCustomSeconds('');
    }
  }

  return (
    <section className="timer">
      <div role="timer" className={isComplete ? 'timer-display timer-done' : 'timer-display'}>
        {formatTime(remainingMs)}
      </div>

      <p role="status" className="timer-status">
        {isComplete ? 'Time is up!' : ''}
      </p>

      <div className="timer-controls">
        {isRunning ? (
          <button className="btn btn-primary" onClick={handlePause}>Pause</button>
        ) : (
          <button className="btn btn-primary" onClick={handleStart}>Start</button>
        )}
        <button className="btn" onClick={handleReset}>Reset</button>
        <button className="btn" onClick={handleAddThirty}>+30s</button>
      </div>

      <div className="timer-presets">
        {PRESETS.map((seconds) => (
          <button
            key={seconds}
            className={seconds === durationSeconds ? 'btn btn-preset selected' : 'btn btn-preset'}
            onClick={() => chooseDuration(seconds)}
            disabled={isRunning}
          >
            {seconds}s
          </button>
        ))}
      </div>

      <form className="timer-custom" onSubmit={handleCustomSubmit}>
        <label htmlFor="custom-seconds">Custom seconds</label>
        <input
          id="custom-seconds"
          type="number"
          min="1"
          value={customSeconds}
          onChange={(event) => setCustomSeconds(event.target.value)}
          disabled={isRunning}
        />
        <button className="btn" type="submit" disabled={isRunning}>Set</button>
      </form>
    </section>
  );
}
