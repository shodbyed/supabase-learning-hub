import { z } from 'zod';
import { US_STATES } from '../constants/states';

export const playerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  nickname: z.string().max(12, 'Nickname must be 12 characters or less').optional(),
  phone: z.string()
    .min(1, 'Phone number is required')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, 'Phone number must contain exactly 10 digits'),
  // email removed - pulled from auth user
  address: z.string().min(1, 'Address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.enum(US_STATES as [string, ...string[]], { message: 'Please select a valid US state' }),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

export type PlayerFormData = z.infer<typeof playerFormSchema>;