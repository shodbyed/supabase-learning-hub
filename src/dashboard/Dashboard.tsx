/**
 * @fileoverview Dashboard Component
 * A simple welcome dashboard with navigation to other features
 */
import React from 'react';
import { useUser } from '../context/useUser';
import { useUserProfile } from '../hooks/useUserProfile';
import { LogoutButton } from '../login/LogoutButton';
import { LoginCard } from '../login/LoginCard';
import { Button } from '@/components/ui/button';

export const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { member, loading } = useUserProfile();

  if (loading) {
    return <div>Loading your dashboard...</div>;
  }

  if (!member) {
    return <div>Error: No member record found</div>;
  }

  return (
    <LoginCard
      title={`Hi, ${member.first_name}!`}
      description="Welcome to your BCA member dashboard"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="w-full h-20 flex flex-col" disabled>
            <span className="font-semibold">Leagues</span>
            <span className="text-sm text-gray-600">Coming soon</span>
          </Button>

          <Button variant="outline" className="w-full h-20 flex flex-col" disabled>
            <span className="font-semibold">Tournaments</span>
            <span className="text-sm text-gray-600">Coming soon</span>
          </Button>
        </div>

        {/* Account Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            Logged in as: {user?.email}
          </p>
          <LogoutButton />
        </div>
      </div>
    </LoginCard>
  );
};