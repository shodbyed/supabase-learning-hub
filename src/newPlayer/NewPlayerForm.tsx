import React, { useReducer } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoginCard } from '../login/LoginCard';
import { US_STATES } from '../constants/states';
import { formatPhoneNumber, capitalizeWords, formatFinalPhoneNumber } from '../utils/formatters';
import { playerFormSchema } from '../schemas/playerSchema';

// TODO: Future feature - Add country selection for international phone numbers
// This would allow proper validation of international formats

// Define form state type
interface FormState {
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
type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'SET_ERRORS'; errors: FormState['errors'] }
  | { type: 'CLEAR_ERRORS' };

// Initial state
const initialState: FormState = {
  firstName: '',
  lastName: '',
  nickname: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  dateOfBirth: '',
  errors: {},
};

// Reducer function
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: {
          ...state.errors,
          [action.field]: undefined, // Clear error when user types
        },
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };
    default:
      return state;
  }
}

export const NewPlayerForm: React.FC = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Zod validation
    const result = playerFormSchema.safeParse({
      firstName: state.firstName,
      lastName: state.lastName,
      nickname: state.nickname,
      phone: state.phone,
      email: state.email,
      address: state.address,
      city: state.city,
      state: state.state,
      zipCode: state.zipCode,
      dateOfBirth: state.dateOfBirth,
    });

    if (!result.success) {
      const newErrors: FormState['errors'] = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormState['errors'];
        newErrors[field] = issue.message;
      });
      dispatch({ type: 'SET_ERRORS', errors: newErrors });
    } else {
      dispatch({ type: 'CLEAR_ERRORS' });

      // Format the data
      const formattedData = {
        firstName: capitalizeWords(result.data.firstName),
        lastName: capitalizeWords(result.data.lastName),
        nickname: result.data.nickname ? capitalizeWords(result.data.nickname) : '',
        phone: formatFinalPhoneNumber(result.data.phone),
        email: result.data.email.toLowerCase(),
        address: capitalizeWords(result.data.address),
        city: capitalizeWords(result.data.city),
        state: result.data.state,
        zipCode: result.data.zipCode,
        dateOfBirth: result.data.dateOfBirth,
      };

      console.log('Formatted data:', formattedData);

      // Show formatted data in popup
      const formattedMessage = `
Player Application Submitted:

Name: ${formattedData.firstName} ${formattedData.lastName}
${formattedData.nickname ? `Nickname: ${formattedData.nickname}\n` : ''}Phone: ${formattedData.phone}
Email: ${formattedData.email}
Address: ${formattedData.address}
City: ${formattedData.city}, ${formattedData.state} ${formattedData.zipCode}
Date of Birth: ${formattedData.dateOfBirth}
      `.trim();

      alert(formattedMessage);
    }
  };

  return (
    <LoginCard
      title="New Player Application"
      description="Let's start with your basic information"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={state.firstName}
            onChange={(e) => dispatch({
              type: 'SET_FIELD',
              field: 'firstName',
              value: e.target.value
            })}
            placeholder="Enter first name"
          />
          {state.errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{state.errors.firstName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={state.lastName}
            onChange={(e) => dispatch({
              type: 'SET_FIELD',
              field: 'lastName',
              value: e.target.value
            })}
            placeholder="Enter last name"
          />
          {state.errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{state.errors.lastName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="nickname">Nickname (Optional)</Label>
          <Input
            id="nickname"
            value={state.nickname}
            onChange={(e) => dispatch({
              type: 'SET_FIELD',
              field: 'nickname',
              value: e.target.value
            })}
            placeholder="Enter nickname"
          />
          {state.errors.nickname && (
            <p className="text-sm text-red-500 mt-1">{state.errors.nickname}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={state.phone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              dispatch({
                type: 'SET_FIELD',
                field: 'phone',
                value: formatted
              });
            }}
            placeholder="123-456-7890"
            maxLength={12}
          />
          {state.errors.phone && (
            <p className="text-sm text-red-500 mt-1">{state.errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={state.email}
            onChange={(e) => dispatch({
              type: 'SET_FIELD',
              field: 'email',
              value: e.target.value
            })}
            placeholder="Enter email address"
          />
          {state.errors.email && (
            <p className="text-sm text-red-500 mt-1">{state.errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={state.address}
            onChange={(e) => dispatch({
              type: 'SET_FIELD',
              field: 'address',
              value: e.target.value
            })}
            placeholder="Enter street address"
          />
          {state.errors.address && (
            <p className="text-sm text-red-500 mt-1">{state.errors.address}</p>
          )}
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={state.city}
            onChange={(e) => dispatch({
              type: 'SET_FIELD',
              field: 'city',
              value: e.target.value
            })}
            placeholder="Enter city"
          />
          {state.errors.city && (
            <p className="text-sm text-red-500 mt-1">{state.errors.city}</p>
          )}
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Select
            value={state.state}
            onValueChange={(value: string) => dispatch({
              type: 'SET_FIELD',
              field: 'state',
              value: value
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((stateCode) => (
                <SelectItem key={stateCode} value={stateCode}>
                  {stateCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors.state && (
            <p className="text-sm text-red-500 mt-1">{state.errors.state}</p>
          )}
        </div>

        <div>
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            value={state.zipCode}
            onChange={(e) => dispatch({
              type: 'SET_FIELD',
              field: 'zipCode',
              value: e.target.value
            })}
            placeholder="Enter zip code"
          />
          {state.errors.zipCode && (
            <p className="text-sm text-red-500 mt-1">{state.errors.zipCode}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={state.dateOfBirth}
            onChange={(e) => dispatch({
              type: 'SET_FIELD',
              field: 'dateOfBirth',
              value: e.target.value
            })}
          />
          {state.errors.dateOfBirth && (
            <p className="text-sm text-red-500 mt-1">{state.errors.dateOfBirth}</p>
          )}
        </div>

        <Button type="submit">
          Submit
        </Button>
      </form>
    </LoginCard>
  );
};