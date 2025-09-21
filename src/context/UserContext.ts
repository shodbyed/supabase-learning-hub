import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface UserContextType {
  isLoggedIn: boolean;
  user: User | null;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
