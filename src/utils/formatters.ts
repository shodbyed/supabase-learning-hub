/**
 * @fileoverview Formatting utilities for form inputs
 * Functions to format user input for consistent display and storage
 */

/**
 * Format phone number to (XXX) XXX-XXXX format
 */
export const formatPhoneNumber = (input: string): string => {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  // Format based on length
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

/**
 * Capitalize words - shared utility for names, addresses, etc.
 */
export const capitalizeWords = (input: string): string => {
  return input
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format final phone number for storage
 */
export const formatFinalPhoneNumber = (input: string): string => {
  // Remove all non-digit characters and return clean number
  return input.replace(/\D/g, '');
};

/**
 * Format league name with proper capitalization
 */
export const formatLeagueName = (input: string): string => {
  return capitalizeWords(input);
};

/**
 * Format venue name with proper capitalization
 */
export const formatVenueName = (input: string): string => {
  return capitalizeWords(input);
};

/**
 * Format contact name with proper capitalization
 */
export const formatContactName = (input: string): string => {
  return capitalizeWords(input);
};

/**
 * Format address with proper capitalization
 */
export const formatAddress = (input: string): string => {
  return input
    .trim()
    .split(' ')
    .map(word => {
      // Handle special cases like street abbreviations
      const upperWord = word.toUpperCase();
      if (['ST', 'AVE', 'BLVD', 'RD', 'DR', 'LN', 'CT', 'PL'].includes(upperWord)) {
        return upperWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Format number of tables input
 */
export const formatNumberOfTables = (input: string): string => {
  // Only allow digits
  const digits = input.replace(/\D/g, '');

  // Limit to reasonable range
  const num = parseInt(digits);
  if (isNaN(num)) return '';
  if (num > 50) return '50';

  return digits;
};

/**
 * Format city name with proper capitalization
 */
export const formatCity = (input: string): string => {
  return capitalizeWords(input);
};

/**
 * Format ZIP code to standard format
 */
export const formatZipCode = (input: string): string => {
  // Remove all non-digit characters except hyphens
  const cleaned = input.replace(/[^\d-]/g, '');

  // Handle 5+4 format (12345-6789) or just 5 digit (12345)
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    const zip5 = parts[0].slice(0, 5);
    const zip4 = parts[1] ? parts[1].slice(0, 4) : '';
    return zip4 ? `${zip5}-${zip4}` : zip5;
  }

  // For input without hyphen, add it if more than 5 digits
  const digits = cleaned.replace(/-/g, '');
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
  }

  return digits.slice(0, 5);
};