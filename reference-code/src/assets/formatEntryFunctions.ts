// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Capitalization
//  - capitalizeString
//  - capitalizeField
// 2. Phone Number
//  - formatPhoneNumber
// 3. Games

// import { shuffleArray } from './globalFunctions';

// ------------------------------
// IMPORTS and VARIABLES
// ------------------------------
import { SeasonName } from 'bca-firebase-queries';
import {createSimpleGameArray} from './gameFunctions';

// ------------------------------
// 1. Capitalization
// ------------------------------

/**
 * Capitalizes the first character of the given string.
 *
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalizeString = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalizes the first character of each word in the given address string.
 *
 * @param address - The address string to capitalize.
 * @returns The capitalized address string.
 */
export const capitalizeField = (entry: string): string => {
  const formatted = entry.trim().toLowerCase();
  return formatted.split(' ').map(capitalizeString).join(' ');
};

// ------------------------------
// 2. Phone Number
// ------------------------------

/**
 * Formats a phone number string by removing any spaces or dashes, and then
 * returning the number in the format "### ### ####".
 *
 * @param phoneNumber - The phone number string to format.
 * @returns The formatted phone number string.
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  //remove spaces or dashes from the phone number
  const formattedPhoneNumber = phoneNumber.replace(/[D\s]/g, '');
  // get first 3 digits
  const firstThreeDigits = formattedPhoneNumber.slice(0, 3);
  const secondThreeDigits = formattedPhoneNumber.slice(3, 6);
  const lastFourDigits = formattedPhoneNumber.slice(6, 10);
  // return string format ### ### ####
  return `${firstThreeDigits} ${secondThreeDigits} ${lastFourDigits}`;
};

// ------------------------------
// 3. Games
// ------------------------------

export type PlayerGame = {
  value: number;
  break: boolean;
  createdAt: Date;
  seasonId: SeasonName;
  week: number;
  opponentId: string;
};

/**
 * Creates an array of `PlayerGame` objects from the provided `gameArray` of numbers,
 * The `PlayerGame` objects are created in a random order
 * `value` represents the represents a win (1) or loss (-1).
 * `break` property alternates between `true` and `false`
 * `createdAt` property is set to the current date,
 * `seasonId` is set to the provided `seasonId`,
 * `week` is calculated to have 6 games per week,
 * `opponentId` is set to an empty string.
 *
 * @param seasonId - The season ID to associate with the created `PlayerGame` objects.
 * @param wins - The number of wins to create.
 * @param losses - The number of losses to create.
 * @returns An array of `PlayerGame` objects.
 */

export const createFinishedGameArray = (
  seasonId: SeasonName,
  wins: number,
  losses: number
) => {
  // create an array of wins and losses
  const gameArray = createSimpleGameArray(wins, losses);

  // get length and create the finished array
  const length = gameArray.length;
  const finishedGameArray: PlayerGame[] = [];

  // loop through the array and add the elements to the finished array
  for (let i = 0; i < length; i++) {
    // random number between 0 and current length of the array
    const randomIndex = Math.floor(Math.random() * length);
    // remove the element at the random index
    const element = gameArray.splice(randomIndex, 1)[0];
    // add the element to the finished array
    finishedGameArray.push({
      value: element,
      break: i % 2 === 0 ? true : false,
      createdAt: new Date(),
      seasonId: seasonId,
      week: Math.floor(i / 6) + 1,
      opponentId: '',
    });
  }
  return finishedGameArray;
};
