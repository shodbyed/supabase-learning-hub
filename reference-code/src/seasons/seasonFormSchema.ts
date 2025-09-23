import * as yup from 'yup';
import { Game, PoolHall } from '../assets/typesFolder/sharedTypes';
import { games, poolHalls } from '../assets/globalVariables';
export type TestSchema = {
  startDate: Date;
  game: Game;
  poolHall: PoolHall;
  seasonLength: number;
  bcaStartDate: Date;
  bcaEndDate: Date;
  ignoreBCADates: boolean;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

export const testSchema = yup.object().shape({
  startDate: yup.date().required('Start date is required'),
  game: yup.string().oneOf(games).required('Game is required'),
  poolHall: yup.string().oneOf(poolHalls).required('Pool hall is required'),
  seasonLength: yup
    .number()
    .min(10, 'Season should be at least 10 weeks')
    .max(30, 'Season can not be longer than 30 weeks')
    .required('Please set season length'),
  bcaStartDate: yup
    .date()
    .required('Start date is required')
    .test(
      'is-not-today',
      'Today is not a valid choice, please choose a different start date or select yesterday if today is the actual start date',
      (value) => {
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate.getTime() !== today.getTime();
      }
    ),
  bcaEndDate: yup
    .date()
    .required('BCA end date is required')
    .test(
      'is-not-today',
      'Today is not a valid choice, please choose a different end date or select tomorrow if today is the actual end date',
      (value) => {
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate.getTime() !== today.getTime();
      }
    ),
  ignoreBCADates: yup.boolean().required(),
});
