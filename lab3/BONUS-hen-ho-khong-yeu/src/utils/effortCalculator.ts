import type {
  EffortActor,
  EffortSignal,
} from "../types/relationship";

export interface EffortSummary {
  readonly emTotal: number;
  readonly aiDoTotal: number;
  readonly difference: number;
  readonly totalSignals: number;
}

export function calculateEffort(
  logs: readonly EffortSignal[],
): EffortSummary {
  const totals = logs.reduce(
    (result, signal) => {
      const weightedEffort = signal.steps * signal.multiplier;

      if (signal.actor === "EM") {
        result.emTotal += weightedEffort;
      } else {
        result.aiDoTotal += weightedEffort;
      }

      return result;
    },
    { emTotal: 0, aiDoTotal: 0 },
  );

  return {
    ...totals,
    difference: Math.abs(totals.emTotal - totals.aiDoTotal),
    totalSignals: logs.length,
  };
}

export function createEffortSignal(
  actor: EffortActor,
  steps: number,
  multiplier: number,
): EffortSignal {
  return {
    id: crypto.randomUUID(),
    actor,
    steps,
    multiplier,
  };
}