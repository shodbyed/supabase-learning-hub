/**
 * @fileoverview useCurrentMember Hook
 *
 * Single responsibility: Get current user's member ID and name.
 * Reusable hook for fetching member data from auth user.
 */

import { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { supabase } from '@/supabaseClient';

export function useCurrentMember() {
  const userContext = useContext(UserContext);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMemberId() {
      if (!userContext?.user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('members')
        .select('id, user_id, first_name')
        .eq('user_id', userContext.user.id)
        .single();

      if (error) {
        console.error('Error fetching member ID:', error);
        setLoading(false);
        return;
      }

      setMemberId(data.id);
      setFirstName(data.first_name);
      setLoading(false);
    }

    getMemberId();
  }, [userContext?.user?.id]);

  return { memberId, firstName, loading };
}
