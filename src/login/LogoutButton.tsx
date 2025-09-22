import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/useUser';
import { Button } from '@/components/ui/button';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      navigate('/'); // Redirect to home page
    }
  };

  return (
    <Button onClick={handleLogout} disabled={!isLoggedIn} variant="outline">
      Logout
    </Button>
  );
};
