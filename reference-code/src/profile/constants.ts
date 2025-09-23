import { Player } from 'bca-firebase-queries';

type PlayerLabels = {
  key: keyof Player;
  label: string;
};

export const playerKeys: PlayerLabels[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'nickname', label: 'Nickname' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'Zip' },
  { key: 'dob', label: 'Date of Birth' },
];

export const playerNames: PlayerLabels[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'nickname', label: 'Nickname' },
];
export const playerAddress: PlayerLabels[] = [
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'Zip' },
];
export const playerContact: PlayerLabels[] = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
];
