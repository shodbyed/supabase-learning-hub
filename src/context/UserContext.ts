import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface UserContextType {
  isLoggedIn: boolean;
  user: User | null;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
