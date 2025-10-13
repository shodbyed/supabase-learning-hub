/**
 * @fileoverview League Rules Page
 *
 * Provides access to official BCA rules for 8-Ball, 9-Ball, and 10-Ball.
 * Future: Will include optional house rules management.
 */
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

/**
 * League Rules Component
 *
 * Displays links to official BCA rules and will allow operators
 * to configure optional house rules for their leagues
 */
export const LeagueRules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/operator-settings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organization Settings
          </button>
          <h1 className="text-3xl font-bold text-gray-900">League Rules</h1>
          <p className="text-gray-600 mt-2">Official BCA rules and optional house rules</p>
        </div>

        {/* Official BCA Rules Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Official BCA Rules</h2>
          <p className="text-gray-600 mb-6">
            Access the official Billiard Congress of America rules for each game type.
          </p>

          {/* TODO: These links currently go to bca-pool.com/page/rules which doesn't have the actual rules,
              just a link to another site where you have to download a PDF. Need to find direct PDF links
              or consider hosting the rules in-app for better user experience. */}
          <div className="space-y-4">
            {/* 8-Ball Rules */}
            <a
              href="https://bca-pool.com/page/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">8-Ball Rules</h3>
                <p className="text-sm text-gray-600">Official BCA 8-Ball regulations</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            {/* 9-Ball Rules */}
            <a
              href="https://bca-pool.com/page/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">9-Ball Rules</h3>
                <p className="text-sm text-gray-600">Official BCA 9-Ball regulations</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>

            {/* 10-Ball Rules */}
            <a
              href="https://bca-pool.com/page/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">10-Ball Rules</h3>
                <p className="text-sm text-gray-600">Official BCA 10-Ball regulations</p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Optional House Rules Section - Coming Soon */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Optional House Rules</h2>
          <p className="text-gray-600 mb-4">
            Configure optional rules for your leagues, such as:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Call pocket requirements</li>
            <li>Push-out allowances</li>
            <li>Coaching restrictions</li>
            <li>Time limits per shot</li>
            <li>Break requirements</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              🚧 House rules configuration coming soon. This feature will allow you to customize optional rules
              that apply to your leagues while maintaining BCA standard rules as the foundation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
