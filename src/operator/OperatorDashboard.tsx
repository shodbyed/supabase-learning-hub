/**
 * @fileoverview OperatorDashboard Component
 * Main dashboard for league operators with access to all operator-specific features
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile, useOperatorIdValue, useLeagueCount } from '@/api/hooks';
import { DashboardCard } from '@/components/operator/DashboardCard';
import { ActiveLeagues } from '@/components/operator/ActiveLeagues';
import { QuickStats } from '@/components/operator/QuickStats';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Settings, TrendingUp, BookOpen, Video, MessageCircle, Phone, Flag } from 'lucide-react';
import { usePendingReportsCount } from '@/hooks/usePendingReportsCount';

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
 *
 * TODO: TanStack Query Caching Issue
 * When creating a new league, the ActiveLeagues component doesn't show the new league
 * until page refresh due to TanStack Query cache. Need to add refetchOnMount or
 * invalidate queries after league creation to show newly created leagues immediately.
 * This affects the league list display - stale cache shows old data.
 */
export const OperatorDashboard: React.FC = () => {
  const { member } = useUserProfile();
  const { count: pendingReportsCount } = usePendingReportsCount();

  // Fetch operator ID and league count using TanStack Query hooks
  const operatorId = useOperatorIdValue();
  const { data: leagueCount = 0 } = useLeagueCount(operatorId);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo="/dashboard"
        backLabel="Back to Player Dashboard"
        title="League Operator Dashboard"
        subtitle={`Welcome back, ${member?.first_name}! Manage your leagues and grow the pool community.`}
      />
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Main Grid - All content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Row 1 - Quick Actions */}
          <DashboardCard
            icon={<MessageSquare className="h-6 w-6" />}
            iconColor="text-purple-600"
            title="Messaging"
            description="Send messages and announcements"
            buttonText="Open Messages"
            linkTo="/messages"
          />

          <DashboardCard
            icon={<Users className="h-6 w-6" />}
            iconColor="text-green-600"
            title="Manage Players"
            description="View registrations and player stats"
            buttonText="View Players"
            onClick={() => console.log('Manage Players - Coming soon')}
          />

          <DashboardCard
            icon={<Flag className="h-6 w-6" />}
            iconColor="text-red-600"
            title="Reports Management"
            description="Review and manage user reports"
            buttonText="View Reports"
            linkTo="/operator-reports"
            badgeCount={pendingReportsCount}
          />

          {/* Row 2 - Active Leagues (2 cols) and Sidebar (1 col) */}
          <div className="lg:col-span-2">
            <ActiveLeagues operatorId={operatorId} />
          </div>

          <div className="space-y-6">
            <DashboardCard
              icon={<Settings className="h-6 w-6" />}
              iconColor="text-indigo-600"
              title="Organization Settings"
              description="Edit your contact info and address"
              buttonText="Manage Organization"
              linkTo="/operator-settings"
            />

            {/* Quick Stats */}
            <QuickStats activeLeagues={leagueCount} />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">
                    Activity will appear here once you start managing leagues
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help & Resources */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <Link to="#" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
                    <BookOpen className="h-4 w-4" />
                    Operator Handbook
                  </Link>
                  <Link to="#" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
                    <Video className="h-4 w-4" />
                    Video Tutorials
                  </Link>
                  <Link to="#" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
                    <MessageCircle className="h-4 w-4" />
                    Community Forum
                  </Link>
                  <Link to="#" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
                    <Phone className="h-4 w-4" />
                    Contact Support
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
