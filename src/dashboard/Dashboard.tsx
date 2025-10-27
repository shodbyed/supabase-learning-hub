/**
 * @fileoverview Dashboard Component
 * Mobile-first dashboard with navigation to player features
 */
import React from 'react';
import { useUser } from '../context/useUser';
import { useUserProfile } from '../hooks/useUserProfile';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Trophy, Settings } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { member, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error: No member record found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="text-4xl font-semibold text-gray-900">
            Welcome, {member.first_name}!
          </div>
          <p className="text-xs text-gray-600">{user?.email}</p>
        </div>
      </header>

      {/* Main Content - Mobile First */}
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Quick Action Cards */}
        <div className="space-y-4">
          {/* My Teams */}
          <Link to="/my-teams">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg text-gray-900">My Teams</h2>
                    <p className="text-sm text-gray-600">View leagues, teams, and schedules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Messages */}
          <Link to="/messages">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg text-gray-900">Messages</h2>
                    <p className="text-sm text-gray-600">Chat with teammates and league</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Tournaments (Coming Soon) */}
          <Card className="opacity-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-gray-400">Tournaments</h2>
                  <p className="text-sm text-gray-400">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* League Operator Section */}
        {(member.role === 'league_operator' || member.role === 'developer') && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">League Operator Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/operator-dashboard">
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  League Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Become League Operator CTA - Only for regular players */}
        {member.role === 'player' && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Run Your Own League?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Become a league operator and manage pool leagues at your local venue
              </p>
              <Link to="/become-league-operator">
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};