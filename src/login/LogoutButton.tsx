import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/useUser';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('User logged out successfully');
      navigate('/'); // Redirect to home page
    }
  };

  return (
    <button onClick={handleLogout} disabled={!isLoggedIn}>
      Logout
    </button>
  );
};
