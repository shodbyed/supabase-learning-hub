/**
 * @fileoverview Zod schema for the short profile registration form
 *
 * This schema validates the minimal fields required for new user registration.
 * Users can complete their full profile later in settings.
 *
 * Required fields:
 * - firstName, lastName: Identity
 * - city, state: For fuzzy matching during PP merge detection
 *
 * Optional fields:
 * - nickname: Auto-generated if not provided
 */
import { z } from 'zod';
import { US_STATES } from '../constants/states';

/**
 * Schema for the short profile form used during initial registration.
 * Collects minimal required information to create a member record
 * while enabling PP fuzzy matching.
 */
export const shortProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .trim(),
  nickname: z
    .string()
    .max(12, 'Nickname must be 12 characters or less')
    .optional()
    .or(z.literal('')), // Allow empty string
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be 100 characters or less')
    .trim(),
  state: z.enum(US_STATES as [string, ...string[]], {
    message: 'Please select a valid US state',
  }),
});

/**
 * TypeScript type inferred from the short profile schema.
 * Use this for type-safe form handling.
 */
export type ShortProfileFormData = z.infer<typeof shortProfileSchema>;
