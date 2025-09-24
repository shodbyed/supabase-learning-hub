/**
 * @fileoverview League Operator Application Schema
 * Zod validation schemas for the league operator application form
 */
import { z } from 'zod';
import { US_STATES } from '../constants/states';

/**
 * Contact visibility levels for league operator contact information
 */
export const contactVisibilityLevels = [
  'in_app_only',
  'my_organization',
  'my_team_captains',
  'my_teams',
  'anyone'
] as const;

export type ContactVisibilityLevel = typeof contactVisibilityLevels[number];

export const venueSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Venue name is required').trim(),
  address: z.string().min(1, 'Address is required').trim(),
  numberOfTables: z.number().min(1, 'Must have at least 1 table').max(50, 'Maximum 50 tables'),
  businessHours: z.string().optional(),
});

export const leagueOperatorApplicationSchema = z.object({
  leagueName: z.string().min(1, 'League name is required').trim(),
  useProfileAddress: z.boolean().optional(),
  organizationAddress: z.string().optional(),
  organizationCity: z.string().optional(),
  organizationState: z.string().optional(),
  organizationZipCode: z.string().optional(),
  contactDisclaimerAcknowledged: z.boolean().optional(),
  useProfileEmail: z.boolean().optional(),
  leagueEmail: z.string().optional(),
  emailVisibility: z.enum(contactVisibilityLevels).optional(),
  venues: z.array(venueSchema).min(1, 'At least one venue is required'),
  contactName: z.string().min(1, 'Contact name is required').trim(),
  contactEmail: z.string().email('Valid email is required').trim(),
  contactPhone: z.string().min(10, 'Valid phone number is required').trim(),
});

export type Venue = z.infer<typeof venueSchema>;
export type LeagueOperatorApplication = z.infer<typeof leagueOperatorApplicationSchema>;

// Individual field validation schemas for step-by-step validation
export const leagueNameSchema = z.string().min(1, 'League name is required').trim();
export const useProfileAddressSchema = z.string().refine((val) => val === 'yes' || val === 'no', {
  message: 'Please select yes or no'
});
export const organizationAddressSchema = z.string().min(1, 'Address is required').trim();
export const organizationCitySchema = z.string().min(1, 'City is required').trim();
export const organizationStateSchema = z.enum(US_STATES as [string, ...string[]], { message: 'Please select a valid US state' });
export const organizationZipSchema = z.string()
  .min(5, 'ZIP code must be at least 5 digits')
  .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)');
export const venueNameSchema = z.string().min(1, 'Venue name is required').trim();
export const venueAddressSchema = z.string().min(1, 'Address is required').trim();
export const venueTablesSchema = z.string().min(1, 'Number of tables is required').transform((val) => {
  const num = parseInt(val);
  if (isNaN(num) || num < 1) throw new Error('Must be at least 1 table');
  if (num > 50) throw new Error('Maximum 50 tables');
  return num;
});
export const useProfileEmailSchema = z.string().refine((val) => val === 'profile' || val === 'new', {
  message: 'Please select an email option'
});
export const leagueEmailSchema = z.string().email('Valid email is required').trim();
export const emailVisibilitySchema = z.enum(contactVisibilityLevels, {
  message: 'Please select who can see your email'
});
export const contactNameSchema = z.string().min(1, 'Contact name is required').trim();
export const contactEmailSchema = z.string().email('Valid email is required').trim();
export const contactPhoneSchema = z.string().min(10, 'Valid phone number is required').trim();