
import { useState } from "react";
import {
  claimAirdrop,
  ClaimError,
} from "./airdropService";
import "./App.css";

function App() {
  const [inventory, setInventory] = useState(5);
  const [claimed, setClaimed] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState(
    "Ready to secure your supply drop?"
  );
  const [isError, setIsError] = useState(false);

  const handleClaim = async () => {
    if (isClaiming || inventory <= 0) return;

    // Save the previous state for rollback.
    const previousInventory = inventory;

    // Optimistic update: update UI immediately.
    setInventory((current) => current - 1);
    setClaimed((current) => current + 1);
    setIsClaiming(true);
    setMessage("Contacting supply drop server...");
    setIsError(false);

    try {
      const response = await claimAirdrop();

      setMessage(response.message);
    } catch (error) {
      // Rollback if the server rejects the claim.
      setInventory(previousInventory);
      setClaimed((current) => Math.max(0, current - 1));

      if (error instanceof ClaimError && error.status === 409) {
        setMessage("Conflict (409): Airdrop unavailable. Inventory restored.");
      } else {
        setMessage("Network error. Inventory restored.");
      }

      setIsError(true);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleReset = () => {
    if (isClaiming) return;

    setInventory(5);
    setClaimed(0);
    setMessage("Inventory has been reset.");
    setIsError(false);
  };

  return (
    <main className="arena">
      <section className="claim-card">
        <div className="event-label">
          PUBG VIETNAM CHAMPIONSHIP
        </div>

        <div className="crate-icon">📦</div>

        <h1>AIRDROP CLAIM</h1>

        <p className="subtitle">
          Secure your supply before it is gone.
        </p>

        <div className="inventory-panel">
          <div>
            <span className="inventory-label">
              AVAILABLE CRATES
            </span>
            <strong className="inventory-number">
              {inventory}
            </strong>
          </div>

          <div>
            <span className="inventory-label">
              CLAIMED
            </span>
            <strong className="inventory-number">
              {claimed}
            </strong>
          </div>
        </div>

        <div
          className={`message ${isError ? "error" : ""}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </div>

        <button
          className="claim-button"
          onClick={handleClaim}
          disabled={isClaiming || inventory <= 0}
        >
          {isClaiming
            ? "CLAIMING..."
            : inventory <= 0
              ? "OUT OF STOCK"
              : "CLAIM AIRDROP"}
        </button>

        <button
          className="reset-button"
          onClick={handleReset}
          disabled={isClaiming}
        >
          RESET INVENTORY
        </button>

        <div className="technical-info">
          OPTIMISTIC UPDATE · HTTP 409 ROLLBACK
        </div>
      </section>
    </main>
  );
}

export default App;
