/**
 * @fileoverview API Hooks Index
 *
 * Central export point for all TanStack Query hooks.
 * Import hooks from here for cleaner imports.
 *
 * @example
 * import { useCurrentMember, useUserProfile } from '@/api/hooks';
 */

// Member/Auth hooks
export {
  useCurrentMember,
  useMemberId,
  useMemberFirstName,
  useIsCaptain,
} from './useCurrentMember';

export {
  useUserProfile,
  useIsOperator,
  useIsDeveloper,
  useMemberRole,
} from './useUserProfile';

export {
  useOperatorId,
  useOperatorIdValue,
  useIsCurrentUserOperator,
} from './useOperatorId';

// Team hooks
export {
  usePlayerTeams,
  useTeamDetails,
  useTeamsByLeague,
  useTeamsBySeason,
  useCaptainTeamEditData,
} from './useTeams';

// Team query functions (for backward compatibility with non-hook usage)
// Wraps the new query functions to match old {data, error} pattern
import { getTeamsByLeague } from '../queries/teams';

export async function fetchTeamsWithDetails(leagueId: string) {
  try {
    const data = await getTeamsByLeague(leagueId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Message hooks (queries)
export {
  useConversations,
  useConversationMessages,
  useBlockedUsers,
  useUnreadMessageCount,
  useConversationParticipants,
} from './useMessages';

// Message mutations
export {
  useSendMessage,
  useUpdateLastRead,
  useBlockUser,
  useUnblockUser,
} from './useMessageMutations';

// Report mutations
export {
  useCreateUserReport,
  useUpdateReportStatus,
} from './useReportMutations';

// League mutations
export {
  useUpdateLeagueDayOfWeek,
} from './useLeagueMutations';
