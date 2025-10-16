/**
 * @fileoverview Dashboard Component
 * A simple welcome dashboard with navigation to other features
 */
import React from 'react';
import { useUser } from '../context/useUser';
import { useUserProfile } from '../hooks/useUserProfile';
import { LogoutButton } from '../login/LogoutButton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BCA Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {member.first_name}!</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Dashboard Content */}
        <div className="space-y-8">
          {/* Quick Stats/Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Your Pool Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link to="/messages" className="w-full">
                <Button variant="outline" className="w-full h-32 flex flex-col justify-center border-2 hover:border-blue-500 hover:bg-blue-50">
                  <span className="font-semibold text-xl mb-2">Messages</span>
                  <span className="text-sm text-gray-600">View your messages</span>
                </Button>
              </Link>

              <Button variant="outline" className="w-full h-32 flex flex-col justify-center border-2 hover:border-blue-300" disabled>
                <span className="font-semibold text-xl mb-2">Leagues</span>
                <span className="text-sm text-gray-600">Coming soon</span>
              </Button>

              <Button variant="outline" className="w-full h-32 flex flex-col justify-center border-2 hover:border-blue-300" disabled>
                <span className="font-semibold text-xl mb-2">Tournaments</span>
                <span className="text-sm text-gray-600">Coming soon</span>
              </Button>
            </div>
          </div>

          {/* League Operator Dashboard - Show to league operators */}
          {(member.role === 'league_operator' || member.role === 'developer') && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  League Operator Tools
                </h3>
                <div className="flex justify-center">
                  <Link to="/operator-dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white h-32 w-64 text-xl">
                      League Admin Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* League Operator Invitation - Only show to regular players */}
          {member.role === 'player' && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Interested in running your own pool league?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Become a league operator and run a league at your local bar or pool hall
                  </p>
                </div>
                <div className="ml-6">
                  <Link to="/become-league-operator">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Logged in as: {user?.email}
            </p>
            <p className="text-sm text-gray-500">
              BCA Member Dashboard
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};