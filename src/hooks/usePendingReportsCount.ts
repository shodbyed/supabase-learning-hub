/**
 * @fileoverview usePendingReportsCount Hook
 *
 * React hook that fetches the count of pending reports for league operators.
 * Updates in real-time and can be used for notification badges.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';

/**
 * Hook to get count of pending reports for current operator
 *
 * @returns Count of reports with status 'pending' or 'under_review'
 */
export function usePendingReportsCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCount();

    // Set up real-time subscription for changes
    const subscription = supabase
      .channel('pending_reports_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_reports'
        },
        () => {
          // Refetch count when any report changes
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCount = async () => {
    const { count: reportCount, error } = await supabase
      .from('user_reports')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'under_review']);

    if (!error && reportCount !== null) {
      setCount(reportCount);
    }
    setLoading(false);
  };

  return { count, loading };
}
