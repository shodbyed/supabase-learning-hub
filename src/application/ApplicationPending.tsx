import React from 'react';
import { LoginCard } from '../login/LoginCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ApplicationPending: React.FC = () => {
  return (
    <LoginCard
      title="Application Under Review"
      description="Your player application is currently being reviewed"
    >
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          Thank you for submitting your player application. We are currently reviewing your information and will notify you once a decision has been made.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Status:</strong> Pending Review
          </p>
          <p className="text-yellow-800 text-sm mt-1">
            You will receive an email notification when your application status changes.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </LoginCard>
  );
};