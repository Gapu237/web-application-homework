
import { useMemo, useId, useState } from "react";

import type {
  EffortActor,
  EffortSignal,
  RelationshipAction,
} from "../types/relationship";

import {
  calculateEffort,
  createEffortSignal,
} from "../utils/effortCalculator";

interface EffortPanelProps {
  logs: readonly EffortSignal[];
  dispatch: React.Dispatch<RelationshipAction>;
}

export function EffortPanel({
  logs,
  dispatch,
}: EffortPanelProps) {
  const actorId = useId();
  const stepsId = useId();
  const multiplierId = useId();

  const [actor, setActor] = useState<EffortActor>("EM");
  const [steps, setSteps] = useState("1");
  const [multiplier, setMultiplier] = useState("1");

  const summary = useMemo(
    () => calculateEffort(logs),
    [logs],
  );

  function handleAddEffort() {
    const parsedSteps = Number(steps);
    const parsedMultiplier = Number(multiplier);

    if (
      !Number.isFinite(parsedSteps) ||
      !Number.isFinite(parsedMultiplier) ||
      parsedSteps <= 0 ||
      parsedMultiplier <= 0
    ) {
      return;
    }

    dispatch({
      type: "ADD_EFFORT",
      signal: createEffortSignal(
        actor,
        parsedSteps,
        parsedMultiplier,
      ),
    });

    setSteps("1");
    setMultiplier("1");
  }

  return (
    <section className="panel">
      <h2>Asymmetric Effort Reducer</h2>

      <div className="effort-form">
        <div>
          <label htmlFor={actorId}>Người thực hiện</label>
          <select
            id={actorId}
            value={actor}
            onChange={(event) =>
              setActor(event.target.value as EffortActor)
            }
          >
            <option value="EM">EM</option>
            <option value="AI_DO">AI_DO</option>
          </select>
        </div>

        <div>
          <label htmlFor={stepsId}>Số bước</label>
          <input
            id={stepsId}
            type="number"
            min="1"
            value={steps}
            onChange={(event) => setSteps(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor={multiplierId}>Hệ số</label>
          <input
            id={multiplierId}
            type="number"
            min="0.1"
            step="0.1"
            value={multiplier}
            onChange={(event) =>
              setMultiplier(event.target.value)
            }
          />
        </div>

        <button onClick={handleAddEffort}>
          Thêm effort
        </button>
      </div>

      <div className="effort-results">
        <div className="effort-card">
          <span>EM</span>
          <strong>{summary.emTotal.toFixed(1)}</strong>
        </div>

        <div className="effort-card">
          <span>AI_DO</span>
          <strong>{summary.aiDoTotal.toFixed(1)}</strong>
        </div>

        <div className="effort-card">
          <span>Chênh lệch</span>
          <strong>{summary.difference.toFixed(1)}</strong>
        </div>
      </div>

      <p className="signal-count">
        Tổng số hành động: {summary.totalSignals}
      </p>
    </section>
  );
}
