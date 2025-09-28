/**
 * @fileoverview OperatorDashboard Component
 * Main dashboard for league operators with access to all operator-specific features
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '../hooks/useUserProfile';

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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-blue-600 text-2xl mb-3">🏆</div>
            <h3 className="font-semibold text-gray-900 mb-2">Create New League</h3>
            <p className="text-sm text-gray-600 mb-4">Set up a new tournament or league</p>
            <Button asChild className="w-full" style={{ backgroundColor: '#2563eb', color: 'white' }}>
              <Link to="/create-league">Create League</Link>
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-green-600 text-2xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-900 mb-2">Manage Players</h3>
            <p className="text-sm text-gray-600 mb-4">View registrations and player stats</p>
            <Button variant="outline" className="w-full">
              View Players
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-purple-600 text-2xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">League Results</h3>
            <p className="text-sm text-gray-600 mb-4">Record matches and view standings</p>
            <Button variant="outline" className="w-full">
              View Results
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-orange-600 text-2xl mb-3">🏢</div>
            <h3 className="font-semibold text-gray-900 mb-2">Venue Partners</h3>
            <p className="text-sm text-gray-600 mb-4">Manage your pool hall relationships</p>
            <Button variant="outline" className="w-full">
              Manage Venues
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Leagues */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Active Leagues</h3>

              {/* Placeholder for when no leagues exist yet */}
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎱</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Leagues</h4>
                <p className="text-gray-600 mb-6">
                  You haven't created any leagues yet. Start by creating your first league!
                </p>
                <Button asChild style={{ backgroundColor: '#2563eb', color: 'white' }}>
                  <Link to="/create-league">Create Your First League</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Leagues</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Players</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matches Played</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partner Venues</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>

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