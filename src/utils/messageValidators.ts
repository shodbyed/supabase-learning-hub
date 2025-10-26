/**
 * @fileoverview Message Validation Utilities
 *
 * Utility functions for validating message-related inputs.
 * Provides consistent validation logic across the messaging system.
 */

/**
 * Validate message content
 *
 * @param content - Message text to validate
 * @returns Error message if invalid, null if valid
 *
 * @example
 * validateMessageContent('') // "Message cannot be empty"
 * validateMessageContent('Hello!') // null (valid)
 */
export function validateMessageContent(content: string): string | null {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return 'Message cannot be empty';
  }

  if (trimmed.length > 2000) {
    return 'Message cannot exceed 2000 characters';
  }

  return null;
}

/**
 * Validate group name for group conversations
 *
 * @param groupName - Group name to validate
 * @returns Error message if invalid, null if valid
 *
 * @example
 * validateGroupName('') // "Group name is required"
 * validateGroupName('My Group') // null (valid)
 */
export function validateGroupName(groupName: string): string | null {
  const trimmed = groupName.trim();

  if (trimmed.length === 0) {
    return 'Group name is required';
  }

  if (trimmed.length < 3) {
    return 'Group name must be at least 3 characters';
  }

  if (trimmed.length > 50) {
    return 'Group name cannot exceed 50 characters';
  }

  return null;
}

/**
 * Validate announcement message
 *
 * @param message - Announcement text to validate
 * @returns Error message if invalid, null if valid
 *
 * @example
 * validateAnnouncementMessage('') // "Announcement cannot be empty"
 * validateAnnouncementMessage('Important announcement!') // null (valid)
 */
export function validateAnnouncementMessage(message: string): string | null {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return 'Announcement cannot be empty';
  }

  if (trimmed.length < 10) {
    return 'Announcement must be at least 10 characters';
  }

  if (trimmed.length > 500) {
    return 'Announcement cannot exceed 500 characters';
  }

  return null;
}

/**
 * Validate report description
 *
 * @param description - Report description to validate
 * @returns Error message if invalid, null if valid
 *
 * @example
 * validateReportDescription('') // "Description is required"
 * validateReportDescription('Too short') // "Description must be at least 10 characters"
 * validateReportDescription('This is a valid description') // null (valid)
 */
export function validateReportDescription(description: string): string | null {
  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return 'Description is required';
  }

  if (trimmed.length < 10) {
    return 'Description must be at least 10 characters. Please provide details.';
  }

  if (trimmed.length > 1000) {
    return 'Description cannot exceed 1000 characters';
  }

  return null;
}

/**
 * Validate user selection for new conversations
 *
 * @param selectedUserIds - Array of selected user IDs
 * @returns Error message if invalid, null if valid
 *
 * @example
 * validateUserSelection([]) // "Please select at least one person"
 * validateUserSelection(['user1']) // null (valid)
 */
export function validateUserSelection(selectedUserIds: string[]): string | null {
  if (selectedUserIds.length === 0) {
    return 'Please select at least one person';
  }

  if (selectedUserIds.length > 50) {
    return 'Cannot select more than 50 people';
  }

  return null;
}

/**
 * Validate announcement target selection
 *
 * @param selectedTargetIds - Array of selected target IDs
 * @returns Error message if invalid, null if valid
 *
 * @example
 * validateAnnouncementTargets([]) // "Please select at least one target"
 * validateAnnouncementTargets(['league1']) // null (valid)
 */
export function validateAnnouncementTargets(selectedTargetIds: string[]): string | null {
  if (selectedTargetIds.length === 0) {
    return 'Please select at least one target';
  }

  return null;
}

/**
 * Check if a string contains profanity (basic check)
 * Note: This is a simple check. For robust profanity filtering, use the backend.
 *
 * @param text - Text to check
 * @returns true if profanity detected, false otherwise
 *
 * @example
 * containsProfanity('Hello world') // false
 */
export function containsProfanity(_text: string): boolean {
  // This is a placeholder - actual profanity filtering should be done server-side
  // For now, just return false to allow the backend to handle it
  return false;
}

/**
 * Sanitize message content (remove excessive whitespace, trim)
 *
 * @param content - Message content to sanitize
 * @returns Sanitized content
 *
 * @example
 * sanitizeMessageContent('  Hello   world  ') // "Hello world"
 */
export function sanitizeMessageContent(content: string): string {
  // Remove excessive whitespace and trim
  return content.trim().replace(/\s+/g, ' ');
}
