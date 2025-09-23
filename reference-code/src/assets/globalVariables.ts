import { Schedule } from './typesFolder/seasonTypes';
import { DayOfWeek, Game, PoolHall } from './typesFolder/sharedTypes';
import { TeamPlayer, TeamPlayerRole } from 'bca-firebase-queries';

export const notDate = 'Invalid Date';
export const daysOfTheWeek: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
export const playerOrder: TeamPlayerRole[] = [
  'captain',
  'player2',
  'player3',
  'player4',
  'player5',
];

export const timestampWeek: number = 604800000; // 604,800,000
export const seasonLength: number = timestampWeek * 18;
export const poolHalls: PoolHall[] = ['Billiard Plaza', "Butera's Billiards"];
export const games: Game[] = ['9 Ball', '8 Ball', '10 Ball'];
export const bcaWebsite = 'https://www.playcsipool.com/events.html';
export const apaWebsite = 'https://poolplayers.com/world-pool-championships/';

export const blankPlayerInfoObject: TeamPlayer = {
  firstName: '',
  lastName: '',
  nickname: '',
  email: 'a@b.c',
  pastPlayerId: 'a@b.c',
  currentUserId: '',
  totalWins: 0,
  totalLosses: 0,
};
export const blankPlayerObject = {
  captain: { ...blankPlayerInfoObject },
  player2: { ...blankPlayerInfoObject },
  player3: { ...blankPlayerInfoObject },
  player4: { ...blankPlayerInfoObject },
  player5: { ...blankPlayerInfoObject },
};

export const initialSchedule: Schedule = {
  '2023-01-01': {
    title: 'placeHolder',
    leaguePlay: false,
    matchUps: 'placeholder-matchupId',
  },
};
