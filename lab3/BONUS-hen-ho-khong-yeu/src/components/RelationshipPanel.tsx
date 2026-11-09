import type {
  Dispatch,
} from "react";

import type {
  RelationshipAction,
  RelationshipPhase,
} from "../types/relationship";

interface RelationshipPanelProps {
  phase: RelationshipPhase;
  dispatch: Dispatch<RelationshipAction>;
}

const phaseLabels: Record<RelationshipPhase, string> = {
  FRIENDS: "Bạn bè",
  DATING_NO_LOVE: "Đang tìm hiểu",
  OFFICIAL_LOVE: "Chính thức",
  GHOSTED_EXIT: "Đã rời đi",
};

export function RelationshipPanel({
  phase,
  dispatch,
}: RelationshipPanelProps) {
  return (
    <section className="panel">
      <h2>Relationship State Machine</h2>

      <div className="phase-display">
        <span>Trạng thái hiện tại</span>
        <strong>{phaseLabels[phase]}</strong>
        <small>{phase}</small>
      </div>

      <div className="action-buttons">
        {phase === "FRIENDS" && (
          <button
            onClick={() => dispatch({ type: "START_DATING" })}
          >
            Bắt đầu tìm hiểu
          </button>
        )}

        {phase === "DATING_NO_LOVE" && (
          <button
            onClick={() => dispatch({ type: "COMMIT" })}
          >
            Chính thức
          </button>
        )}

        {phase !== "GHOSTED_EXIT" && (
          <>
            <button
              className="danger-button"
              onClick={() => dispatch({ type: "GHOST" })}
            >
              Ghost
            </button>

            <button
              className="secondary-button"
              onClick={() => dispatch({ type: "SELF_RESPECT_EXIT" })}
            >
              Chủ động rời đi
            </button>
          </>
        )}

        <button
          className="secondary-button"
          onClick={() => dispatch({ type: "RESET" })}
        >
          Reset
        </button>
      </div>
    </section>
  );
}