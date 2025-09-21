import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';
import { UserContext } from './UserContext';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking session:', error.message);
      } else if (session) {
        setIsLoggedIn(true);
        setUser(session.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
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
    <UserContext.Provider value={{ isLoggedIn, user, logout }}>
      {children}
    </UserContext.Provider>
  );
};
