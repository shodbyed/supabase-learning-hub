/**
 * @fileoverview Organization Settings Page
 *
 * Overview page showing organization info and rules in card format.
 * Links to detailed edit pages for each section.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/supabaseClient';
import { DashboardCard } from '@/components/operator/DashboardCard';
import { ArrowLeft } from 'lucide-react';
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
      } catch (err) {
        console.error('Failed to fetch operator profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load operator profile');
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorProfile();
  }, [member]);

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
        </div>
      </div>
    </div>
  );
};
