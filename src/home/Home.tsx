import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { useUserProfile } from '../hooks/useUserProfile';
import { LogoutButton } from '../login/LogoutButton';
import { Button } from '@/components/ui/button';

export const Home: React.FC = () => {
  const { isLoggedIn, user } = useUser();
  const { member, loading, needsToCompleteApplication } = useUserProfile();

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Supabase Learning Hub</h1>
        <p className="text-lg mb-6">Please log in to access your account and member features.</p>
        <Link to="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Supabase Learning Hub</h1>
        <p>Loading your account information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Supabase Learning Hub</h1>

      <div className="mb-6">
        <p className="text-lg mb-2">
          Hello <strong>{user?.email}</strong>!
        </p>

        {member ? (
          <p className="text-green-600 font-medium">
            Welcome back, {member.first_name}! You're all set up as a member.
          </p>
        ) : (
          <p className="text-orange-600 font-medium">
            You're logged in but haven't completed your member application yet.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {needsToCompleteApplication() ? (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">Complete Your Application</h3>
            <p className="text-orange-700 mb-3">
              To access member features, please complete your player application.
            </p>
            <Link to="/new-player">
              <Button>Complete Application</Button>
            </Link>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Access Your Dashboard</h3>
            <p className="text-green-700 mb-3">
              View your member information and access league features.
            </p>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="space-x-4">
            <Link to="/about">
              <Button variant="outline">About</Button>
            </Link>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};
