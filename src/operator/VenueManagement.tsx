/**
 * @fileoverview Venue Management Page
 *
 * Allows operators to view and manage their venues.
 * Simple test page for venue creation functionality.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { ArrowLeft, Plus } from 'lucide-react';
import { VenueCreationModal } from '@/components/operator/VenueCreationModal';
import type { Venue } from '@/types/venue';

/**
 * VenueManagement Component
 *
 * Test page for venue CRUD operations.
 * Lists all venues for the operator with ability to add new ones.
 */
export const VenueManagement: React.FC = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [operatorId, setOperatorId] = useState<string | null>(null);

  /**
   * Fetch operator ID and venues on mount
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No user logged in');
          setLoading(false);
          return;
        }

        // Get operator ID from member
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (memberError) throw memberError;

        const { data: operator, error: operatorError } = await supabase
          .from('league_operators')
          .select('id')
          .eq('member_id', member.id)
          .single();

        if (operatorError) throw operatorError;

        setOperatorId(operator.id);

        // Fetch venues
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('*')
          .eq('created_by_operator_id', operator.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (venuesError) throw venuesError;

        setVenues(venuesData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Handle successful venue creation
   */
  const handleVenueCreated = (newVenue: Venue) => {
    setVenues(prev => [newVenue, ...prev]);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center text-gray-600">Loading venues...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/operator-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Venues</h1>
              <p className="text-gray-600 mt-1">
                Add and manage venues where your leagues play
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              Add Venue
            </button>
          </div>
        </div>

        {/* Venues List */}
        {venues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Venues Yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first venue to start organizing league play locations.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Venue
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {venue.name}
                </h3>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>{venue.street_address}</p>
                  <p>{venue.city}, {venue.state} {venue.zip_code}</p>
                  <p>{venue.phone}</p>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bar-Box Tables:</span>
                    <span className="font-semibold text-gray-900">{venue.bar_box_tables}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Regulation Tables:</span>
                    <span className="font-semibold text-gray-900">{venue.regulation_tables}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Total Tables:</span>
                    <span className="font-bold text-blue-600">{venue.total_tables}</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Capacity: ~{venue.total_tables} home teams
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Venue Creation Modal */}
        {showModal && operatorId && (
          <VenueCreationModal
            operatorId={operatorId}
            onSuccess={handleVenueCreated}
            onCancel={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};
