import type {
  KillFeedEvent,
  PubgVnSquadStanding,
} from "../types/pubg";

// Four squads explicitly mentioned in the assignment.
// Other squads are mock data for testing the virtual scroller.

const featuredSquads: PubgVnSquadStanding[] = [
  {
    squadId: "squad-001",
    squadName: "The Expendables",
    wwcdCount: 5,
    placementPts: 86,
    killPts: 112,
  },
  {
    squadId: "squad-002",
    squadName: "Cerberus Esports",
    wwcdCount: 4,
    placementPts: 92,
    killPts: 105,
  },
  {
    squadId: "squad-003",
    squadName: "Roy Esports",
    wwcdCount: 3,
    placementPts: 78,
    killPts: 119,
  },
  {
    squadId: "squad-004",
    squadName: "AGG",
    wwcdCount: 2,
    placementPts: 81,
    killPts: 97,
  },
];

const generatedSquads: PubgVnSquadStanding[] = Array.from(
  { length: 96 },
  (_, index) => {
    const number = index + 5;

    return {
      squadId: `squad-${String(number).padStart(3, "0")}`,
      squadName: `Vietnam Academy ${String(number).padStart(2, "0")}`,
      wwcdCount: (number * 7) % 9,
      placementPts: 35 + ((number * 13) % 75),
      killPts: 25 + ((number * 17) % 100),
    };
  },
);

export const squadStandings: PubgVnSquadStanding[] = [
  ...featuredSquads,
  ...generatedSquads,
];

export const killFeedEvents: KillFeedEvent[] = [
  {
    id: "kill-001",
    killer: "Levi",
    victim: "Shadow",
    squadId: "squad-001",
    weapon: "M416",
    timestamp: "21:42:18",
  },
  {
    id: "kill-002",
    killer: "Teddy",
    victim: "Hunter",
    squadId: "squad-002",
    weapon: "AWM",
    timestamp: "21:41:52",
  },
  {
    id: "kill-003",
    killer: "Roy",
    victim: "Ghost",
    squadId: "squad-003",
    weapon: "AKM",
    timestamp: "21:41:30",
  },
  {
    id: "kill-004",
    killer: "Ace",
    victim: "Raven",
    squadId: "squad-004",
    weapon: "Beryl M762",
    timestamp: "21:40:45",
  },
  {
    id: "kill-005",
    killer: "Nero",
    victim: "Blaze",
    squadId: "squad-001",
    weapon: "Mk14",
    timestamp: "21:39:12",
  },
  {
    id: "kill-006",
    killer: "Cris",
    victim: "Wolf",
    squadId: "squad-002",
    weapon: "M416",
    timestamp: "21:38:06",
  },
  {
    id: "kill-007",
    killer: "Kai",
    victim: "Viper",
    squadId: "squad-003",
    weapon: "Mini14",
    timestamp: "21:37:41",
  },
  {
    id: "kill-008",
    killer: "Max",
    victim: "Storm",
    squadId: "squad-004",
    weapon: "UMP45",
    timestamp: "21:36:20",
  },
  {
    id: "kill-009",
    killer: "Levi",
    victim: "Frost",
    squadId: "squad-001",
    weapon: "M416",
    timestamp: "21:35:11",
  },
  {
    id: "kill-010",
    killer: "Teddy",
    victim: "Venom",
    squadId: "squad-002",
    weapon: "AWM",
    timestamp: "21:34:02",
  },
];