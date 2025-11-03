/**
 * @fileoverview Member and User-related type definitions
 * Centralized types for member profiles, user roles, and authentication
 */

/**
 * User roles available in the system
 */
export type UserRole = 'player' | 'league_operator' | 'developer';

/**
 * Member interface representing a user's profile data stored in Supabase
 * This maps to the 'members' table in the database
 */
export interface Member {
  id: string;
  user_id: string; // References Supabase auth.users.id
  first_name: string;
  last_name: string;
  nickname?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  date_of_birth: string; // ISO date string
  role: UserRole;
  system_player_number: number; // System-generated player ID (always assigned)
  bca_member_number: string | null; // Official BCA member number (null until assigned)
  membership_paid_date: string | null; // ISO date string when membership was last paid
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Helper function to get display player number
 * Shows BCA number if available, otherwise system player number
 */
export function getPlayerDisplayNumber(member: Member): string {
  if (member.bca_member_number) {
    return `#BCA-${member.bca_member_number}`;
  }
  return `#P-${String(member.system_player_number).padStart(5, '0')}`;
}

/**
 * Helper function to get display name with player number
 * Example: "John Smith #BCA-123456" or "John Smith #P-00042"
 */
export function getPlayerDisplayName(member: Member): string {
  const fullName = `${member.first_name} ${member.last_name}`;
  const playerNumber = getPlayerDisplayNumber(member);
  return `${fullName} ${playerNumber}`;
}

/**
 * Partial member object from database queries (captain/roster lookups)
 * Only includes fields needed for display purposes
 */
export interface PartialMember {
  id: string;
  first_name: string;
  last_name: string;
  system_player_number: number;
  bca_member_number: string | null;
}

/**
 * Format player number for partial member objects from queries
 * Shows BCA number if available, otherwise system player number
 * Example: "#BCA-123456" or "#P-00042"
 */
export function formatPartialMemberNumber(member: PartialMember): string {
  // Reuse the main getPlayerDisplayNumber logic
  return getPlayerDisplayNumber(member as Member);
}

/**
 * Minimal player interface for nickname display
 * Only includes fields needed for showing player name (nickname or full name)
 */
export interface PlayerForDisplay {
  first_name: string;
  last_name: string;
  nickname: string | null;
}

/**
 * Get player nickname or full name (no player number)
 *
 * Returns the player's nickname if available, otherwise returns their full name.
 * Used for casual display in game scoring, chat, etc. where player numbers aren't needed.
 *
 * @param player - Player object with first_name, last_name, and optional nickname
 * @returns Nickname or "FirstName LastName"
 *
 * @example
 * getPlayerNickname({ first_name: 'John', last_name: 'Doe', nickname: 'JD' }); // Returns: "JD"
 * getPlayerNickname({ first_name: 'Jane', last_name: 'Smith', nickname: null }); // Returns: "Jane Smith"
 */
export function getPlayerNickname(player: PlayerForDisplay | null | undefined): string {
  if (!player) return 'Unknown';
  return player.nickname || `${player.first_name} ${player.last_name}`;
}

/**
 * Get player nickname by ID from a player Map
 *
 * Helper function for looking up a player by ID and returning their nickname.
 * Commonly used in scoring systems where players are stored in a Map.
 *
 * @param playerId - Player's ID to look up
 * @param playersMap - Map of player IDs to player objects
 * @returns Nickname or "FirstName LastName" or "Unknown" if not found
 *
 * @example
 * const players = new Map([['id1', { first_name: 'John', last_name: 'Doe', nickname: 'JD' }]]);
 * getPlayerNicknameById('id1', players); // Returns: "JD"
 */
export function getPlayerNicknameById(
  playerId: string | null | undefined,
  playersMap: Map<string, PlayerForDisplay>
): string {
  if (!playerId) return 'Unknown';
  const player = playersMap.get(playerId);
  return getPlayerNickname(player);
}
