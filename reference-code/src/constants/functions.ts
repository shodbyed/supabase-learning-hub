import { SeasonName } from "bca-firebase-queries";

export const createNewTeamData = (teamName: string, seasonId: SeasonName) => ({
  teamName,
  seasonId,
  players: {
    captain: {},
    player2: {},
    player3: {},
    player4: {},
    player5: {},
  },
  wins: 0,
  losses: 0,
  points: 0,
});
