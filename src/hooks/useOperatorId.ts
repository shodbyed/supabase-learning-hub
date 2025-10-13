/**
 * @fileoverview Hook for fetching league operator ID
 *
 * Provides a reusable way to get the operator ID for the current authenticated user.
 * Used across operator dashboard pages that need to access operator-specific data.
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useUser } from '@/context/useUser';

interface UseOperatorIdResult {
  /** The operator's ID, or null if not loaded/not an operator */
  operatorId: string | null;
  /** True while fetching operator data */
  loading: boolean;
  /** Error message if fetch fails */
  error: string | null;
}

/**
 * Custom hook to fetch the operator ID for the current user
 *
 * This hook:
 * - Gets the authenticated user
 * - Looks up their member record
 * - Finds their league_operator record
 * - Returns the operator ID
 *
 * @returns {UseOperatorIdResult} Hook state with operatorId, loading, and error
 */
export const useOperatorId = (): UseOperatorIdResult => {
  const { user } = useUser();
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOperatorId(null);
      setLoading(false);
      return;
    }

    const fetchOperatorId = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get member ID from user
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (memberError) throw memberError;

        // Get operator ID from member
        const { data: operator, error: operatorError } = await supabase
          .from('league_operators')
          .select('id')
          .eq('member_id', member.id)
          .single();

        if (operatorError) throw operatorError;

        setOperatorId(operator.id);
      } catch (err) {
        console.error('Error fetching operator ID:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch operator ID');
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorId();
  }, [user]);

  return { operatorId, loading, error };
};
