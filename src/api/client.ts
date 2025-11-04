/**
 * @fileoverview TanStack Query Client Configuration
 *
 * Central configuration for TanStack Query (React Query) used throughout the application.
 * Provides default options for queries and mutations, and exports the QueryClient instance.
 *
 * Benefits:
 * - Automatic caching and deduplication of requests
 * - Background refetching to keep data fresh
 * - Optimistic updates for instant UI feedback
 * - Built-in loading and error state management
 *
 * @see https://tanstack.com/query/latest/docs/react/overview
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance with optimized defaults for this application
 *
 * Configuration:
 * - staleTime: How long data is considered fresh (5 minutes default)
 * - gcTime: How long unused data stays in cache (10 minutes)
 * - retry: Retry failed requests once before showing error
 * - refetchOnWindowFocus: Refresh data when user returns to tab
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes (no refetch on mount if within this time)
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry failed requests once
      retry: 1,

      // Refetch when user focuses window/tab (good for real-time feel)
      refetchOnWindowFocus: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,

      // Don't refetch on reconnect if data is fresh
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

/**
 * Specialized stale times for different data types
 * Use these constants when creating queries that need different staleness rules
 */
export const STALE_TIME = {
  // User/auth data - very stable, cache aggressively
  USER: 30 * 60 * 1000, // 30 minutes

  // Member profile data - relatively stable
  MEMBER: 15 * 60 * 1000, // 15 minutes

  // Team rosters - moderately stable
  TEAMS: 10 * 60 * 1000, // 10 minutes

  // League/season data - stable during season
  LEAGUES: 15 * 60 * 1000, // 15 minutes

  // Schedules - stable unless operator changes
  SCHEDULES: 10 * 60 * 1000, // 10 minutes

  // Messages - keep fresh
  MESSAGES: 30 * 1000, // 30 seconds

  // Real-time match data - always fresh
  MATCH_LIVE: 0, // Always stale, always refetch

  // Reports - keep fresh for operator notifications
  REPORTS: 30 * 1000, // 30 seconds

  // Static reference data - cache for session
  STATIC: Infinity, // Never stale
} as const;
