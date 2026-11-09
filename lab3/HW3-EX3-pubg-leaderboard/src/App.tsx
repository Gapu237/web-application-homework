import { useMemo, useState } from "react";
import VirtualLeaderboard from "./components/VirtualLeaderboard";
import { killFeedEvents, squadStandings } from "./data/squads";
import type { KillFeedEvent } from "./types/pubg";
import "./App.css";

function App() {
  const [selectedSquad, setSelectedSquad] = useState("all");

  const totalWWCD = useMemo(
    () =>
      squadStandings.reduce(
        (total, squad) => total + squad.wwcdCount,
        0,
      ),
    [],
  );

  const totalKills = useMemo(
    () =>
      squadStandings.reduce(
        (total, squad) => total + squad.killPts,
        0,
      ),
    [],
  );

  const filteredKillFeed = useMemo(() => {
    if (selectedSquad === "all") {
      return killFeedEvents;
    }

    return killFeedEvents.filter(
      (event) => event.squadId === selectedSquad,
    );
  }, [selectedSquad]);

  const getSquadName = (squadId: string) => {
    return (
      squadStandings.find((squad) => squad.squadId === squadId)
        ?.squadName ?? "Unknown Squad"
    );
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">P</span>
          <span>
            PUBG <strong>VIETNAM</strong>
          </span>
        </a>

        <div className="topbar-status">
          <span className="status-dot" />
          SIMULATED MATCH DATA
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="hero-kicker">
            ESPORTS · VIETNAM
          </span>

          <h1>
            SQUAD
            <br />
            <span>LEADERBOARD</span>
          </h1>

          <p>
            Track squad performance, placement points and
            elimination statistics.
          </p>

          <div className="hero-meta">
            <span>SEASON 2026</span>
            <span className="meta-divider" />
            <span>VIETNAM CHAMPIONSHIP</span>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="hero-number">01</div>
          <div className="hero-decoration-label">
            CHAMPIONSHIP
            <br />
            RANKING SYSTEM
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="TOTAL SQUADS"
          value={squadStandings.length.toString()}
          description="Participating teams"
        />

        <StatCard
          label="TOTAL WWCD"
          value={totalWWCD.toString()}
          description="Winner Winner Chicken Dinner"
        />

        <StatCard
          label="TOTAL KILL POINTS"
          value={totalKills.toString()}
          description="Across all squads"
        />

        <StatCard
          label="MATCH STATUS"
          value="LIVE"
          description="Sample leaderboard data"
          live
        />
      </section>

      <VirtualLeaderboard squads={squadStandings} />

      <section className="kill-feed-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">MATCH ACTIVITY</span>
            <h2>Kill Feed</h2>
            <p>Recent elimination events</p>
          </div>

          <div className="feed-indicator">
            <span className="status-dot" />
            EVENT LOG
          </div>
        </div>

        <div className="kill-feed-toolbar">
          <label htmlFor="squad-filter">
            FILTER BY SQUAD
          </label>

          <select
            id="squad-filter"
            value={selectedSquad}
            onChange={(event) =>
              setSelectedSquad(event.target.value)
            }
          >
            <option value="all">All Squads</option>

            {squadStandings.slice(0, 4).map((squad) => (
              <option
                key={squad.squadId}
                value={squad.squadId}
              >
                {squad.squadName}
              </option>
            ))}
          </select>
        </div>

        <div className="kill-feed-list">
          {filteredKillFeed.length === 0 ? (
            <div className="empty-state">
              No elimination events found.
            </div>
          ) : (
            filteredKillFeed.map((event) => (
              <KillFeedRow
                key={event.id}
                event={event}
                squadName={getSquadName(event.squadId)}
              />
            ))
          )}
        </div>

        <div className="kill-feed-footer">
          Showing {filteredKillFeed.length} of{" "}
          {killFeedEvents.length} events
        </div>
      </section>

      <footer className="app-footer">
        <span>PUBG VIETNAM CHAMPIONSHIP</span>
        <span>EDUCATIONAL PROJECT · MOCK DATA</span>
      </footer>
    </main>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  description: string;
  live?: boolean;
}

function StatCard({
  label,
  value,
  description,
  live = false,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <span className="stat-card-label">{label}</span>

      <strong className={live ? "stat-live" : ""}>
        {value}
      </strong>

      <span className="stat-card-description">
        {description}
      </span>
    </article>
  );
}

interface KillFeedRowProps {
  event: KillFeedEvent;
  squadName: string;
}

function KillFeedRow({
  event,
  squadName,
}: KillFeedRowProps) {
  return (
    <article className="kill-feed-row">
      <span className="kill-time">{event.timestamp}</span>

      <div className="kill-details">
        <strong>{event.killer}</strong>
        <span className="kill-arrow"> ELIMINATED </span>
        <strong>{event.victim}</strong>
      </div>

      <span className="kill-weapon">{event.weapon}</span>

      <span className="kill-squad">{squadName}</span>
    </article>
  );
}

export default App;