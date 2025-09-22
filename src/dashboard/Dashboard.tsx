import React from 'react';
import { useUser } from '../context/useUser';
import { useUserProfile } from '../hooks/useUserProfile';
import { LogoutButton } from '../login/LogoutButton';
import { LoginCard } from '../login/LoginCard';

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
      title={`Welcome, ${member.first_name}!`}
      description="Your member dashboard"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Member Info</h3>
            <p><strong>Name:</strong> {member.first_name} {member.last_name}</p>
            {member.nickname && <p><strong>Nickname:</strong> {member.nickname}</p>}
            <p><strong>Email:</strong> {member.email}</p>
            <p><strong>Phone:</strong> {member.phone}</p>
            <p><strong>Role:</strong> {member.role}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Address</h3>
            <p>{member.address}</p>
            <p>{member.city}, {member.state} {member.zip_code}</p>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Account Details</h3>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Member Since:</strong> {new Date(member.created_at).toLocaleDateString()}</p>
          {member.membership_paid_date && (
            <p><strong>Membership Paid:</strong> {new Date(member.membership_paid_date).toLocaleDateString()}</p>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-600">
            Logged in as: {user?.email}
          </p>
          <LogoutButton />
        </div>
      </div>
    </LoginCard>
  );
};