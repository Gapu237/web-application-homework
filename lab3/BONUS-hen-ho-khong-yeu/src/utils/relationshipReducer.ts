import {
  INITIAL_RELATIONSHIP_STATE,
  type RelationshipAction,
  type RelationshipState,
} from "../types/relationship";

export function relationshipReducer(
  state: RelationshipState,
  action: RelationshipAction,
): RelationshipState {
  switch (action.type) {
    case "START_DATING":
      if (state.phase !== "FRIENDS") return state;

      return {
        ...state,
        phase: "DATING_NO_LOVE",
      };

    case "COMMIT":
      if (state.phase !== "DATING_NO_LOVE") return state;

      return {
        ...state,
        phase: "OFFICIAL_LOVE",
      };

    case "GHOST":
    case "SELF_RESPECT_EXIT":
      if (state.phase === "GHOSTED_EXIT") return state;

      return {
        ...state,
        phase: "GHOSTED_EXIT",
      };

    case "ADD_EFFORT":
      if (state.phase === "GHOSTED_EXIT") return state;

      return {
        ...state,
        effortLogs: [...state.effortLogs, action.signal],
      };

    case "RESET":
      return INITIAL_RELATIONSHIP_STATE;

    default:
      return state;
  }
}