import { playerFormSchema } from '../schemas/playerSchema';
import { capitalizeWords, formatFinalPhoneNumber } from '../utils/formatters';
import type { FormState } from './types';

interface UsePlayerFormSubmissionProps {
  state: FormState;
  onError: (errors: FormState['errors']) => void;
  onSuccess: () => void;
}

export const usePlayerFormSubmission = ({ state, onError, onSuccess }: UsePlayerFormSubmissionProps) => {
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
      onError(newErrors);
    } else {
      onSuccess();

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

  return { handleSubmit };
};