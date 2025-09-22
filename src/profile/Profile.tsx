/**
 * @fileoverview Member Profile Page Component
 * Displays comprehensive member information including personal details, contact info, and membership status
 */
import React from 'react';
import { useUser } from '../context/useUser';
import { useUserProfile } from '../hooks/useUserProfile';
import { LoginCard } from '../login/LoginCard';
import { getMembershipStatus, formatDueDate, getDuesStatusStyling } from '../utils/membershipUtils';

/**
 * Member Profile Page Component
 *
 * This page displays:
 * - Personal information (name, nickname, contact details)
 * - Address information
 * - Account details and BCA member number
 * - Membership dues status with visual indicators
 *
 * Features:
 * - Color-coded dues status (green=paid, red=overdue, yellow=never paid)
 * - Status badges and expiration information
 * - Comprehensive member data display
 */
export const Profile: React.FC = () => {
  const { user } = useUser();
  const { member, loading } = useUserProfile();

  if (loading) {
    return <div>Loading your profile...</div>;
  }

  if (!member) {
    return <div>Error: No member record found</div>;
  }

  return (
    <LoginCard
      title="Member Profile"
      description="Your complete member information"
    >
      <div className="space-y-6">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Name:</strong> {member.first_name} {member.last_name}</p>
              {member.nickname && <p><strong>Nickname:</strong> {member.nickname}</p>}
              <p><strong>Date of Birth:</strong> {new Date(member.date_of_birth).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Email:</strong> {member.email}</p>
              <p><strong>Phone:</strong> {member.phone}</p>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Address</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div className="space-y-1">
            <p>{member.address}</p>
            <p>{member.city}, {member.state} {member.zip_code}</p>
          </div>
        </div>

        {/* Account Details Section */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Account Details</h3>
          <div className="space-y-2">
            {/* TODO: If we get access to BCA membership API, add verification functionality for these numbers */}
            <p><strong>BCA Member Number:</strong> {member.bca_member_number || 'Unknown'}</p>
            <p><strong>Role:</strong> {member.role}</p>
            <p><strong>Member Since:</strong> {new Date(member.created_at).toLocaleDateString()}</p>
            {member.membership_paid_date && (
              <p><strong>Membership Paid:</strong> {new Date(member.membership_paid_date).toLocaleDateString()}</p>
            )}
            <p><strong>Account Email:</strong> {user?.email}</p>
          </div>
        </div>

        {/* Membership Dues Status Section */}
        <div className={`p-4 border rounded-lg ${getDuesStatusStyling(member.membership_paid_date).bgColor} ${getDuesStatusStyling(member.membership_paid_date).borderColor}`}>
          <h3 className="font-semibold text-lg mb-3">Membership Dues Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className={`font-medium ${getDuesStatusStyling(member.membership_paid_date).textColor}`}>
                {getMembershipStatus(member.membership_paid_date).statusMessage}
              </p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getDuesStatusStyling(member.membership_paid_date).badgeColor}`}>
                {getMembershipStatus(member.membership_paid_date).status === 'current' ? 'PAID' :
                 getMembershipStatus(member.membership_paid_date).status === 'overdue' ? 'OVERDUE' : 'UNPAID'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {formatDueDate(member.membership_paid_date)}
            </p>
          </div>
        </div>
      </div>
    </LoginCard>
  );
};