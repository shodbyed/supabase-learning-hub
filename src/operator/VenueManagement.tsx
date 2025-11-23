/**
 * @fileoverview Venue Management Page
 *
 * Allows operators to view and manage their venues.
 * Simple test page for venue creation functionality.
 */
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { VenueCreationModal } from '@/components/operator/VenueCreationModal';
import { VenueCard } from '@/components/operator/VenueCard';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useOperatorId, useVenuesByOperator } from '@/api/hooks';
import type { Venue } from '@/types/venue';

/**
 * VenueManagement Component
 *
 * Test page for venue CRUD operations.
 * Lists all venues for the operator with ability to add new ones.
 */
export const VenueManagement: React.FC = () => {
  const { data: operator, isLoading: operatorLoading } = useOperatorId();
  const operatorId = operator?.id;

  // Fetch venues using TanStack Query hook
  const { data: venues = [], isLoading: venuesLoading, refetch } = useVenuesByOperator(operatorId);

  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  /**
   * Handle successful venue creation or update
   */
  const handleVenueCreated = () => {
    // Refetch venues to get latest data from cache/server
    refetch();
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        backTo="/operator-dashboard"
        backLabel="Back to Dashboard"
        title="Manage Venues"
        subtitle="Add and manage venues where your leagues play"
      >
        <Button onClick={() => setShowModal(true)} className="mt-4">
          <Plus className="h-5 w-5 mr-2" />
          Add Venue
        </Button>
      </PageHeader>
      <div className="container mx-auto px-4 max-w-7xl py-8">

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

export default VenueManagement;
