import * as Shared from './sharedTypes';

// Represents a player (archive) in pastPlayers collection
// Names includes: firstName, lastName, nickName
export type PastPlayer = Shared.Names & {
  id: Shared.Email; // the Email of the player also the id of the document
  currentUserId?: Shared.PlayerId;
  email: Shared.Email; // Email of the player
  dob: string; // Date of birth of the player
  address: string; // The players Address
  city: string; // The city the player lives in
  state: string; // The state the player lives in
  zip: string; // That cities zip code
  phone: string; // The players phone number
  // archived wins and losses for the last 3 seasons if available
  stats: {
    [dateString: string]: {
      wins: number;
      losses: number;
      seasonName: Shared.SeasonName;
      seasonEnd: Shared.Timestamp;
    };
  };
  seasons?: string[];
  teams?: string[];
};

// Represents a player that has logged into the app with minimal information
// needed to run most of the seasons data.
export type CurrentUser = Shared.Names & {
  id: string;
  isAdmin?: boolean | string;
  email: Shared.Email;
  stats?: { [game: string]: { wins: number; losses: number } };
  seasons: string[];
  teams: string[];
  pastPlayerId?: Shared.Email;
};
