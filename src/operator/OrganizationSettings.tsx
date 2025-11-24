/**
 * @fileoverview Organization Settings Page
 *
 * Overview page showing organization info and rules in card format.
 * Links to detailed edit pages for each section.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile, useOperatorProfile } from '@/api/hooks';
import { DashboardCard } from '@/components/operator/DashboardCard';
import { InfoButton } from '@/components/InfoButton';
import { PageHeader } from '@/components/PageHeader';
import { CalendarX, Shield } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { parseLocalDate } from '@/utils/formatters';
import { useOperatorProfanityToggle } from '@/hooks/useOperatorProfanityToggle';
import { useChampionshipPreferences } from '@/hooks/useChampionshipPreferences';
import { useChampionshipDateEditor } from '@/hooks/useChampionshipDateEditor';
import { useChampionshipIgnoreToggle } from '@/hooks/useChampionshipIgnoreToggle';
import { OrganizationInfoCard } from '@/components/operator/OrganizationInfoCard';

/**
 * Organization Settings Component
 * Overview page with cards for org info and rules
 */
export const OrganizationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { member } = useUserProfile();

  // Operator profile (TanStack Query)
  const {
    data: operatorProfile,
    isLoading: loading,
    error: queryError,
    refetch: refetchOperatorProfile,
  } = useOperatorProfile(member?.id);

  // Profanity filter state (still need this for toggle component)
  const [profanityFilterEnabled, setProfanityFilterEnabled] = useState(false);

  // Sync profanity filter state when operator profile loads
  useEffect(() => {
    if (operatorProfile) {
      setProfanityFilterEnabled(operatorProfile.profanity_filter_enabled || false);
    }
  }, [operatorProfile]);

  // Profanity filter toggle hook
  const { toggleFilter, isSaving: isSavingFilter, success: filterSuccess } = useOperatorProfanityToggle(
    operatorProfile?.id || null,
    profanityFilterEnabled,
    setProfanityFilterEnabled
  );

  // Championship preferences hook
  const {
    bcaPreference,
    apaPreference,
    refetchPreferences,
  } = useChampionshipPreferences(operatorProfile?.id);

  // Championship date editor hooks (replaces all the duplicate edit state and functions)
  const bcaEditor = useChampionshipDateEditor('BCA', bcaPreference, operatorProfile?.id, refetchPreferences);
  const apaEditor = useChampionshipDateEditor('APA', apaPreference, operatorProfile?.id, refetchPreferences);

  // Convert query error to string
  const error = queryError ? (queryError as Error).message : null;

  // Operator profile now handled by useOperatorProfile TanStack Query hook above
  // Championship preferences handled by useChampionshipPreferences hook above
  // Championship ignore toggles handled by useChampionshipIgnoreToggle hook below

  const bcaIgnoreToggle = useChampionshipIgnoreToggle(
    bcaPreference?.preference?.id,
    bcaPreference?.preference?.preference_action,
    refetchPreferences
  );

  const apaIgnoreToggle = useChampionshipIgnoreToggle(
    apaPreference?.preference?.id,
    apaPreference?.preference?.preference_action,
    refetchPreferences
  );

  /**
   * Toggle profanity filter for organization
   * Now delegates to useOperatorProfanityToggle hook
   */
  const handleToggleProfanityFilter = toggleFilter;

  // All BCA/APA date editing logic now handled by useChampionshipDateEditor hooks above

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center text-gray-600">Loading organization settings...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !operatorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-red-600 text-lg font-semibold mb-4">Error</h3>
            <p className="text-gray-700 mb-4">
              {error || 'No operator profile found. Please complete the operator application first.'}
            </p>
            <button
              onClick={() => navigate('/operator-dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo="/operator-dashboard"
        backLabel="Back to Dashboard"
        title="Organization Settings"
        subtitle="Manage your organization information and league rules"
      />
      <div className="container mx-auto px-4 max-w-6xl py-8">

        {/* Success Message */}
        {filterSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              Profanity filter settings updated successfully!
            </p>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Organization Info Card */}
          <OrganizationInfoCard
            operatorProfile={operatorProfile}
            onUpdate={() => refetchOperatorProfile()}
          />

          {/* League Rules Card */}
          <DashboardCard
            icon="📋"
            iconColor="text-teal-600"
            title="League Rules"
            description="Access official BCA rules and manage optional house rules for your leagues"
            buttonText="View Rules"
            linkTo="/league-rules"
          />

          {/* Venue Management Card */}
          <DashboardCard
            icon="🏢"
            iconColor="text-blue-600"
            title="Venue Management"
            description="Add and manage venues where your leagues play"
            buttonText="Manage Venues"
            linkTo="/venues"
          />

          {/* Profanity Filter Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Content Moderation</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Control profanity validation for your organization. When enabled, team names and other public content containing inappropriate language will be rejected.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Profanity Filter</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {profanityFilterEnabled
                          ? 'Team names with inappropriate language will be rejected'
                          : 'Team names are not validated for profanity'}
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profanityFilterEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profanityFilterEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handleToggleProfanityFilter}
                      disabled={isSavingFilter}
                      variant={profanityFilterEnabled ? 'destructive' : 'default'}
                      size="sm"
                      className="ml-4"
                    >
                      {isSavingFilter ? 'Saving...' : profanityFilterEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </div>
              {profanityFilterEnabled && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> This setting validates team names and organization-wide content only. Individual messages are filtered based on each user's personal preferences.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Blackout Dates Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarX className="h-6 w-6 text-red-600" />
              <h3 className="font-semibold text-gray-900">Blackout Dates</h3>
            </div>
            <div className="space-y-3 mb-6">
              {/* BCA Preference */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">BCA Championship</span>
                  {!bcaEditor.isEditing ? (
                    <button
                      onClick={bcaEditor.startEditing}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {bcaPreference?.championship ? 'Edit' : 'Add'}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={bcaEditor.saveDates}
                        size="sm"
                        className="text-xs h-7"
                        disabled={bcaEditor.isSaving}
                      >
                        {bcaEditor.isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={bcaEditor.cancelEditing}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                {bcaEditor.isEditing ? (
                  <div className="space-y-2 mb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                        <Calendar
                          value={bcaEditor.startDate}
                          onChange={bcaEditor.setStartDate}
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Date</label>
                        <Calendar
                          value={bcaEditor.endDate}
                          onChange={bcaEditor.setEndDate}
                          placeholder="Select end date"
                        />
                      </div>
                    </div>
                  </div>
                ) : bcaPreference && bcaPreference.championship ? (
                  <>
                    <div className="text-sm text-gray-900 mb-2">
                      {parseLocalDate(bcaPreference.championship.start_date).toLocaleDateString()} - {parseLocalDate(bcaPreference.championship.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={bcaPreference.preference?.preference_action === 'ignore'}
                          onChange={bcaIgnoreToggle.toggleIgnore}
                          disabled={bcaIgnoreToggle.isToggling}
                          className="rounded"
                        />
                        Ignore these dates
                      </label>
                      <InfoButton title="Championship Dates">
                        National tournament dates are normally flagged as potential schedule conflicts since many players travel to play or attend. If you don't expect enough of your players to be affected to justify rescheduling, these dates can safely be ignored.
                      </InfoButton>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not set</span>
                )}
              </div>

              {/* APA Preference */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">APA Championship</span>
                  {!apaEditor.isEditing ? (
                    <button
                      onClick={apaEditor.startEditing}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {apaPreference?.championship ? 'Edit' : 'Add'}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={apaEditor.saveDates}
                        size="sm"
                        className="text-xs h-7"
                        disabled={apaEditor.isSaving}
                      >
                        {apaEditor.isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={apaEditor.cancelEditing}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                {apaEditor.isEditing ? (
                  <div className="space-y-2 mb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                        <Calendar
                          value={apaEditor.startDate}
                          onChange={apaEditor.setStartDate}
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Date</label>
                        <Calendar
                          value={apaEditor.endDate}
                          onChange={apaEditor.setEndDate}
                          placeholder="Select end date"
                        />
                      </div>
                    </div>
                  </div>
                ) : apaPreference && apaPreference.championship ? (
                  <>
                    <div className="text-sm text-gray-900 mb-2">
                      {parseLocalDate(apaPreference.championship.start_date).toLocaleDateString()} - {parseLocalDate(apaPreference.championship.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={apaPreference.preference?.preference_action === 'ignore'}
                          onChange={apaIgnoreToggle.toggleIgnore}
                          disabled={apaIgnoreToggle.isToggling}
                          className="rounded"
                        />
                        Ignore these dates
                      </label>
                      <InfoButton title="Championship Dates">
                        National tournament dates are normally flagged as potential schedule conflicts since many players travel to play or attend. If you don't expect enough of your players to be affected to justify rescheduling, these dates can safely be ignored.
                      </InfoButton>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not set</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;
