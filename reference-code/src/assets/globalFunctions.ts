// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Season-related functions
//    - buildSeasonName
// 2. Holiday-related functions
//    - fetchHolidays
//    - createHolidayObject
// 3. Team-related functions
//    - convertPastPlayerToTeamPlayer
// 4. Helper Functions
//    - safeParseInt
//    - addFieldIfDefined
//    - addWeek
//    - shuffleArray
//    - formatName
//    - formatPhoneNumber
// 5. Schedule-related functions
//    - createBasicSchedule
//    - insertHolidayIntoSchedule
//    - checkForConflicts
// 6. User-related functions
//    - generateNickname

// ------------------------------
// IMPORTS and VARIABLES
// ------------------------------
import { Timestamp } from "firebase/firestore";
import { daysOfTheWeek, notDate } from "./globalVariables";
import { getTimeOfYear, readableDate, toJSDate } from "./dateFunctions";
import Holidays from "date-holidays";
import {
  PastPlayer,
  TeamPlayer,
  Holiday,
  Schedule,
  DateOrStamp,
  Game,
  PoolHall,
  SeasonName,
  Email,
} from "bca-firebase-queries";
export { formatPhoneNumber } from "./formatEntryFunctions";

// ------------------------------
// 1. SEASON-RELATED Functions
// ------------------------------

/**
 * Names a season with information given
 * @param {Game} game - Game being played "8 Ball" | "9 Ball" | "10 Ball"
 * @param {DayOfWeek} night - Night of the week, e.g., 'Tuesday'
 * @param {PoolHall} poolHall - the Pool Hall hosting the league e.g. 'Billiards Plaza'
 * @param {Date|Timestamp} startDate - starting date of the season
 * @returns {string} - a season name, e.g., "9 Ball Tuesday Spring 2023 Billiards Plaza"
 */

export const buildSeasonName = (
  startDate: Timestamp | Date | string,
  poolHall?: PoolHall,
  game?: Game
) => {
  const date = toJSDate(startDate);
  if (date === notDate) {
    return "No Season Name Yet";
  }

  const year = date.getFullYear();
  const season = getTimeOfYear(date);
  const night = daysOfTheWeek[date.getDay()];
  return `${game ? game : "X Ball"} ${night} ${season} ${year} ${
    poolHall ? poolHall : "No Pool Hall"
  }`;
};

// ------------------------------
// 2. HOLIDAY-RELATED Functions
// ------------------------------

const SEASON_LENGTH_WEEKS = 18;
const ADDITIONAL_WEEKS = 8;

/**
 * Fetches holidays for a given season from Holidays.
 * @param {Date} startDate - The start date of the season.
 * @returns {Holiday[]} - A promise that resolves to an array of holidays.
 */

export const fetchHolidays = (startDate: Date | Timestamp | string) => {
  const jsDate = toJSDate(startDate);
  if (jsDate === notDate) {
    return [];
  }
  const hd = new Holidays();
  hd.init("US"); // adjust the country code as needed

  const start = new Date(jsDate);
  start.setDate(start.getDate() - 7); // start a week earlier

  const end = new Date(jsDate);
  end.setDate(end.getDate() + (SEASON_LENGTH_WEEKS + ADDITIONAL_WEEKS) * 7); // extend to cover the entire season plus buffer

  const yearStart = start.getFullYear();
  const yearEnd = end.getFullYear();

  const holidays = [];
  for (let year = yearStart; year <= yearEnd; year++) {
    holidays.push(...hd.getHolidays(year));
  }

  return holidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= start && holidayDate <= end;
  });
};

/**
 * Creates a holiday object in the shape of Holiday.
 * @param {DateOrStamp} startDate - The start date of the holiday/event.
 * @param {DateOrStamp} endDate - The end date of the holiday/event.
 * @param {string} type - either bca or apa to create that event.
 * @returns {Holiday} - A holiday object.
 */

