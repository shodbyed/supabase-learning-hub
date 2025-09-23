/**
 * @fileoverview User authentication context definition
 * Defines the shape of user authentication state shared across the application
 */
import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

/**
 * User context interface defining the authentication state and actions
 * This context provides user authentication status throughout the app
 */
export interface UserContextType {
  isLoggedIn: boolean; // Whether user is currently authenticated
  user: User | null; // Supabase user object or null if not logged in
  loading: boolean; // Whether we're still checking authentication status
  logout: () => void; // Function to log out the current user
}

/**
 * React context for user authentication state
 * Initialized as undefined to force usage within UserProvider
 */
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
