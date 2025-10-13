/**
 * @fileoverview Format Comparison Page
 * Side-by-side comparison of 5-Man and 8-Man team formats
 * Helps operators make informed decisions about which format to choose
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const FormatComparison: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Sticky Back Button */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          variant="default"
          onClick={() => navigate(-1)}
          size="lg"
          className="shadow-lg"
        >
          ← Back
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            5-Man vs 8-Man Format Comparison
          </h1>
          <p className="text-xl text-gray-600">
            Compare the key differences to choose the right format for your league
          </p>
        </div>

        {/* Comparison Table */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 pr-4">Feature</th>
                  <th className="text-left py-3 px-4 bg-green-50">5-Man Format</th>
                  <th className="text-left py-3 pl-4 bg-gray-50">8-Man Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 pr-4 font-medium">Roster Size</td>
                  <td className="py-3 px-4 bg-green-50">5 players</td>
                  <td className="py-3 pl-4 bg-gray-50">8+ players</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Players Per Night</td>
                  <td className="py-3 px-4 bg-green-50">3 vs 3 (6 total)</td>
                  <td className="py-3 pl-4 bg-gray-50">5 vs 5 (10 total)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Games Per Player</td>
                  <td className="py-3 px-4 bg-green-50">6 games</td>
                  <td className="py-3 pl-4 bg-gray-50">5 games</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Total Games</td>
                  <td className="py-3 px-4 bg-green-50">18 games</td>
                  <td className="py-3 pl-4 bg-gray-50">25 games</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Match Format</td>
                  <td className="py-3 px-4 bg-green-50">Double round robin</td>
                  <td className="py-3 pl-4 bg-gray-50">Single round robin</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Match Duration</td>
                  <td className="py-3 px-4 bg-green-50">2-2.5 hours</td>
                  <td className="py-3 pl-4 bg-gray-50">3-4 hours</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Crowding (Full Rosters)</td>
                  <td className="py-3 px-4 bg-green-50">6-10 people around tables</td>
                  <td className="py-3 pl-4 bg-gray-50">10-16 people around tables</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Handicap System</td>
                  <td className="py-3 px-4 bg-green-50">Dynamic, auto-adjusting</td>
                  <td className="py-3 pl-4 bg-gray-50">BCA standard tables</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Handicap Complaints</td>
                  <td className="py-3 px-4 bg-green-50">Minimal</td>
                  <td className="py-3 pl-4 bg-gray-50">Common</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Team Building Difficulty</td>
                  <td className="py-3 px-4 bg-green-50">Easier (5 players)</td>
                  <td className="py-3 pl-4 bg-gray-50">Harder (8+ players)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="text-xl font-bold text-green-900 mb-3">5-Man Format</h3>
            <p className="text-sm text-green-800 mb-3">Best for:</p>
            <ul className="list-disc ml-5 text-sm text-green-800 space-y-1">
              <li>Modern leagues prioritizing player experience</li>
              <li>Venues wanting faster turnaround</li>
              <li>Operators wanting fewer handicap disputes</li>
              <li>Leagues with smaller player pools</li>
              <li>Players with time constraints</li>
            </ul>
          </Card>

          <Card className="p-6 bg-gray-50 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">8-Man Format</h3>
            <p className="text-sm text-gray-700 mb-3">Best for:</p>
            <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
              <li>Established leagues with BCA tradition</li>
              <li>Large player pools</li>
              <li>Players familiar with BCA standard</li>
              <li>Venues comfortable with longer matches</li>
              <li>Traditional league environments</li>
            </ul>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Button
            variant="default"
            onClick={() => navigate('/5-man-format-details')}
            size="lg"
          >
            View 5-Man Format Details
          </Button>
          <Button
            variant="default"
            onClick={() => navigate('/8-man-format-details')}
            size="lg"
          >
            View 8-Man Format Details
          </Button>
        </div>
      </div>
    </div>
  );
};
