/**
 * @fileoverview Supabase client configuration and initialization
 * Central configuration for all Supabase database and authentication operations
 */
import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase connection details from environment variables
// These should be set in .env file and are injected at build time by Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Configured Supabase client instance
 *
 * This client provides access to:
 * - Authentication (supabase.auth)
 * - Database operations (supabase.from())
 * - Real-time subscriptions
 * - Storage operations
 *
 * Import this instance throughout the app for all Supabase operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
