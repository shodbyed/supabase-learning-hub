/**
 * @fileoverview League Operator Landing Page
 * Informational page explaining benefits and requirements of becoming a league operator
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * League Operator Landing Page Component
 *
 * This page explains:
 * - Benefits of becoming a league operator
 * - Pricing model ($1 per team per week)
 * - Requirements and responsibilities
 * - Next steps to apply
 *
 * Features:
 * - Clear value proposition
 * - Pricing calculator example
 * - Call-to-action to start application
 */
export const BecomeLeagueOperator: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Become a League Operator
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Start running your own pool leagues and earn revenue
            </p>

            {/* Quick Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Link to="/league-operator-application">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Start Application
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="px-8">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Value Proposition */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Become a League Operator?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-4 text-lg">Benefits</h3>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Increase patronage to your pool venue
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Earn revenue from your leagues
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Professional league management tools
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Automated scheduling and scoring
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Player registration and tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Easy team and season management
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-4 text-lg">Perfect For</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• Pool hall owners</li>
                  <li>• Bar managers</li>
                  <li>• Experienced league players</li>
                  <li>• Community organizers</li>
                  <li>• Anyone passionate about pool</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing Model */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Simple, Fair Pricing
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 text-center">
                  <div className="text-sm text-blue-200 mb-1">only</div>
                  <div className="text-4xl font-bold mb-2">$1</div>
                  <div className="text-blue-100">per team, per week</div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Example: 12-Week Season</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span>6 teams × 12 weeks:</span>
                      <span className="font-semibold text-lg">$72</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span>8 teams × 12 weeks:</span>
                      <span className="font-semibold text-lg">$96</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>10 teams × 12 weeks:</span>
                      <span className="font-semibold text-lg">$120</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                    * Payment due by week 3-4 of each season
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What You'll Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Business Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Pool hall/bar details</li>
                  <li>• Business address and hours</li>
                  <li>• Number of available tables</li>
                  <li>• Contact information</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg">Payment Setup</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Valid credit card</li>
                  <li>• Billing address</li>
                  <li>• League operator agreement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Final Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Complete our simple application and start running your first league within days.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/league-operator-application">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                  Start Application
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-blue-600 px-8">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};