import { Timestamp as timestamp } from 'firebase/firestore';
export type Timestamp = timestamp;
// ------------------------------
// Alias types
// ------------------------------

// Represents a season's name and also is the season id.
export type SeasonName = string;

// Represents a teams's name.
export type TeamName = string;
// Represents an email address and also is the pastPlayers id
export type Email = string;

// Represents a team's id in the collection Teams
export type TeamId = string;

// Represents a players id in the collection currentPlayers
export type PlayerId = string;

// Represents a matchup id in the collection Matchups
export type MatchupId = string;

// ------------------------------
// Enum types
// ------------------------------

// Represents different types of pool games
export type Game = '8 Ball' | '9 Ball' | '10 Ball';

// Represents the 4 seasons of the year.   Named time of year as Seasons is a firebase object
export type TimeOfYear = 'Spring' | 'Summer' | 'Fall' | 'Winter';

// Names of available Pool Halls
export type PoolHall = "Butera's Billiards" | 'Billiard Plaza';

// Represents a basic name structure for individual players
// This is shared with several objects like pastPlayer, currentPlayer, and teams documents
export type Names = {
  firstName: string;
  lastName: string;
  nickname: string;
};

// Represents the Date format Used in this app.
//toLocaleString('en-US', { year: 'numeric', month: format, day: 'numeric', });
export type DateFormat = 'long' | 'short' | 'numeric';

// Represents the days of the week or the night of the week league is on.
export type DayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';
// ------------------------------
// 7. UTILITY TYPES
// ------------------------------

// Represents a date or a Firestore Timestamp
export type DateOrStamp = Timestamp | Date;

// Represents either a Firestore Timestamp or "Invalid Date"
export type StampOrInvalid = Timestamp | NotDate;

// A lot of Date functions work taking in a date of any kind.
// If a Date is invalid they will return "Invalid Date"
export type NotDate = 'Invalid Date';
