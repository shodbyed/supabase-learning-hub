import { playerFormSchema } from '../schemas/playerSchema';
import { capitalizeWords, formatFinalPhoneNumber } from '../utils/formatters';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/useUser';
import { useNavigate } from 'react-router-dom';
import type { FormState } from './types';

interface UsePlayerFormSubmissionProps {
  state: FormState;
  onError: (errors: FormState['errors']) => void;
  onSuccess: () => void;
  onLoading: (loading: boolean) => void;
}

export const usePlayerFormSubmission = ({ state, onError, onSuccess, onLoading }: UsePlayerFormSubmissionProps) => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure user is authenticated
    if (!user) {
      onError({ general: 'You must be logged in to submit an application' });
      return;
    }

    // Client-side validation with Zod
    const result = playerFormSchema.safeParse({
      firstName: state.firstName,
      lastName: state.lastName,
      nickname: state.nickname,
      phone: state.phone,
      address: state.address,
      city: state.city,
      state: state.state,
      zipCode: state.zipCode,
      dateOfBirth: state.dateOfBirth,
    });

    if (!result.success) {
      // Handle validation errors
      const newErrors: FormState['errors'] = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormState['errors'];
        newErrors[field] = issue.message;
      });
      onError(newErrors);
      return;
    }

    try {
      // Start loading state
      onLoading(true);

      // Format the data for database insertion
      const memberData = {
        user_id: user.id, // Link to authenticated user
        first_name: capitalizeWords(result.data.firstName),
        last_name: capitalizeWords(result.data.lastName),
        nickname: result.data.nickname ? capitalizeWords(result.data.nickname) : null,
        phone: formatFinalPhoneNumber(result.data.phone),
        email: user.email?.toLowerCase() || '', // Use email from authenticated user
        address: capitalizeWords(result.data.address),
        city: capitalizeWords(result.data.city),
        state: result.data.state,
        zip_code: result.data.zipCode,
        date_of_birth: result.data.dateOfBirth,
        role: 'player' as const, // Default role for new members
      };

      // Insert member data into Supabase
      const { error: insertError } = await supabase
        .from('members')
        .insert(memberData);

      if (insertError) {
        // Handle database errors
        console.error('Database error:', insertError);
        onError({ general: `Failed to save application: ${insertError.message}` });
        return;
      }

      // Success! Clear errors and redirect
      onSuccess();

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error:', error);
      onError({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      // Stop loading state
      onLoading(false);
    }
  };

  return { handleSubmit };
};