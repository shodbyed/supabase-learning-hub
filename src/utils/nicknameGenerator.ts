/**
 * @fileoverview Nickname Generator Utility
 * Generates player nicknames based on first and last names, ensuring they fit within
 * the 12-character limit required for the mobile app display.
 */

/**
 * Creates a nickname for a player based on their first and last name ensuring it is
 * less than 12 characters long for use in the phone app
 *
 * Algorithm:
 * 1. Try full name (if < 12 chars)
 * 2. Try first name + last initial (if < 12 chars)
 * 3. Try first initial + last name (if < 12 chars)
 * 4. Last resort: first 4 chars of first name + first 4 chars of last name
 *
 * @param firstName - First name of player
 * @param lastName - Last name of player
 * @returns A nickname no longer than 12 characters
 *
 * @example
 * generateNickname("Edward", "Poplet") // "Edward P"
 * generateNickname("Christopher", "Johnson") // "Chris John"
 * generateNickname("Sam", "Lee") // "Sam Lee"
 */
export const generateNickname = (
  firstName: string,
  lastName: string
): string => {
  // Handle multi-part names by taking only the first part
  const firstNames = firstName.split(" ");
  const lastNames = lastName.split(" ");
  const cleanFirstName = firstNames[0];
  const cleanLastName = lastNames[0];

  // Try full name (first + last)
  let fullName = `${cleanFirstName} ${cleanLastName}`;
  if (fullName.length <= 12) {
    return fullName;
  }

  // Try full first name with just initial of last name
  fullName = `${cleanFirstName} ${cleanLastName.charAt(0)}`;
  if (fullName.length <= 12) {
    return fullName;
  }

  // Try first name initial with full last name
  fullName = `${cleanFirstName.charAt(0)} ${cleanLastName}`;
  if (fullName.length <= 12) {
    return fullName;
  }

  // Last resort: use first four letters in each name
  return `${cleanFirstName.substring(0, 4)} ${cleanLastName.substring(0, 4)}`;
};
