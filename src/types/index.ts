/**
 * @fileoverview Centralized Type Exports
 * Re-exports all types from their individual modules for convenient importing
 *
 * Usage:
 * import { Member, League, Venue } from '@/types';
 */

// Member and User types
export type { Member, PartialMember, UserRole } from './member';

// League types
export type {
  LeagueFormData,
  TeamFormat,
  HandicapSystem,
  GameType,
  Season
} from './league';

// Venue types
export type { Venue, VenueFormData } from './venue';

// Tournament types
export type {
  Tournament,
  TournamentDateOption,
  TournamentSearchParams,
  TournamentOrganization,
  TournamentType
} from './tournament';

// Match and Scoring types
export type {
  MatchType,
  MatchBasic,
  MatchWithLeagueSettings,
  Lineup,
  Player,
  HandicapThresholds,
  MatchGame,
  ScoringOptions,
  ConfirmationQueueItem,
  TeamStats,
  PlayerStats
} from './match';

// Match and Scoring utility functions
export { getTeamStats, getPlayerStats, getCompletedGamesCount, calculatePoints, calculateBCAPoints, TIEBREAKER_THRESHOLDS } from './match';

// Team types
export type { Team, TeamWithQueryDetails, UseTeamManagementReturn } from './team';

// Schedule types
export type {
  MatchStatus,
  Match,
  MatchWithDetails,
  MatchInsertData,
  TeamSchedulePosition,
  TeamSchedulePositionInsertData
} from './schedule';
