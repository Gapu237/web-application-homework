import { useMemo, useRef, useState } from "react";
import type {
  PubgVnSquadStanding,
  SquadSortKey,
  SortDirection,
} from "../types/pubg";

interface VirtualLeaderboardProps {
  squads: PubgVnSquadStanding[];
}

const ROW_HEIGHT = 64;
const VIEWPORT_HEIGHT = 420;
const OVERSCAN = 5;

function VirtualLeaderboard({ squads }: VirtualLeaderboardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SquadSortKey>("placementPts");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");
  const [scrollTop, setScrollTop] = useState(0);

  // Search and sort squads.
  const filteredSquads = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return squads
      .filter((squad) =>
        squad.squadName.toLowerCase().includes(keyword),
      )
      .sort((a, b) => {
        const difference = a[sortKey] - b[sortKey];

        return sortDirection === "desc"
          ? -difference
          : difference;
      });
  }, [squads, searchTerm, sortKey, sortDirection]);

  // Calculate the rows that should be rendered.
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN,
  );

  const visibleCount =
    Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;

  const endIndex = Math.min(
    filteredSquads.length,
    startIndex + visibleCount,
  );

  const visibleSquads = filteredSquads.slice(startIndex, endIndex);

  const topSpacerHeight = startIndex * ROW_HEIGHT;

  const bottomSpacerHeight =
    (filteredSquads.length - endIndex) * ROW_HEIGHT;

  const handleSortChange = (value: string) => {
    setSortKey(value as SquadSortKey);
    setScrollTop(0);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleDirectionToggle = () => {
    setSortDirection((current) =>
      current === "desc" ? "asc" : "desc",
    );

    setScrollTop(0);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setScrollTop(0);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop);
    }
  };

  return (
    <section className="leaderboard-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">COMPETITIVE RANKING</span>
          <h2>Squad Leaderboard</h2>
          <p>Vietnam Championship standings</p>
        </div>

        <div className="squad-count">
          <strong>{filteredSquads.length}</strong>
          <span> SQUADS</span>
        </div>
      </div>

      <div className="leaderboard-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Search squad name..."
          value={searchTerm}
          onChange={(event) => handleSearchChange(event.target.value)}
          aria-label="Search squad name"
        />

        <select
          className="sort-select"
          value={sortKey}
          onChange={(event) => handleSortChange(event.target.value)}
          aria-label="Sort leaderboard"
        >
          <option value="placementPts">Placement Points</option>
          <option value="killPts">Kill Points</option>
          <option value="wwcdCount">WWCD</option>
        </select>

        <button
          className="sort-direction-button"
          type="button"
          onClick={handleDirectionToggle}
        >
          {sortDirection === "desc" ? "↓ Highest" : "↑ Lowest"}
        </button>
      </div>

      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>RANK / SQUAD</span>
          <span>WWCD</span>
          <span>PLACEMENT</span>
          <span>KILLS</span>
          <span>TOTAL</span>
        </div>

        <div
          ref={scrollContainerRef}
          className="leaderboard-viewport"
          style={{ height: VIEWPORT_HEIGHT }}
          onScroll={handleScroll}
        >
          {filteredSquads.length === 0 ? (
            <div className="empty-state">
              No squads found. Try another search.
            </div>
          ) : (
            <>
              <div style={{ height: topSpacerHeight }} />

              {visibleSquads.map((squad, index) => {
                const rank = startIndex + index + 1;
                const totalPoints =
                  squad.placementPts + squad.killPts;

                return (
                  <div
                    className="leaderboard-row"
                    key={squad.squadId}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className="squad-identity">
                      <span className="rank-number">
                        {String(rank).padStart(2, "0")}
                      </span>

                      <strong>{squad.squadName}</strong>
                    </div>

                    <span className="stat-value wwcd-value">
                      {squad.wwcdCount}
                    </span>

                    <span className="stat-value">
                      {squad.placementPts}
                    </span>

                    <span className="stat-value">
                      {squad.killPts}
                    </span>

                    <strong className="total-points">
                      {totalPoints}
                    </strong>
                  </div>
                );
              })}

              <div style={{ height: bottomSpacerHeight }} />
            </>
          )}
        </div>
      </div>

      <div className="leaderboard-footer">
        <span>
          Showing {visibleSquads.length} rendered rows
        </span>

        <span>
          {filteredSquads.length} squads in current results
        </span>
      </div>
    </section>
  );
}

export default VirtualLeaderboard;