import * as Shared from './sharedTypes';

export type Player = Shared.Names & {
  id: string;
  isAdmin: boolean;
  leagues: PlayerLeague[];
  seasons: PlayerSeason[];
  teams: PlayerTeam[];
};

export type PlayerLeague = {
  id: string;
  locationName: string;
  name: string;
  playerHandicap: number;
};
export type PlayerSeason = {
  leagueId: string;
  name: string;
  seasonHandicap: number;
  rank: number;
  losses: number;
  wins: number;
};

export type PlayerTeam = {
  teamId: string;
  name: string;
};
