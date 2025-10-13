/**
 * @fileoverview OperatorDashboard Component
 * Main dashboard for league operators with access to all operator-specific features
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '@/supabaseClient';
import { DashboardCard } from '@/components/operator/DashboardCard';
import { ActiveLeagues } from '@/components/operator/ActiveLeagues';
import { QuickStats } from '@/components/operator/QuickStats';

/**
 * OperatorDashboard Component
 *
 * Central hub for league operators that provides:
 * - Quick access to league management tools
 * - Overview of active leagues and upcoming events
 * - Statistics and performance metrics
 * - Links to create new leagues and manage existing ones
 *
 * This dashboard is only accessible to users with 'league_operator' role
 */
export const OperatorDashboard: React.FC = () => {
  const { member } = useUserProfile();
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [leagueCount, setLeagueCount] = useState(0);

  /**
   * Fetch operator ID and league count on mount
   */
  useEffect(() => {
    const fetchOperatorData = async () => {
      if (!member) return;

      // Get operator ID
      const { data: operatorData } = await supabase
        .from('league_operators')
        .select('id')
        .eq('member_id', member.id)
        .single();

      if (operatorData) {
        setOperatorId(operatorData.id);

        // Get league count
        const { count } = await supabase
          .from('leagues')
          .select('*', { count: 'exact', head: true })
          .eq('operator_id', operatorData.id);

        setLeagueCount(count || 0);
      }
    };

    fetchOperatorData();
  }, [member]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            League Operator Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {member?.first_name}! Manage your leagues and grow the pool community.
          </p>
        </div>

        {/* Main Grid - All content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Row 1 - Quick Actions */}
          <DashboardCard
            icon="💬"
            iconColor="text-purple-600"
            title="Messaging"
            description="Send messages and announcements"
            buttonText="Open Messages"
            onClick={() => console.log('Messaging - Coming soon')}
          />

          <DashboardCard
            icon="👥"
            iconColor="text-green-600"
            title="Manage Players"
            description="View registrations and player stats"
            buttonText="View Players"
            onClick={() => console.log('Manage Players - Coming soon')}
          />

          <DashboardCard
            icon="🏢"
            iconColor="text-orange-600"
            title="Venue Partners"
            description="Manage your pool hall relationships"
            buttonText="Manage Venues"
            onClick={() => console.log('Venue Partners - Coming soon')}
          />

          {/* Row 2 - Active Leagues (2 cols) and Sidebar (1 col) */}
          <div className="lg:col-span-2">
            <ActiveLeagues operatorId={operatorId} />
          </div>

          <div className="space-y-6">
            <DashboardCard
              icon="⚙️"
              iconColor="text-indigo-600"
              title="Organization Settings"
              description="Edit your contact info and address"
              buttonText="Manage Organization"
              linkTo="/operator-settings"
            />

            {/* Quick Stats */}
            <QuickStats activeLeagues={leagueCount} />

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="text-center py-6">
                <div className="text-3xl mb-2">📈</div>
                <p className="text-gray-600 text-sm">
                  Activity will appear here once you start managing leagues
                </p>
              </div>
            </div>

            {/* Help & Resources */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <Link to="#" className="block text-blue-700 hover:text-blue-900">
                  📚 Operator Handbook
                </Link>
                <Link to="#" className="block text-blue-700 hover:text-blue-900">
                  🎥 Video Tutorials
                </Link>
                <Link to="#" className="block text-blue-700 hover:text-blue-900">
                  💬 Community Forum
                </Link>
                <Link to="#" className="block text-blue-700 hover:text-blue-900">
                  📞 Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};