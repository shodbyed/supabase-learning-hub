/**
 * @fileoverview Venue-related type definitions
 * Centralized types for venue management and configuration
 */

/**
 * Venue information interface
 * Represents a billiard hall/bar where matches can be played
 */
export interface Venue {
  id: string;
  name: string;
  address: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  barBoxTables: number;
  bigTables?: number;
  notes?: string;
  createdAt: string;
  isActive: boolean;
}

/**
 * Venue form data interface
 * Used during venue creation wizard
 */
export interface VenueFormData {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  barBoxTables: number;
  bigTables?: number;
  notes?: string;
}
