import * as Shared from './sharedTypes';

// Represents a document in the matchWeek collection
export type MatchWeek = {
  // Table on which the teams will be playing e.g. 'Table 1'
  [tableNumber: string]: {
    home: TeamInfo; // Object includes teamName, lineup(object with the 3 players information) =>
    away: TeamInfo; //  id, teamName, lineup, teamHandicap, gamesWon, winsNeeded, tiePossible
    winner: Shared.TeamId | null; // Team id (from teams collection) of the winning team
    gamePlay: GamePlay; // Gameplay includes the game number and the results of the game (breaker, racker, winner)
    seasonId: Shared.SeasonName; // Season name/id from seasons collection
    completed: boolean; // indicates if all games for this table/match have been played
  };

  // will need one table for every 2 teams in the season
  // maximum 14 teams to a season (at least as of now)
};

// Embedded on Match
// Represents a Team in a match
// Holds information about the team

export type TeamInfo = {
  id: Shared.TeamId; // id from a Team in teams collection
  teamName: string; // The name of the team
  lineup: Lineup; // The three players playing that night and their information e.g "player1 " (names handicap wins losses etc)
  teamHandicap: number; // The added handicap for the team dependant on the TeamVictories.
  gamesWon: number; // The number of games the team has won in the match
  winsNeeded: number; // The number of games needed to get a TeamVictory on this match (from comparing the 2 teams handicaps)
  tiePossible: boolean; // Indicates if a tie is possible
};
// Embedded on TeamInfo
// Represents the three players playing in a match
// Holds information about the players and their position

export type Lineup = {
  player1: ActivePlayer; // has player information including
  player2: ActivePlayer; // id, handicap, wins losses
  player3: ActivePlayer;
};
// Embedded on Lineup
// Represents the information of three players playing in a match
// Holds information about the player

export type ActivePlayer = Shared.Names & {
  id: Shared.PlayerId; // the players id / email
  handicap: number; // The players handicap (derived from Total career (wins - losses)/ weeks played)
  wins: number; // Wins in this match
  losses: number; // Losses in this match
};

// Embedded on Matchup
// Represents all the games played in a match

export type GamePlay = {
  [gameKey: string]: GamePlayResults;
  // gameKey should be game1, game2 etc. to game18,
  // after game18  (if match is tied) gameKey should be tieBreakGame1, tieBreakGame2, tieBreakGame3
  // will need 18 to 21 games here to decide the match
};

// Embedded on GamePlay
// Represents a game (the 2 players and who won)

export type GamePlayResults = {
  breaker: Shared.PlayerId; //currentPlayer id
  racker: Shared.PlayerId; //currentPlayer id
  winner: Shared.PlayerId; //currentPlayer id
};

// Represents a matchup at a table, with two teams playing against each other.
export type TableMatchup = { home: number; away: number }; // Tuple: [Team1, Team2]
export type TableMatchupFinished = {
  home: { teamName: string; id: string };
  away: { teamName: string; id: string };
};

// Represents the entire round-robin schedule with weeks as keys and arrays of table matchups.
export type RoundRobinSchedule = {
  [week: string]: TableMatchup[];
};

export type RoundRobinScheduleFinished = {
  [week: string]: TableMatchupFinished[];
};
