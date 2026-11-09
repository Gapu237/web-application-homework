export type RelationshipPhase =
  | "FRIENDS"
  | "DATING_NO_LOVE"
  | "OFFICIAL_LOVE"
  | "GHOSTED_EXIT";

export type EffortActor = "EM" | "AI_DO";

export interface EffortSignal {
  readonly id: string;
  readonly actor: EffortActor;
  readonly steps: number;
  readonly multiplier: number;
}

export type RelationshipAction =
  | { type: "START_DATING" }
  | { type: "COMMIT" }
  | { type: "GHOST" }
  | { type: "SELF_RESPECT_EXIT" }
  | { type: "ADD_EFFORT"; signal: EffortSignal }
  | { type: "RESET" };

export interface RelationshipState {
  readonly phase: RelationshipPhase;
  readonly effortLogs: readonly EffortSignal[];
}

export const INITIAL_RELATIONSHIP_STATE: RelationshipState = {
  phase: "FRIENDS",
  effortLogs: [],
};