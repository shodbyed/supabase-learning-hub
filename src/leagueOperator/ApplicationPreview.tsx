/**
 * @fileoverview ApplicationPreview Component
 * Shows live preview of the league operator application being filled out
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { LeagueOperatorApplication as ApplicationData } from '../schemas/leagueOperatorSchema';
import { useUserProfile } from '../hooks/useUserProfile';
import { getVisibilityLabel } from './ContactInfoExposure';

interface ApplicationPreviewProps {
  applicationData: ApplicationData;
  isComplete?: boolean;
}

/**
 * ApplicationPreview Component
 *
 * Displays a live preview of the application form as it's being filled out
 * Shows all sections with current values or placeholder text
 */
export const ApplicationPreview: React.FC<ApplicationPreviewProps> = ({
  applicationData,
  isComplete = false
}) => {
  const { member } = useUserProfile();
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Application Preview</h3>

      <div className="space-y-4 text-sm">
        {/* Organization Information */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Organization Information</h4>
          {applicationData.leagueName || applicationData.useProfileAddress !== undefined || applicationData.useProfileEmail !== undefined ? (
            <div className="space-y-1">
              {applicationData.leagueName && (
                <div className="flex">
                  <span className="text-gray-500 w-32">Organization Name: </span>
                  <span className="text-gray-900 font-medium">{applicationData.leagueName}</span>
                </div>
              )}
              {applicationData.useProfileAddress && member && (
                <>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Organization Address: </span>
                    <span className="text-gray-900 font-medium">
                      {member.address}, {member.city}, {member.state} {member.zip_code}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32"></span>
                    <span className="text-xs text-gray-400">Address is only viewable by you (the league operator)</span>
                  </div>
                </>
              )}
              {applicationData.useProfileAddress === false && (
                <>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Organization Address: </span>
                    <span className="text-gray-900 font-medium">
                      {applicationData.organizationAddress ?
                        `${applicationData.organizationAddress}${applicationData.organizationCity ? `, ${applicationData.organizationCity}` : ''}${applicationData.organizationState ? `, ${applicationData.organizationState}` : ''}${applicationData.organizationZipCode ? ` ${applicationData.organizationZipCode}` : ''}` :
                        'Will enter custom address'
                      }
                    </span>
                  </div>
                  {applicationData.organizationAddress && (
                    <div className="flex">
                      <span className="text-gray-500 w-32"></span>
                      <span className="text-xs text-gray-400">Address is only viewable by you (the league operator)</span>
                    </div>
                  )}
                </>
              )}
              {applicationData.useProfileEmail !== undefined && (
                <>
                  {applicationData.useProfileEmail && member && (
                    <div className="flex">
                      <span className="text-gray-500 w-32">Contact Email: </span>
                      <span className="text-gray-900 font-medium">{member.email}</span>
                    </div>
                  )}
                  {applicationData.useProfileEmail === false && applicationData.leagueEmail && (
                    <div className="flex">
                      <span className="text-gray-500 w-32">Contact Email: </span>
                      <span className="text-gray-900 font-medium">{applicationData.leagueEmail}</span>
                    </div>
                  )}
                  {applicationData.useProfileEmail === false && !applicationData.leagueEmail && (
                    <div className="flex">
                      <span className="text-gray-500 w-32">Contact Email: </span>
                      <span className="text-gray-400">Custom email will be entered</span>
                    </div>
                  )}
                  {applicationData.emailVisibility && (
                    <div className="flex">
                      <span className="text-gray-500 w-32">Email Visibility: </span>
                      <span className="text-gray-700 text-xs">{getVisibilityLabel(applicationData.emailVisibility)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-400">No organization information added yet</div>
          )}
        </div>

        {/* Pool Venues */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Pool Venues</h4>
          {applicationData.venues.length > 0 ? (
            applicationData.venues.map((venue, index) => (
              <div key={venue.id} className="space-y-1 mb-3">
                <div className="flex">
                  <span className="text-gray-500 w-24">Venue {index + 1}: </span>
                  <span className="text-gray-900 font-medium">{venue.name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24">Address: </span>
                  <span className="text-gray-900">{venue.address}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24">Tables: </span>
                  <span className="text-gray-900">{venue.numberOfTables} pool tables</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400">No venues added yet</div>
          )}
        </div>

        {/* Contact Information */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
          {applicationData.contactName || applicationData.contactEmail || applicationData.contactPhone ? (
            <div className="space-y-1">
              {applicationData.contactName && (
                <div className="flex">
                  <span className="text-gray-500 w-24">Name: </span>
                  <span className="text-gray-900 font-medium">{applicationData.contactName}</span>
                </div>
              )}
              {applicationData.contactEmail && (
                <div className="flex">
                  <span className="text-gray-500 w-24">Email: </span>
                  <span className="text-gray-900 font-medium">{applicationData.contactEmail}</span>
                </div>
              )}
              {applicationData.contactPhone && (
                <div className="flex">
                  <span className="text-gray-500 w-24">Phone: </span>
                  <span className="text-gray-900 font-medium">{applicationData.contactPhone}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400">No contact information added yet</div>
          )}
        </div>
      </div>

      {/* Save & Exit - Only enabled when application is complete */}
      <div className="mt-6 pt-4 border-t">
        {isComplete ? (
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              Save & Exit
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="opacity-50 cursor-not-allowed"
            title="Complete the questionnaire to save and exit"
          >
            Save & Exit
          </Button>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {isComplete
            ? 'Application complete - you can now save and exit'
            : 'Complete all questions to save and exit'
          }
        </p>
      </div>
    </div>
  );
};