export const createHolidayObject = (
  startDate: DateOrStamp,
  endDate: DateOrStamp,
  type: "bca" | "apa"
): Holiday => {
  const name = `${type.toUpperCase()} National Championships`;
  const object = {
    date: readableDate(startDate),
    name: name,
    start: startDate,
    end: endDate,
    rule: "Take these weeks off league to allow players to go to these events",
    type: "event",
  };
  return object;
};

// ------------------------------
// 3. TEAM-RELATED Functions
// ------------------------------
/**
 * Converts a pastPlayer object to a teamPlayerObject and assigns it to the specified role.
 * @param {PastPlayer} pastPlayer - A pastPlayer's data to be converted
 * @param {TeamPlayerRole} role - The role (e.g., 'captain', 'player2') that the player will assume in the team.
 * @returns {TeamPlayer} - An object with a single key-value pair, where the key is the team role and the value is the TeamPlayer info
 */

export const convertPastPlayerToTeamPlayer = (
  pastPlayer: PastPlayer
): TeamPlayer => {
  const teamPlayerInfo: Partial<TeamPlayer> = {};
  const { totalWins, totalLosses } = getStatsTotals(pastPlayer.stats);

  addFieldIfDefined(teamPlayerInfo, "firstName", pastPlayer.firstName);
  addFieldIfDefined(teamPlayerInfo, "lastName", pastPlayer.lastName);
  addFieldIfDefined(teamPlayerInfo, "nickname", pastPlayer.nickname);
  addFieldIfDefined(teamPlayerInfo, "currentUserId", pastPlayer.currentUserId);
  addFieldIfDefined(teamPlayerInfo, "pastPlayerId", pastPlayer.id as Email);
  addFieldIfDefined(teamPlayerInfo, "email", pastPlayer.email);
  addFieldIfDefined(teamPlayerInfo, "totalWins", totalWins);
  addFieldIfDefined(teamPlayerInfo, "totalLosses", totalLosses);

  return teamPlayerInfo as TeamPlayer;
};

export const getStatsTotals = (
  stats: Record<string, { wins: number; losses: number }>
): { totalWins: number; totalLosses: number } => {
  const seasonsSorted = Object.keys(stats)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 3);
  const totals = seasonsSorted.reduce(
    (acc, season) => {
      acc.totalWins += safeParseInt(stats[season].wins);
      acc.totalLosses += safeParseInt(stats[season].losses);
      return acc;
    },
    { totalWins: 0, totalLosses: 0 }
  );
  return totals;
};

export const createNewTeamData = (teamName: string, seasonId: SeasonName) => ({
  teamName,
  seasonId,
  players: {
    captain: {},
    player2: {},
    player3: {},
    player4: {},
    player5: {},
  },
  wins: 0,
  losses: 0,
  points: 0,
});

// ------------------------------
// 4. HELPER Functions
// ------------------------------

/**
 * Takes in a number string and returns a number invalid number strings return 0
 * @param {string | undefined} startDate - The number string e.g. '55'
 * @returns {number} - The number string as a number, invalid number strings or undefined returns zero
 */

export const safeParseInt = (value: string | number | undefined): number => {
  if (typeof value === "number") return value;
  return parseInt(value ?? "0", 10) || 0;
};

/**
 * Will only add a field if that field is defined
 * @param {T} object - The object of type T to which to  the key/value pair is added
 * @param {k} key - The key to add, where K is a keyof T.
 * @param {T[K] | undefined} value - The value for that key, which must be of the same type as object[key]
 */

export const addFieldIfDefined = <T, K extends keyof T>(
  object: T,
  key: K,
  value: T[K] | undefined
) => {
  if (value !== undefined && value !== null && value !== "") {
    object[key] = value;
  }
};

/**
 * Adds a week to any date
 * @param {string} date - The date string to which a week will be added
 * @returns {string} A formatted date representing the date one week after
 *                   the given date.  Returns original date if it is invalid
 */

export const addWeek = (date: string) => {
  // convert to a js date object
  const inDate = toJSDate(date);
  // check if it is a valid date
  if (inDate === notDate) return date;
  // adds 7 days
  inDate.setDate(inDate.getDate() + 7);

  return readableDate(inDate);
};

