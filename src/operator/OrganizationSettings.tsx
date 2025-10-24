/**
 * @fileoverview Organization Settings Page
 *
 * Overview page showing organization info and rules in card format.
 * Links to detailed edit pages for each section.
 *
 * Profanity Filter:
 * - Operators can enable organization-wide profanity validation
 * - When enabled, team names and public content containing profanity will be rejected
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/supabaseClient';
import { DashboardCard } from '@/components/operator/DashboardCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import type { LeagueOperator } from '@/types/operator';

/**
 * Organization Settings Component
 * Overview page with cards for org info and rules
 */
export const OrganizationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { member } = useUserProfile();

  // Operator profile state
  const [operatorProfile, setOperatorProfile] = useState<LeagueOperator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profanityFilterEnabled, setProfanityFilterEnabled] = useState(false);
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const [filterSuccess, setFilterSuccess] = useState(false);

  /**
   * Fetch operator profile on mount
   */
  useEffect(() => {
    const fetchOperatorProfile = async () => {
      if (!member) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('league_operators')
          .select('*')
          .eq('member_id', member.id)
          .single();

        if (error) throw error;

        setOperatorProfile(data);
        setProfanityFilterEnabled(data.profanity_filter_enabled || false);
      } catch (err) {
        console.error('Failed to fetch operator profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load operator profile');
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorProfile();
  }, [member]);

  /**
   * Toggle profanity filter for organization
   */
  const handleToggleProfanityFilter = async () => {
    if (!operatorProfile) return;

    setIsSavingFilter(true);
    setFilterSuccess(false);

    const newValue = !profanityFilterEnabled;

    const { error: updateError } = await supabase
      .from('league_operators')
      .update({ profanity_filter_enabled: newValue })
      .eq('id', operatorProfile.id);

    if (updateError) {
      console.error('Failed to update profanity filter:', updateError);
      alert('Failed to update profanity filter. Please try again.');
      setIsSavingFilter(false);
      return;
    }

    setProfanityFilterEnabled(newValue);
    setFilterSuccess(true);
    setIsSavingFilter(false);

    // Clear success message after 3 seconds
    setTimeout(() => setFilterSuccess(false), 3000);
  };

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/operator-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
          <p className="text-gray-600 mt-2">Manage your organization information and league rules</p>
        </div>

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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-indigo-600 text-2xl">⚙️</div>
              <h3 className="font-semibold text-gray-900">Organization Information</h3>
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Organization Name</p>
                <p className="text-gray-900 font-medium">{operatorProfile.organization_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mailing Address</p>
                <p className="text-gray-900">{operatorProfile.organization_address}</p>
                <p className="text-gray-900">{operatorProfile.organization_city}, {operatorProfile.organization_state} {operatorProfile.organization_zip_code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Email</p>
                <p className="text-gray-900">{operatorProfile.league_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Phone</p>
                <p className="text-gray-900">{operatorProfile.league_phone}</p>
              </div>
            </div>
            <button
              onClick={() => console.log('Edit org info - Coming soon')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Info
            </button>
          </div>

          {/* League Rules Card */}
          <DashboardCard
            icon="📋"
            iconColor="text-teal-600"
            title="League Rules"
            description="Access official BCA rules and manage optional house rules for your leagues"
            buttonText="View Rules"
            linkTo="/league-rules"
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
        </div>
      </div>
    </div>
  );
};
