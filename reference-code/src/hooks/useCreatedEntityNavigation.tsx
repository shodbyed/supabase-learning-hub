import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';

export const useCreatedEntityNavigation = () => {
  const [createdPlayer, setCreatedPlayer] = useState(false);
  const { refetchPlayer, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const playerCreated = () => {
    refetchPlayer();
    setCreatedPlayer(true);
  };

  useEffect(() => {
    if (createdPlayer && !isLoading) {
      navigate('/welcome');
    }
  }, [createdPlayer, navigate, isLoading]);

  return {
    playerCreated,
  };
};
