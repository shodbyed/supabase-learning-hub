/**
 * @fileoverview Text and data formatting utilities for consistent data presentation
 * These functions handle common formatting tasks across the application
 */

/**
 * Formats a phone number in real-time as the user types
 * Progressively adds dashes to create XXX-XXX-XXXX format
 *
 * @param value - Raw input string that may contain letters, spaces, etc.
 * @returns Formatted phone number string with dashes
 * @example formatPhoneNumber("1234567890") // returns "123-456-7890"
 */
export const formatPhoneNumber = (value: string) => {
  // Remove all non-digits for consistent processing
  const digits = value.replace(/\D/g, '');

  // Progressive formatting based on input length
  if (digits.length <= 3) {
    return digits; // "123"
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`; // "123-456"
  } else {
    // Cap at 10 digits for US phone numbers
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`; // "123-456-7890"
  }
};

/**
 * Capitalizes the first letter of each word in a string
 * Used for proper names, addresses, and other user input
 *
 * @param text - Input string to capitalize
 * @returns String with each word's first letter capitalized
 * @example capitalizeWords("john doe") // returns "John Doe"
 */
export const capitalizeWords = (text: string) => {
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formats a completed phone number for final storage/display
 * Ensures exactly 10 digits are formatted as XXX-XXX-XXXX
 *
 * @param phone - Phone number string (may have existing formatting)
 * @returns Consistently formatted phone number
 * @example formatFinalPhoneNumber("123 456 7890") // returns "123-456-7890"
 */
export const formatFinalPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};