import React from 'react';
import { LoginCard } from '../login/LoginCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Unauthorized: React.FC = () => {
  return (
    <LoginCard
      title="Access Denied"
      description="You don't have permission to access this page"
    >
      <div className="text-center space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
          <p className="text-orange-800 text-sm">
            <strong>Insufficient Permissions</strong>
          </p>
          <p className="text-orange-800 text-sm mt-1">
            You don't have the required permissions to access this page.
          </p>
        </div>
        <p className="text-gray-600">
          If you believe you should have access to this page, please contact an administrator.
        </p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </LoginCard>
  );
};