// PUBG Vietnam Arena data types

export type DropPhase =
  | "WARMUP"
  | "AIRDROP_LIVE"
  | "LOOTED_OUT"
  | "EXPIRED";

export interface PubgCrateDrop {
  readonly id: string;
  readonly title: string;
  readonly priceVnd: number;
  readonly remainingStock: number;
  readonly dropEpochMs: number;
  readonly phase?: DropPhase;
}

export interface PubgVnSquadStanding {
  readonly squadId: string;
  readonly squadName: string;
  readonly wwcdCount: number;
  readonly placementPts: number;
  readonly killPts: number;
}

export type SquadSortKey =
  | "wwcdCount"
  | "placementPts"
  | "killPts";

export type SortDirection = "asc" | "desc";

export interface KillFeedEvent {
  readonly id: string;
  readonly killer: string;
  readonly victim: string;
  readonly squadId: string;
  readonly weapon: string;
  readonly timestamp: string;
}