/**
 * @fileoverview Venue-related type definitions
 * Centralized types for venue management and configuration
 */

/**
 * Venue information interface
 * Represents a billiard hall/bar where matches can be played
 * Maps to the 'venues' table in the database
 */
export interface Venue {
  id: string;
  created_by_operator_id: string;
  venue_owner_id: string | null;

  // Required fields
  name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  bar_box_tables: number; // 7ft tables
  regulation_tables: number; // 9ft tables
  total_tables: number; // Computed: bar_box + regulation

  // Optional contact info
  proprietor_name: string | null;
  proprietor_phone: string | null;
  league_contact_name: string | null;
  league_contact_phone: string | null;
  league_contact_email: string | null;
  website: string | null;

  // Optional operational details
  business_hours: string | null;
  notes: string | null;

  // Status
  is_active: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Venue form data interface
 * Used during venue creation
 */
export interface VenueFormData {
  name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  bar_box_tables: number;
  regulation_tables: number;

  // Optional fields
  proprietor_name?: string;
  proprietor_phone?: string;
  league_contact_name?: string;
  league_contact_phone?: string;
  league_contact_email?: string;
  website?: string;
  business_hours?: string;
  notes?: string;
}

/**
 * League-Venue relationship
 * Maps to the 'league_venues' table in the database
 * Tracks which venues are available for a league and table limits
 */
export interface LeagueVenue {
  id: string;
  league_id: string;
  venue_id: string;

  // How many tables authorized for this league (may be less than venue total)
  available_bar_box_tables: number;
  available_regulation_tables: number;
  available_total_tables: number; // Computed

  // Metadata
  added_at: string;
  updated_at: string;
}

/**
 * Data for inserting league-venue relationship
 */
export interface LeagueVenueInsertData {
  league_id: string;
  venue_id: string;
  available_bar_box_tables: number;
  available_regulation_tables: number;
}

/**
 * Data for inserting new venue
 */
export interface VenueInsertData {
  created_by_operator_id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  bar_box_tables: number;
  regulation_tables: number;
  proprietor_name?: string | null;
  proprietor_phone?: string | null;
  league_contact_name?: string | null;
  league_contact_phone?: string | null;
  league_contact_email?: string | null;
  website?: string | null;
  business_hours?: string | null;
  notes?: string | null;
}
