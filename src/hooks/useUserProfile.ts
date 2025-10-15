/**
 * @fileoverview User profile management hook for fetching and managing member data from Supabase
 * This hook handles the relationship between authenticated users and their member records
 */
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/useUser';
import type { Member, UserRole } from '@/types';

/**
 * Custom hook for managing user profile and member data
 *
 * This hook:
 * - Fetches member record from Supabase based on authenticated user
 * - Provides utility functions for role checking and permissions
 * - Handles loading states and error management
 * - Determines if user needs to complete application
 *
 * @returns {object} Hook state and utility functions
 * @returns {Member | null} member - The user's member record or null if not found
 * @returns {boolean} loading - True while fetching member data
 * @returns {string | null} error - Error message if fetch fails
 * @returns {function} refreshProfile - Manually refresh member data from database
 * @returns {function} hasRole - Check if user has specific role
 * @returns {function} canAccessLeagueOperatorFeatures - Check league operator permissions
 * @returns {function} canAccessDeveloperFeatures - Check developer permissions
 * @returns {function} hasMemberRecord - Check if user has completed application
 * @returns {function} needsToCompleteApplication - Check if user needs to apply
 */
export const useUserProfile = () => {
  const { user } = useUser();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Fetch member record from database based on authenticated user ID
   * This establishes the connection between auth user and application data
   */
  const fetchMember = async () => {
    if (!user) {
      setMember(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Query the members table for a record matching the authenticated user
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .single(); // Expect exactly one record

      if (error) {
        // PGRST116 = no rows returned, meaning user hasn't completed application
        if (error.code === 'PGRST116') {
          setMember(null); // User needs to complete member application
        } else {
          // Other database errors (network, permissions, etc.)
          console.error('Error fetching member:', error);
          setError(error.message);
        }
      } else {
        // Successfully found member record
        setMember(data);
      }
    } catch (err) {
      // Handle unexpected errors (network issues, etc.)
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [user, refreshTrigger]); // Re-run when user authentication status changes OR refreshTrigger changes

  /**
   * Manually refresh the member profile from the database
   * Useful after creating/updating member records
   */
  const refreshProfile = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Utility functions for role and permission checking

  /** Check if user has a specific role */
  const hasRole = (role: UserRole) => member?.role === role;

  /** Check if user can access league operator features (league_operator or developer) */
  const canAccessLeagueOperatorFeatures = () =>
    member?.role === 'league_operator' || member?.role === 'developer';

  /** Check if user can access developer features (developer only) */
  const canAccessDeveloperFeatures = () =>
    member?.role === 'developer';

  /** Check if user has completed their member application */
  const hasMemberRecord = () => member !== null;

  /** Check if user needs to complete their member application */
  const needsToCompleteApplication = () => member === null;

  return {
    member,
    loading,
    error,
    refreshProfile,
    hasRole,
    canAccessLeagueOperatorFeatures,
    canAccessDeveloperFeatures,
    hasMemberRecord,
    needsToCompleteApplication,
  };
};