import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';
import { UserContext } from './UserContext';
import { logger } from '@/utils/logger';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading state

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          logger.error('Error checking session', { error: error.message });
        } else if (session) {
          setIsLoggedIn(true);
          setUser(session.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        logger.error('Error in checkUserSession', { error: error instanceof Error ? error.message : String(error) });
      } finally {
        setLoading(false); // Always stop loading after check
      }
    };

    checkUserSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (session) {
          setIsLoggedIn(true);
          setUser(session.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, user, loading, logout, setUser, setIsLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};
