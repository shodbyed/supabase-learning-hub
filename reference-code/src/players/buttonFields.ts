import { Names } from '../assets/typesFolder/sharedTypes';
import { PastPlayer } from '../assets/typesFolder/userTypes';

export const nameFields: Array<{ fieldName: keyof Names; name: string }> = [
  {
    fieldName: 'firstName',
    name: 'First Name',
  },
  {
    fieldName: 'lastName',
    name: 'Last Name',
  },
  {
    fieldName: 'nickname',
    name: 'Nickname',
  },
];

export type PastPlayerProfileFields = Omit<
  PastPlayer,
  | 'email'
  | 'stats'
  | 'teams'
  | 'seasons'
  | 'firstName'
  | 'lastName'
  | 'nickname'
  | 'currentUserId'
  | 'id'
>;

export const profileFields: Array<{
  fieldName: keyof PastPlayerProfileFields;
  name: string;
}> = [
  {
    fieldName: 'phone',
    name: 'Phone',
  },
  {
    fieldName: 'address',
    name: 'Address',
  },
  {
    fieldName: 'city',
    name: 'City',
  },
  {
    fieldName: 'state',
    name: 'State',
  },
  {
    fieldName: 'zip',
    name: 'Zip',
  },
  {
    fieldName: 'dob',
    name: 'Birthday',
  },
];
