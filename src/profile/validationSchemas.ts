/**
 * @fileoverview Profile Validation Schemas
 * Zod validation schemas for profile form sections
 */
import { z } from 'zod';
import { US_STATES } from '../constants/states';

/**
 * Validation schema for personal information
 */
export const personalInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required').trim(),
  last_name: z.string().min(1, 'Last name is required').trim(),
  nickname: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
});

/**
 * Validation schema for contact information
 */
export const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, 'Phone number must contain exactly 10 digits'),
});

/**
 * Validation schema for address information
 */
export const addressSchema = z.object({
  address: z.string().min(1, 'Address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.enum(US_STATES as [string, ...string[]], { message: 'Please select a valid US state' }),
  zip_code: z.string().min(5, 'Zip code must be at least 5 characters'),
});