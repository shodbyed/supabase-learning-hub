// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Date conversion functions
//  - timestampToDate
//  - dateToTimestamp
//  - toJSDate
//  - readableDate
//  - toSaveDateFormat

// ------------------------------
// IMPORTS and VARIABLES
// ------------------------------
//import { daysOfTheWeek } from './globalVariables';

import { Timestamp } from 'firebase/firestore';

import { notDate } from './globalVariables';
import {
  DateFormat,
  NotDate,
  StampOrInvalid,
  TimeOfYear,
} from './typesFolder/sharedTypes';
// ------------------------------
// 1. Date Conversion Functions
// ------------------------------

export const formatDateToYYYYMMDD = (
  dateInput: Date | Timestamp | string
): string => {
  let dateObj: Date;

  // Check if the input is a Date object
  if (dateInput instanceof Date) {
    dateObj = dateInput;
    // Check if the input is a Firebase Timestamp
  } else if (dateInput instanceof Timestamp) {
    dateObj = dateInput.toDate();
    // Check if the input is a string and convert it to a Date object
  } else if (typeof dateInput === 'string') {
    dateObj = new Date(dateInput);
  } else {
    throw new Error('Invalid date input');
  }

  // Extract the year, month, and day from the Date object
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // getMonth() is zero-based
  const day = dateObj.getDate();

  // Format the month and day with leading zeros if needed
  const formattedMonth = month < 10 ? `0${month}` : month.toString();
  const formattedDay = day < 10 ? `0${day}` : day.toString();

  // Return the formatted date string
  return `${year}-${formattedMonth}-${formattedDay}`;
};

/**
 * converts a JS date to a Firebase Timestamp
 * @param {Date} date - Date to convert
 * @returns {Timestamp} - The converted Firebase Timestamp
 */

export const convertDateToTimestamp = (
  date: Date | undefined
): Timestamp | NotDate => {
  if (date === undefined) {
    return notDate;
  }
  const jsDate = toJSDate(date);
  if (jsDate === notDate) {
    return notDate;
  }

  if (!date) {
    throw new Error('Invalid date provided to convertDateToTimestamp');
  }
  return Timestamp.fromDate(date);
};

/**
 * converts a Firebase Timestamp to a JS date
 * @param {Timestamp} timestamp - Date to convert
 * @returns {Date} - The converted JS Date
 */

export const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};
/**
 * Converts a Date, string, or Timestamp to a JS Date object
 * @param {Date | string | Timestamp} date - The date to convert
 * @returns {Date} - The converted JS Date object
 */
export const toJSDate = (date: Date | string | Timestamp): Date | NotDate => {
  if (date instanceof Date) {
    return date;
  } else if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return notDate;
    }
    return parsedDate;
  } else if (date instanceof Timestamp) {
    return date.toDate();
  } else {
    return notDate;
  }
};

/**
 * converts a Date to a readable string
 * @param {Date | Timestamp | string} date - Date to convert
 * @param {DateFormat} format - Date to convert
 * @returns {string} - The date in the format requested
 */

export const readableDate = (
  date: Date | string | Timestamp,
  format: DateFormat = 'short'
): string => {
  const jsDate = toJSDate(date);
  return jsDate === notDate
    ? notDate
    : jsDate.toLocaleString('en-US', {
        year: 'numeric',
        month: format,
        day: 'numeric',
      });
};

/**
 * converts a Date to a readable string with a short version day of the week
 * @param {Date | Timestamp | string} date - Date to convert
 * @param {DateFormat} format - Date to convert
 * @returns {string} - The date in the format requested
 */

export const readableDateWithDay = (
  dateInput: Date | string | Timestamp,
  format: DateFormat = 'short'
) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(toJSDate(dateInput));
  const day = days[date.getDay()];
  const readableDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: format,
    day: 'numeric',
  });
  return `${day}, ${readableDate}`;
};

export const getTimeOfYear = (date: Date): TimeOfYear | NotDate => {
  const jsDate = toJSDate(date);
  if (jsDate === notDate) {
    return notDate;
  }
  const month = date.getMonth();

  if (month >= 2 && month <= 4) {
    return 'Spring';
  } else if (month >= 5 && month <= 7) {
    return 'Summer';
  } else if (month >= 8 && month <= 10) {
    return 'Fall';
  } else {
    return 'Winter';
  }
};

/**
 * Calculates the end date of a season given its start date
 * @param {Date | Timestamp | Invalid} startDate - The start date of the season, can be a Firebase Timestamp or 'notDate'
 * @param {number} seasonLength - The number of weeks in a season.
 * @returns {Timestamp | NotDate} - The end date of the season as a Firebase Timestamp, or 'notDate' if the start date is invalid
 */
export const getSeasonEndDate = (
  startDate: Date | StampOrInvalid,
  seasonLength: number
): StampOrInvalid => {
  const start = toJSDate(startDate);
  const weeks = seasonLength + 2; // Add 2 weeks for the off week and championship round
  console.log('calc End Date', seasonLength, weeks);

  const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000; // Number of milliseconds in a week
  const totalMilliseconds = weeks * millisecondsInWeek;
  if (start === notDate) {
    return notDate;
  } else {
    const endDate = new Date(start.getTime() + totalMilliseconds);
    return isNaN(endDate.getTime()) ? notDate : Timestamp.fromDate(endDate);
  }
};

export const createNewTimestamp = (stamp: StampOrInvalid): StampOrInvalid => {
  if (stamp instanceof Date && !isNaN(stamp.getTime())) {
    return Timestamp.fromDate(stamp);
  } else {
    return notDate;
  }
};