/**
 * Takes an array and randomizes the order of the array using the Fisher-Yates shuffle algorithm.
 * @param {T[]} array - The array to be randomized
 * @returns {T[]} A new array in a shuffled order
 */

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]; // Create a copy of the array

  //iterate thru the array
  for (let i = shuffled.length - 1; i > 0; i--) {
    // pick a random spot in the array
    const j = Math.floor(Math.random() * (i + 1));
    // swap places with the current item and the item in the random spot
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

/**
 * Takes a name and formats it to first letter uppercase while the rest is lowercase eg. 'Edward'.
 * @param {string} name - The name to be formatted
 * @returns {string} A formatted name
 */

export const formatName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

/**
 * Takes a phone number and formats it to be in the format (123) 456-7890.
 * @param {string} phoneNumber - The phone number to be formatted
 * @returns {string} A formatted phone number
 * @throws {Error} If the phone number is not 10 digits
 * const phoneRegEx = /^\(\d{3}\) \d{3}-\d{4}$/;
 * */

// export const formatPhoneNumber = (phoneNumber: string): string => {
//   let newPhoneNumber = phoneNumber;
//   // take all non numbers out of the string
//   newPhoneNumber = phoneNumber.replace(/\D/g, '');
//   // if the string is less than 10 digits return
//   if (newPhoneNumber.length < 10) return phoneNumber;
//   // add a dash - between the 6th and 7th digit
//   newPhoneNumber =
//     newPhoneNumber.substring(0, 6) + '-' + newPhoneNumber.substring(6);
//   // put parentheses around first three digits
//   newPhoneNumber = `(${newPhoneNumber.substring(
//     0,
//     3
//   )}) ${newPhoneNumber.substring(3)}`;
//   console.log('parens : ', newPhoneNumber);

//   return newPhoneNumber;
// };

// ------------------------------
// 5. Schedule-Related Functions
// ------------------------------

/**
 * Creates a basic schedule for a pool season
 * This function initializes the schedule starting from the startDate
 * It creates entries for each week, plus season break, money round and the next Season start
 * the user can alter the usual 16 week season if they wish
 * @param {Date} startDate - The starting day of the season to make the schedule for
 * @param {number} [seasonLength = 16 ] Optional. The the length of the season
 * @param {Schedule} basicSchedule - The the basic schedule for the league.
 */

export const createBasicSchedule = (
  startDate: Date,
  seasonLength: number = 16
): Schedule => {
  const basicSchedule: Schedule = {};
  let currentDate = new Date(startDate.getTime());

  const nextWeek = (date: Date): Date => {
    const nextWeekTimestamp = date.setDate(date.getDate() + 7);
    return new Date(nextWeekTimestamp);
  };

  for (let week = 1; week <= seasonLength; week++) {
    const dateKey = readableDate(currentDate);
    basicSchedule[dateKey] = {
      title: `Week ${week}`,
      leaguePlay: true,
      matchUps: "placeholder-matchupId",
    };

    currentDate = nextWeek(currentDate);
  }
  // add season break
  basicSchedule[readableDate(currentDate)] = {
    title: "Season Break",
    leaguePlay: false,
    matchUps: "none",
  };
  // add money round
  currentDate = nextWeek(currentDate);
  basicSchedule[readableDate(currentDate)] = {
    title: "Money Round",
    leaguePlay: true,
    matchUps: "placeholder-matchupId",
  };
  // add next season start
  currentDate = nextWeek(currentDate);
  const SeasonName = getTimeOfYear(currentDate);
  basicSchedule[readableDate(currentDate)] = {
    title: `${SeasonName} Start`,
    leaguePlay: false,
    matchUps: "none",
  };
  return basicSchedule;
};

/**
 * Inserts a holiday into a given schedule and adjusts subsequent weeks.
 * Adds the holiday to a specified date in the schedule, shifts all following
 * weeks accordingly, and denotes the start of the next season.
 * @param {string} holidayName - The name of the holiday to add
 * @param {string} dateKey - The date key to add the holiday to
 * @param {Schedule} schedule - The schedule to add the holiday in
 * @returns {Schedule} - A modified schedule with the holiday inserted and adjusted weeks
 */

export const insertHolidayIntoSchedule = (
  holidayName: string,
  dateKey: string,
  schedule: Schedule
) => {
  // create a new schedule
  const newSchedule = { ...schedule };

  if (newSchedule[dateKey]) {
    // get the old data
    let oldData = newSchedule[dateKey];

    // insert the holiday in its place
    newSchedule[dateKey] = {
      ...newSchedule[dateKey],
      title: holidayName,
      leaguePlay: false,
      matchUps: "none",
    };

    // move to the next week
    dateKey = addWeek(dateKey);

    // loop thru the rest to cascade the data
    for (const key in newSchedule) {
      if (key >= dateKey) {
        // grab the newData
        const newData = { ...newSchedule[dateKey] };

        // insert old data
        newSchedule[dateKey] = {
          ...newSchedule[dateKey],
          ...oldData,
        };

        // move to next date
        dateKey = addWeek(dateKey);

        // update the oldData for the next round
        oldData = { ...newData };
      }
    }
    // get the "season" name for the next season start
    const jsDate = toJSDate(dateKey);
    const nextSeason =
      jsDate === notDate ? "Next Season" : getTimeOfYear(jsDate);
    // create the last entry in the schedule
    newSchedule[dateKey] = {
      ...newSchedule[dateKey],
      title: `${nextSeason} Start`,
      leaguePlay: false,
      matchUps: "none",
    };
    return newSchedule;
  } else return schedule;
};

/**
 * Checks for conflicts in a schedule within a specified date range.
 * A conflict is defined as a date within the range where 'leaguePlay' is true.
 * The conflict check range is extended to 2 days before the start date and 2 days after the end date.
 * @param {Schedule} schedule - The schedule object to check for conflicts,
 *                              typically a mapping of date strings to schedule details.
 * @param {Date} start - The start date of the range to check for conflicts.
 * @param {Date} end - The end date of the range to check for conflicts.
 * @returns {string[]} - An array of date strings from the schedule that are within the conflict range
 *                       and have 'leaguePlay' set to true.
 */

export const checkForConflicts = (
  schedule: Schedule,
  start: Date,
  end: Date
) => {
  // Extend the conflict check range: 2 days before start, 2 days after end
  const rangeStart = new Date(new Date(start).setDate(start.getDate() - 2));
  const rangeEnd = new Date(new Date(end).setDate(end.getDate() + 2));

  // Filter and return dates from the schedule that fall within the conflict range
  // and have 'leaguePlay' set to true
  return Object.keys(schedule).filter((date) => {
    const scheduleDate = new Date(date);
    const isInRange = scheduleDate >= rangeStart && scheduleDate <= rangeEnd;
    const isLeaguePlay = schedule[date].leaguePlay;
    return isInRange && isLeaguePlay;
  });
};

// ------------------------------
// 6. User-Related Functions
// ------------------------------

/**
 * Creates a nickname for a player based on their first and last name ensuring it is
 * less than 12 characters long for use in the phone app
 * @param {string} firstName first name of player
 * @param {string}lastName last name of player
 * @returns {string} a name for the player no longer than 12 characters
 */

export const generateNickname = (
  firstName: string,
  lastName: string
): string => {
  const firstNames = firstName.split(" ");
  const lastNames = lastName.split(" ");
  firstName = firstNames[0];
  lastName = lastNames[0];
  // create the full name
  let fullName = `${firstName} ${lastName}`;

  // try full name
  if (fullName.length < 12) {
    return fullName;
  }
  // try full first name with just initial of last name
  fullName = `${firstName} ${lastName.charAt(0)}`;
  if (fullName.length < 12) {
    return fullName;
  }
  // try first name initial with full last name
  fullName = `${firstName.charAt(0)} ${lastName}`;
  if (fullName.length < 12) {
    return fullName;
  }
  // last resort use first four letters in each name.
  return `${firstName.substring(0, 4)} ${lastName.substring(0, 4)}`;
};
