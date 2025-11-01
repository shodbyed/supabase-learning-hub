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
import { VenueCard } from '@/components/operator/VenueCard';
import { Button } from '@/components/ui/button';
import { useOperatorId } from '@/api/hooks';
import type { Venue } from '@/types/venue';

/**
 * VenueManagement Component
 *
 * Test page for venue CRUD operations.
 * Lists all venues for the operator with ability to add new ones.
 */
export const VenueManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data: operator, isLoading: operatorLoading } = useOperatorId();
  const operatorId = operator?.id;
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  /**
   * Fetch venues when operator ID is available
   */
  useEffect(() => {
    if (!operatorId) return;

    const fetchVenues = async () => {
      setVenuesLoading(true);

      try {
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('*')
          .eq('created_by_operator_id', operatorId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (venuesError) throw venuesError;

        setVenues(venuesData || []);
      } catch (err) {
        console.error('Error fetching venues:', err);
      } finally {
        setVenuesLoading(false);
      }
    };

    fetchVenues();
  }, [operatorId]);

  /**
   * Handle successful venue creation or update
   */
  const handleVenueCreated = (venue: Venue) => {
    if (editingVenue) {
      // Update existing venue in list
      setVenues(prev => prev.map(v => v.id === venue.id ? venue : v));
    } else {
      // Add new venue to list
      setVenues(prev => [venue, ...prev]);
    }
    setShowModal(false);
    setEditingVenue(null);
  };

  /**
   * Open modal to edit existing venue
   */
  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setShowModal(true);
  };

  const loading = operatorLoading || venuesLoading;

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
          <Button
            variant="ghost"
            onClick={() => navigate('/operator-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Venues</h1>
              <p className="text-gray-600 mt-1">
                Add and manage venues where your leagues play
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Venue
            </Button>
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
            <Button onClick={() => setShowModal(true)}>
              Add First Venue
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onEdit={handleEditVenue}
              />
            ))}
          </div>
        )}

        {/* Venue Creation/Edit Modal */}
        {showModal && operatorId && (
          <VenueCreationModal
            operatorId={operatorId}
            onSuccess={handleVenueCreated}
            onCancel={() => {
              setShowModal(false);
              setEditingVenue(null);
            }}
            existingVenue={editingVenue}
          />
        )}
      </div>
    </div>
  );
};
