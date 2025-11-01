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
