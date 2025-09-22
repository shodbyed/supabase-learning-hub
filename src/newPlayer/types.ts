// Define form state type
export interface FormState {
  firstName: string;
  lastName: string;
  nickname: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  errors: {
    firstName?: string;
    lastName?: string;
    nickname?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    dateOfBirth?: string;
  };
}

// Define action types
export type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'SET_ERRORS'; errors: FormState['errors'] }
  | { type: 'CLEAR_ERRORS' };