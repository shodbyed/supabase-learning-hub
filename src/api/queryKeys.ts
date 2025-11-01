/**
 * @fileoverview Query Key Factory
 *
 * Centralized query key definitions for TanStack Query.
 * Provides type-safe, consistent query keys across the application.
 *
 * Benefits:
 * - Single source of truth for cache keys
 * - Type-safe query key access
 * - Easy invalidation patterns (e.g., invalidate all team queries)
 * - Prevents typos and inconsistencies
 *
 * Pattern:
 * - Base keys for collections: ['members'], ['teams']
 * - Specific keys for details: ['members', id], ['teams', leagueId]
 * - Hierarchical invalidation: invalidate(['teams']) clears all team queries
 *
 * @example
 * // In a query
 * useQuery({ queryKey: queryKeys.members.detail(memberId), ... })
 *
 * // Invalidate all member queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.members.all })
 *
 * // Invalidate specific member
 * queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(memberId) })
 */

export const queryKeys = {
  /**
   * Member-related query keys
   */
  members: {
    /** Base key for all member queries */
    all: ['members'] as const,

    /** Member by ID */
    detail: (id: string) => [...queryKeys.members.all, id] as const,

    /** Member by auth user ID */
    byUser: (userId: string) => [...queryKeys.members.all, 'user', userId] as const,

    /** Current logged-in member */
    current: () => [...queryKeys.members.all, 'current'] as const,

    /** Check if member is captain of any team */
    isCaptain: (memberId: string) =>
      [...queryKeys.members.all, 'isCaptain', memberId] as const,
  },

  /**
   * Team-related query keys
   */
  teams: {
    /** Base key for all team queries */
    all: ['teams'] as const,

    /** Team by ID with full details */
    detail: (id: string) => [...queryKeys.teams.all, id] as const,

    /** All teams in a league */
    byLeague: (leagueId: string) => [...queryKeys.teams.all, 'league', leagueId] as const,

    /** All teams in a season */
    bySeason: (seasonId: string) => [...queryKeys.teams.all, 'season', seasonId] as const,

    /** All teams a member is on */
    byMember: (memberId: string) => [...queryKeys.teams.all, 'member', memberId] as const,

    /** Team roster (players on team) */
    roster: (teamId: string) => [...queryKeys.teams.detail(teamId), 'roster'] as const,
  },

  /**
   * League-related query keys
   */
  leagues: {
    /** Base key for all league queries */
    all: ['leagues'] as const,

    /** League by ID */
    detail: (id: string) => [...queryKeys.leagues.all, id] as const,

    /** Leagues by operator */
    byOperator: (operatorId: string) => [...queryKeys.leagues.all, 'operator', operatorId] as const,

    /** Active leagues */
    active: () => [...queryKeys.leagues.all, 'active'] as const,
  },

  /**
   * Season-related query keys
   */
  seasons: {
    /** Base key for all season queries */
    all: ['seasons'] as const,

    /** Season by ID */
    detail: (id: string) => [...queryKeys.seasons.all, id] as const,

    /** Seasons by league */
    byLeague: (leagueId: string) => [...queryKeys.seasons.all, 'league', leagueId] as const,

    /** Active seasons */
    active: () => [...queryKeys.seasons.all, 'active'] as const,
  },

  /**
   * Schedule-related query keys
   */
  schedules: {
    /** Base key for all schedule queries */
    all: ['schedules'] as const,

    /** Schedule for a season */
    bySeason: (seasonId: string) => [...queryKeys.schedules.all, 'season', seasonId] as const,

    /** Schedule for a team */
    byTeam: (teamId: string) => [...queryKeys.schedules.all, 'team', teamId] as const,

    /** Specific week in a season */
    week: (seasonId: string, weekNumber: number) =>
      [...queryKeys.schedules.bySeason(seasonId), 'week', weekNumber] as const,
  },

  /**
   * Match-related query keys
   */
  matches: {
    /** Base key for all match queries */
    all: ['matches'] as const,

    /** Match by ID */
    detail: (id: string) => [...queryKeys.matches.all, id] as const,

    /** Match lineup */
    lineup: (matchId: string) => [...queryKeys.matches.detail(matchId), 'lineup'] as const,

    /** Match games/scoring */
    games: (matchId: string) => [...queryKeys.matches.detail(matchId), 'games'] as const,
  },

  /**
   * Messaging-related query keys
   */
  messages: {
    /** Base key for all message queries */
    all: ['messages'] as const,

    /** User's conversations list */
    conversations: (userId: string) => [...queryKeys.messages.all, 'conversations', userId] as const,

    /** Messages in a conversation */
    byConversation: (conversationId: string) =>
      [...queryKeys.messages.all, 'conversation', conversationId] as const,

    /** Unread message count */
    unreadCount: (userId: string) => [...queryKeys.messages.all, 'unread', userId] as const,

    /** Conversation participants */
    participants: (conversationId: string) =>
      [...queryKeys.messages.all, 'conversation', conversationId, 'participants'] as const,
  },

  /**
   * Venue-related query keys
   */
  venues: {
    /** Base key for all venue queries */
    all: ['venues'] as const,

    /** Venue by ID */
    detail: (id: string) => [...queryKeys.venues.all, id] as const,

    /** Venues by operator */
    byOperator: (operatorId: string) => [...queryKeys.venues.all, 'operator', operatorId] as const,
  },

  /**
   * Operator-related query keys
   */
  operators: {
    /** Base key for all operator queries */
    all: ['operators'] as const,

    /** Operator by member ID */
    byMember: (memberId: string) => [...queryKeys.operators.all, 'member', memberId] as const,

    /** Operator ID lookup */
    id: (memberId: string) => [...queryKeys.operators.all, 'id', memberId] as const,
  },

  /**
   * Reporting-related query keys
   */
  reports: {
    /** Base key for all report queries */
    all: ['reports'] as const,

    /** Pending reports count */
    pendingCount: (operatorId: string) => [...queryKeys.reports.all, 'pending', operatorId] as const,

    /** Reports by operator */
    byOperator: (operatorId: string) => [...queryKeys.reports.all, 'operator', operatorId] as const,
  },

  /**
   * Tournament-related query keys
   */
  tournaments: {
    /** Base key for all tournament queries */
    all: ['tournaments'] as const,

    /** Tournament search */
    search: (query: string) => [...queryKeys.tournaments.all, 'search', query] as const,
  },
} as const;

/**
 * Type helper for query keys
 * Utility type for extracting query key types
 */
export type QueryKeys = typeof queryKeys;
