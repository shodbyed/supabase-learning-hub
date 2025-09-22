import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/useUser';

export type UserRole = 'player' | 'league_operator' | 'developer';

export interface Member {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  date_of_birth: string;
  role: UserRole;
  pool_hall_ids: number[];
  league_operator_ids: number[];
  membership_paid_date?: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useUser();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMember(null);
      setLoading(false);
      return;
    }

    const fetchMember = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Member doesn't exist - they need to fill out application
            console.log('No member record found for user');
            setMember(null);
          } else {
            console.error('Error fetching member:', error);
            setError(error.message);
          }
        } else {
          console.log('Member data found:', data);
          setMember(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [user]);

  const hasRole = (role: UserRole) => member?.role === role;

  const canAccessLeagueOperatorFeatures = () =>
    member?.role === 'league_operator' || member?.role === 'developer';

  const canAccessDeveloperFeatures = () =>
    member?.role === 'developer';

  const hasMemberRecord = () => member !== null;

  const needsToCompleteApplication = () => member === null;

  return {
    member,
    loading,
    error,
    hasRole,
    canAccessLeagueOperatorFeatures,
    canAccessDeveloperFeatures,
    hasMemberRecord,
    needsToCompleteApplication,
  };
};