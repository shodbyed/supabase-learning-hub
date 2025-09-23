import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { useFetchPlayerById } from '../hooks/newHooks';
import { Player } from '../assets/typesFolder/newTypes';

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  player: Player | null | undefined;
  isLoggedIn: boolean;
  isLoading: boolean;
  isError: boolean;
  refetchPlayer: () => void;
};
type AuthProviderProps = {
  children: ReactNode;
};
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  player: null,
  isLoggedIn: false,
  isLoading: false,
  isError: false,
  refetchPlayer: () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const userId = (user && user.uid) || undefined;
  const {
    data: player,
    isLoading,
    isError,
    refetch: refetchPlayer,
  } = useFetchPlayerById(userId);

  useEffect(() => {
    if (player) setIsAdmin(player.isAdmin);
  }, [player]);

  const value = {
    user,
    isAdmin,
    player,
    isLoggedIn: !!user && user.emailVerified,
    isLoading,
    isError,
    refetchPlayer,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
