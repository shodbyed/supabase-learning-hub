import React from 'react';
import { LoginCard } from '../login/LoginCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ApplicationRejected: React.FC = () => {
  return (
    <LoginCard
      title="Application Not Approved"
      description="Your player application was not approved at this time"
    >
      <div className="text-center space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">
            <strong>Status:</strong> Application Rejected
          </p>
          <p className="text-red-800 text-sm mt-1">
            Unfortunately, your application to join the league was not approved at this time.
          </p>
        </div>
        <p className="text-gray-600">
          If you believe this was an error or would like to discuss your application, please contact the league administrators.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="secondary" asChild>
            <Link to="/new-player">Reapply</Link>
          </Button>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </LoginCard>
  );
};