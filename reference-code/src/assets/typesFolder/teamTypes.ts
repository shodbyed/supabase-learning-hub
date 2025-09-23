import * as Shared from './sharedTypes';
// Represents a Team document from teams Collection
export type Team = {
  id: Shared.TeamId; // a string representing the Teams document id
  teamName: string;
  seasonId: Shared.SeasonName; // a string representing the Seasons document Id
  players: {
    captain: TeamPlayer;
    player2: TeamPlayer;
    player3: TeamPlayer;
    player4: TeamPlayer;
    player5: TeamPlayer;
  };
  wins: number; // The number of time a team has won a match. TeamVictories
  losses: number; // The number of times a Team has lost a match
  points: number; // The number of points (excess games) the team earned in a match
};

// Represents all of the players "roles" on a team in Teams collection
export type TeamPlayerRole =
  | 'captain'
  | 'player2'
  | 'player3'
  | 'player4'
  | 'player5';

export type TeamPlayer = {
  firstName: string;
  lastName: string;
  nickname: string;
  email?: Shared.Email;
  totalWins: number; // career wins for the player (adds up wins from previous 3 seasons)
  totalLosses: number; // career losses for the player (adds up losses from previous 3 seasons)
  pastPlayerId: Shared.Email; // players id from pastPlayers collection (also the players Email)
  currentUserId: Shared.PlayerId; // players id from currentPlayer collection
};
