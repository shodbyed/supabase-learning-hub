import React from 'react';
import { Button } from '@/components/ui/button';
import { LoginCard } from '../login/LoginCard';
import { US_STATES } from '../constants/states';
import { formatPhoneNumber } from '../utils/formatters';
import { usePlayerForm } from './usePlayerForm';
import { usePlayerFormSubmission } from './usePlayerFormSubmission';
import { TextField, SelectField } from './FormField';

// TODO: Future feature - Add country selection for international phone numbers
// This would allow proper validation of international formats

export const NewPlayerForm: React.FC = () => {
  const { state, dispatch } = usePlayerForm();

  const { handleSubmit } = usePlayerFormSubmission({
    state,
    onError: (errors) => dispatch({ type: 'SET_ERRORS', errors }),
    onSuccess: () => dispatch({ type: 'CLEAR_ERRORS' }),
  });

  return (
    <LoginCard
      title="New Player Application"
      description="Let's start with your basic information"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="firstName"
          label="First Name"
          value={state.firstName}
          onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'firstName', value })}
          placeholder="Enter first name"
          error={state.errors.firstName}
          required
        />

        <TextField
          id="lastName"
          label="Last Name"
          value={state.lastName}
          onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'lastName', value })}
          placeholder="Enter last name"
          error={state.errors.lastName}
          required
        />

        <TextField
          id="nickname"
          label="Nickname (Optional)"
          value={state.nickname}
          onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'nickname', value })}
          placeholder="Enter nickname"
          error={state.errors.nickname}
        />

        <TextField
          id="phone"
          label="Phone Number"
          value={state.phone}
          onChange={(value) => {
            const formatted = formatPhoneNumber(value);
            dispatch({ type: 'SET_FIELD', field: 'phone', value: formatted });
          }}
          placeholder="123-456-7890"
          maxLength={12}
          error={state.errors.phone}
          required
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          value={state.email}
          onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'email', value })}
          placeholder="Enter email address"
          error={state.errors.email}
          required
        />

        <TextField
          id="address"
          label="Address"
          value={state.address}
          onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'address', value })}
          placeholder="Enter street address"
          error={state.errors.address}
          required
        />

        <TextField
          id="city"
          label="City"
          value={state.city}
          onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'city', value })}
          placeholder="Enter city"
          error={state.errors.city}
          required
        />

        <SelectField
          label="State"
          value={state.state}
          onValueChange={(value) => dispatch({ type: 'SET_FIELD', field: 'state', value })}
          placeholder="Select a state"
          options={US_STATES}
          error={state.errors.state}
          required
        />

        <TextField
          id="zipCode"
          label="Zip Code"
          value={state.zipCode}
          onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'zipCode', value })}
          placeholder="Enter zip code"
          error={state.errors.zipCode}
          required
        />

        <TextField
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={state.dateOfBirth}
          onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'dateOfBirth', value })}
          error={state.errors.dateOfBirth}
          required
        />

        <Button type="submit">
          Submit
        </Button>
      </form>
    </LoginCard>
  );
};