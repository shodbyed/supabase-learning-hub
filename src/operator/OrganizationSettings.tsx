/**
 * @fileoverview Organization Settings Page
 *
 * Overview page showing organization info and rules in card format.
 * Links to detailed edit pages for each section.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/api/hooks';
import { supabase } from '@/supabaseClient';
import { DashboardCard } from '@/components/operator/DashboardCard';
import { InfoButton } from '@/components/InfoButton';
import { PageHeader } from '@/components/PageHeader';
import { CalendarX, Shield } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import type { LeagueOperator } from '@/types/operator';
import { parseLocalDate } from '@/utils/formatters';
import { useOperatorProfanityToggle } from '@/hooks/useOperatorProfanityToggle';
import { useChampionshipPreferences } from '@/hooks/useChampionshipPreferences';

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

  // Inline edit state
  const [editingBca, setEditingBca] = useState(false);
  const [editingApa, setEditingApa] = useState(false);
  const [bcaStartDate, setBcaStartDate] = useState('');
  const [bcaEndDate, setBcaEndDate] = useState('');
  const [apaStartDate, setApaStartDate] = useState('');
  const [apaEndDate, setApaEndDate] = useState('');

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

  // Championship preferences now handled by useChampionshipPreferences hook above

  /**
   * Toggle ignore flag for BCA championship
   */
  const toggleBcaIgnore = async () => {
    if (!operatorProfile || !bcaPreference?.preference) return;

    const newAction = bcaPreference.preference.preference_action === 'ignore' ? 'blackout' : 'ignore';

    try {
      const { error } = await supabase
        .from('operator_blackout_preferences')
        .update({ preference_action: newAction })
        .eq('id', bcaPreference.preference.id);

      if (error) throw error;

      await refetchPreferences();
    } catch (err) {
      console.error('Failed to toggle BCA ignore:', err);
    }
  };

  /**
   * Toggle ignore flag for APA championship
   */
  const toggleApaIgnore = async () => {
    if (!operatorProfile || !apaPreference?.preference) return;

    const newAction = apaPreference.preference.preference_action === 'ignore' ? 'blackout' : 'ignore';

    try {
      const { error } = await supabase
        .from('operator_blackout_preferences')
        .update({ preference_action: newAction })
        .eq('id', apaPreference.preference.id);

      if (error) throw error;

      await refetchPreferences();
    } catch (err) {
      console.error('Failed to toggle APA ignore:', err);
    }
  };

  /**
   * Toggle profanity filter for organization
   * Now delegates to useOperatorProfanityToggle hook
   */
  const handleToggleProfanityFilter = toggleFilter;

  /**
   * Start editing BCA dates
   */
  const startEditingBca = () => {
    if (bcaPreference?.championship) {
      setBcaStartDate(bcaPreference.championship.start_date);
      setBcaEndDate(bcaPreference.championship.end_date);
    } else {
      setBcaStartDate('');
      setBcaEndDate('');
    }
    setEditingBca(true);
  };

  /**
   * Start editing APA dates
   */
  const startEditingApa = () => {
    if (apaPreference?.championship) {
      setApaStartDate(apaPreference.championship.start_date);
      setApaEndDate(apaPreference.championship.end_date);
    } else {
      setApaStartDate('');
      setApaEndDate('');
    }
    setEditingApa(true);
  };

  /**
   * Cancel editing BCA dates
   */
  const cancelEditingBca = () => {
    setEditingBca(false);
    setBcaStartDate('');
    setBcaEndDate('');
  };

  /**
   * Cancel editing APA dates
   */
  const cancelEditingApa = () => {
    setEditingApa(false);
    setApaStartDate('');
    setApaEndDate('');
  };

  /**
   * Save edited BCA dates
   */
  const saveBcaDates = async () => {
    if (!operatorProfile || !bcaStartDate || !bcaEndDate) {
      console.log('Save validation failed:', { operatorProfile: !!operatorProfile, bcaStartDate, bcaEndDate });
      return;
    }

    // Validate that end date is after start date
    const start = new Date(bcaStartDate);
    const end = new Date(bcaEndDate);

    if (end <= start) {
      alert('End date must be after start date');
      return;
    }

    console.log('Saving BCA dates:', { bcaStartDate, bcaEndDate, hasExisting: !!bcaPreference?.championship });

    try {
      if (bcaPreference?.championship) {
        // Update existing championship_date_options record
        const { error } = await supabase
          .from('championship_date_options')
          .update({
            start_date: bcaStartDate,
            end_date: bcaEndDate,
          })
          .eq('id', bcaPreference.championship.id);

        if (error) throw error;
      } else {
        // Create new championship_date_options record
        const currentYear = new Date().getFullYear();
        const { data: newChampionship, error: champError } = await supabase
          .from('championship_date_options')
          .insert({
            organization: 'BCA',
            year: currentYear,
            start_date: bcaStartDate,
            end_date: bcaEndDate,
            dev_verified: false,
          })
          .select()
          .single();

        if (champError) throw champError;

        // Create the preference record linking to this championship
        const { error: prefError } = await supabase
          .from('operator_blackout_preferences')
          .insert({
            operator_id: operatorProfile.id,
            preference_type: 'championship',
            preference_action: 'blackout',
            championship_id: newChampionship.id,
            auto_apply: false,
          });

        if (prefError) throw prefError;
      }

      console.log('✅ BCA dates saved successfully');
      await refetchPreferences();
      setEditingBca(false);
    } catch (err) {
      console.error('❌ Failed to save BCA dates:', err);
      alert('Failed to save BCA dates. Check console for details.');
    }
  };

  /**
   * Save edited APA dates
   */
  const saveApaDates = async () => {
    if (!operatorProfile || !apaStartDate || !apaEndDate) {
      console.log('Save validation failed:', { operatorProfile: !!operatorProfile, apaStartDate, apaEndDate });
      return;
    }

    // Validate that end date is after start date
    const start = new Date(apaStartDate);
    const end = new Date(apaEndDate);

    if (end <= start) {
      alert('End date must be after start date');
      return;
    }

    console.log('Saving APA dates:', { apaStartDate, apaEndDate, hasExisting: !!apaPreference?.championship });

    try {
      if (apaPreference?.championship) {
        // Update existing championship_date_options record
        const { error } = await supabase
          .from('championship_date_options')
          .update({
            start_date: apaStartDate,
            end_date: apaEndDate,
          })
          .eq('id', apaPreference.championship.id);

        if (error) throw error;
      } else {
        // Create new championship_date_options record
        const currentYear = new Date().getFullYear();
        const { data: newChampionship, error: champError } = await supabase
          .from('championship_date_options')
          .insert({
            organization: 'APA',
            year: currentYear,
            start_date: apaStartDate,
            end_date: apaEndDate,
            dev_verified: false,
          })
          .select()
          .single();

        if (champError) throw champError;

        // Create the preference record linking to this championship
        const { error: prefError } = await supabase
          .from('operator_blackout_preferences')
          .insert({
            operator_id: operatorProfile.id,
            preference_type: 'championship',
            preference_action: 'blackout',
            championship_id: newChampionship.id,
            auto_apply: false,
          });

        if (prefError) throw prefError;
      }

      console.log('✅ APA dates saved successfully');
      await refetchPreferences();
      setEditingApa(false);
    } catch (err) {
      console.error('❌ Failed to save APA dates:', err);
      alert('Failed to save APA dates. Check console for details.');
    }
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
                  {!editingBca ? (
                    <button
                      onClick={startEditingBca}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {bcaPreference?.championship ? 'Edit' : 'Add'}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={saveBcaDates}
                        size="sm"
                        className="text-xs h-7"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={cancelEditingBca}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                {editingBca ? (
                  <div className="space-y-2 mb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                        <Calendar
                          value={bcaStartDate}
                          onChange={setBcaStartDate}
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Date</label>
                        <Calendar
                          value={bcaEndDate}
                          onChange={setBcaEndDate}
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
                          onChange={toggleBcaIgnore}
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
                  {!editingApa ? (
                    <button
                      onClick={startEditingApa}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {apaPreference?.championship ? 'Edit' : 'Add'}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={saveApaDates}
                        size="sm"
                        className="text-xs h-7"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={cancelEditingApa}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                {editingApa ? (
                  <div className="space-y-2 mb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                        <Calendar
                          value={apaStartDate}
                          onChange={setApaStartDate}
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Date</label>
                        <Calendar
                          value={apaEndDate}
                          onChange={setApaEndDate}
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
                          onChange={toggleApaIgnore}
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
