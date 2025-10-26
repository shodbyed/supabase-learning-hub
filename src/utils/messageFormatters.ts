/**
 * @fileoverview Message Formatting Utilities
 *
 * Utility functions for formatting message-related data.
 * Provides consistent formatting across the messaging system.
 */

import { formatDistanceToNow } from 'date-fns';

/**
 * Format a timestamp into a relative time string (e.g., "5 minutes ago")
 *
 * @param dateString - ISO date string
 * @returns Formatted relative time string, or empty string if invalid
 *
 * @example
 * formatRelativeTime('2024-01-15T10:30:00Z') // "5 minutes ago"
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '';

  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Format a timestamp into a localized date string (e.g., "1/15/2024")
 *
 * @param dateString - ISO date string
 * @returns Formatted date string, or empty string if invalid
 *
 * @example
 * formatLocalDate('2024-01-15T10:30:00Z') // "1/15/2024"
 */
export function formatLocalDate(dateString: string | null): string {
  if (!dateString) return '';

  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return '';
  }
}

/**
 * Format a timestamp into a localized time string (e.g., "10:30 AM")
 *
 * @param dateString - ISO date string
 * @returns Formatted time string, or empty string if invalid
 *
 * @example
 * formatLocalTime('2024-01-15T10:30:00Z') // "10:30 AM"
 */
export function formatLocalTime(dateString: string | null): string {
  if (!dateString) return '';

  try {
    return new Date(dateString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Format a timestamp into a localized date and time string (e.g., "1/15/2024, 10:30 AM")
 *
 * @param dateString - ISO date string
 * @returns Formatted date and time string, or empty string if invalid
 *
 * @example
 * formatLocalDateTime('2024-01-15T10:30:00Z') // "1/15/2024, 10:30 AM"
 */
export function formatLocalDateTime(dateString: string | null): string {
  if (!dateString) return '';

  try {
    return new Date(dateString).toLocaleString([], {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Truncate a message preview to a maximum length with ellipsis
 *
 * @param text - Message text to truncate
 * @param maxLength - Maximum length (defaults to 100)
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateMessage('This is a very long message...', 20) // "This is a very lo..."
 */
export function truncateMessage(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format a user's full name from first and last name
 *
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Full name string
 *
 * @example
 * formatFullName('John', 'Doe') // "John Doe"
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/**
 * Format a player number with P- prefix and zero padding
 *
 * @param playerNumber - System player number
 * @returns Formatted player number (e.g., "P-00123")
 *
 * @example
 * formatPlayerNumber(123) // "P-00123"
 */
export function formatPlayerNumber(playerNumber: number): string {
  return `P-${playerNumber.toString().padStart(5, '0')}`;
}

/**
 * Format unread count badge text
 *
 * @param count - Number of unread items
 * @returns Badge text (e.g., "99+" for counts over 99)
 *
 * @example
 * formatUnreadCount(5) // "5"
 * formatUnreadCount(150) // "99+"
 */
export function formatUnreadCount(count: number): string {
  if (count > 99) return '99+';
  return count.toString();
}
