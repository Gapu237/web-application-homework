
import { useState } from "react";
import { useAirdropTimer } from "./useAirdropTimer";
import "./App.css";

const AIRDROP_DURATION_MS = 15 * 60 * 1000;

function App() {
  const [targetEpochMs, setTargetEpochMs] = useState(
    () => Date.now() + AIRDROP_DURATION_MS
  );

  const {
    days,
    hours,
    minutes,
    seconds,
    isExpired,
  } = useAirdropTimer(targetEpochMs);

  const handleReset = () => {
    setTargetEpochMs(Date.now() + AIRDROP_DURATION_MS);
  };

  const formatTime = (value: number) => {
    return String(value).padStart(2, "0");
  };

  return (
    <main className="arena">
      <div className="background-glow" />

      <section className="timer-card">
        <div className="event-label">
          <span className="status-dot" />
          PUBG VIETNAM CHAMPIONSHIP
        </div>

        <div className="airdrop-icon">📦</div>

        <h1>AIRDROP ARENA</h1>

        <p className="subtitle">
          The next supply drop is approaching.
        </p>

        <div className="timer-status">
          {isExpired ? "AIRDROP ARRIVED" : "AIRDROP INCOMING"}
        </div>

        <div className="countdown">
          <div className="time-unit">
            <div className="time-value">
              {formatTime(days)}
            </div>
            <span>DAYS</span>
          </div>

          <div className="time-separator">:</div>

          <div className="time-unit">
            <div className="time-value">
              {formatTime(hours)}
            </div>
            <span>HOURS</span>
          </div>

          <div className="time-separator">:</div>

          <div className="time-unit">
            <div className="time-value">
              {formatTime(minutes)}
            </div>
            <span>MINUTES</span>
          </div>

          <div className="time-separator">:</div>

          <div className="time-unit">
            <div className="time-value">
              {formatTime(seconds)}
            </div>
            <span>SECONDS</span>
          </div>
        </div>

        <div className="timer-message">
          {isExpired
            ? "The supply drop has arrived!"
            : "Stay ready. Secure your airdrop."}
        </div>

        <button className="reset-button" onClick={handleReset}>
          RESET AIRDROP TIMER
        </button>

        <div className="technical-info">
          <span>TIME SOURCE</span>
          <strong>Date.now() + targetEpochMs</strong>
        </div>
      </section>

      <footer>
        KRAFTON × PUBG VIETNAM CHAMPIONSHIP
      </footer>
    </main>
  );
}

export default App;
