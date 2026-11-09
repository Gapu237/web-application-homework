
import { useId, useState } from "react";

import type {
  RelationshipAction,
  RelationshipPhase,
} from "../types/relationship";

import { useGhostingTimer } from "../hooks/useGhostingTimer";

interface MessagePanelProps {
  phase: RelationshipPhase;
  dispatch: React.Dispatch<RelationshipAction>;
  onRedFlag: (message: string) => void;
}

export function MessagePanel({
  phase,
  dispatch,
  onRedFlag,
}: MessagePanelProps) {
  const messageId = useId();
  const [message, setMessage] = useState("");

  const {
    isWaiting,
    remainingMs,
    sendMessage,
    receiveReply,
  } = useGhostingTimer({
    timeoutMs: 5000,
    onGhosted: () => {
      dispatch({ type: "GHOST" });
      onRedFlag("Không nhận được phản hồi sau 5 giây.");
    },
  });

  function handleSend() {
    if (!message.trim() || phase === "GHOSTED_EXIT") {
      return;
    }

    onRedFlag("");
    sendMessage();
    setMessage("");
  }

  function handleReply() {
    receiveReply();

    dispatch({
      type: "ADD_EFFORT",
      signal: {
        id: crypto.randomUUID(),
        actor: "AI_DO",
        steps: 1,
        multiplier: 50,
      },
    });

    onRedFlag("Đã nhận được phản hồi. Bộ đếm đã được hủy.");
  }

  return (
    <section className="panel">
      <h2>Ghosting Timer</h2>

      <div className="message-form">
        <label htmlFor={messageId}>Tin nhắn</label>

        <input
          id={messageId}
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={phase === "GHOSTED_EXIT"}
        />

        <button
          onClick={handleSend}
          disabled={
            !message.trim() ||
            isWaiting ||
            phase === "GHOSTED_EXIT"
          }
        >
          Gửi tin nhắn
        </button>
      </div>

      <div className="timer-status" aria-live="polite">
        {isWaiting ? (
          <>
            <p>Đang chờ phản hồi...</p>
            <strong>
              {(remainingMs / 1000).toFixed(1)} giây
            </strong>

            <button onClick={handleReply}>
              Mô phỏng AI_DO phản hồi
            </button>

            <button
              className="secondary-button"
              onClick={receiveReply}
            >
              Hủy chờ
            </button>
          </>
        ) : (
          <p>Chưa có tin nhắn đang chờ.</p>
        )}
      </div>
    </section>
  );
}
