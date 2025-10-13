/**
 * @fileoverview Venue Limit Modal
 *
 * Modal for adjusting the number of tables available for a specific venue
 * within a league. Allows operators to set how many bar-box and regulation
 * tables are actually available for league play (may be less than venue total).
 */
import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Venue, LeagueVenue } from '@/types/venue';

interface VenueLimitModalProps {
  /** The venue being configured */
  venue: Venue;
  /** The league_venue record with current limits */
  leagueVenue: LeagueVenue;
  /** Called when limits are successfully updated */
  onSuccess: (updatedLeagueVenue: LeagueVenue) => void;
  /** Called when user cancels or closes modal */
  onCancel: () => void;
}

/**
 * VenueLimitModal Component
 *
 * Allows operators to set table availability limits for a venue within a league.
 * Uses increment/decrement buttons for easy adjustment.
 */
export const VenueLimitModal: React.FC<VenueLimitModalProps> = ({
  venue,
  leagueVenue,
  onSuccess,
  onCancel
}) => {
  const [barBoxTables, setBarBoxTables] = useState(leagueVenue.available_bar_box_tables);
  const [regulationTables, setRegulationTables] = useState(leagueVenue.available_regulation_tables);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Increment/decrement bar-box table count
   */
  const adjustBarBoxTables = (delta: number) => {
    const newValue = barBoxTables + delta;
    if (newValue >= 0 && newValue <= venue.bar_box_tables) {
      setBarBoxTables(newValue);
      setError(null);
    }
  };

  /**
   * Increment/decrement regulation table count
   */
  const adjustRegulationTables = (delta: number) => {
    const newValue = regulationTables + delta;
    if (newValue >= 0 && newValue <= venue.regulation_tables) {
      setRegulationTables(newValue);
      setError(null);
    }
  };

  /**
   * Validate table limits
   */
  const validate = (): string | null => {
    const totalTables = barBoxTables + regulationTables;
    if (totalTables === 0) {
      return 'At least one table must be available';
    }
    if (barBoxTables > venue.bar_box_tables) {
      return `Bar-box tables cannot exceed ${venue.bar_box_tables}`;
    }
    if (regulationTables > venue.regulation_tables) {
      return `Regulation tables cannot exceed ${venue.regulation_tables}`;
    }
    return null;
  };

  /**
   * Save updated limits to database
   */
  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: updatedLeagueVenue, error: updateError } = await supabase
        .from('league_venues')
        .update({
          available_bar_box_tables: barBoxTables,
          available_regulation_tables: regulationTables
        })
        .eq('id', leagueVenue.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ Venue limits updated:', updatedLeagueVenue);
      onSuccess(updatedLeagueVenue);
    } catch (err) {
      console.error('❌ Error updating venue limits:', err);
      setError(err instanceof Error ? err.message : 'Failed to update limits');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle escape key to close modal
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const totalTables = barBoxTables + regulationTables;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Table Limits</h2>
            <p className="text-sm text-gray-600 mt-1">{venue.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Bar-Box Tables */}
          <div>
            <Label className="mb-2 block">
              Bar-Box Tables
              <span className="text-gray-500 font-normal ml-2">
                (max: {venue.bar_box_tables})
              </span>
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => adjustBarBoxTables(-1)}
                disabled={barBoxTables === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-semibold text-gray-900">
                  {barBoxTables}
                </span>
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => adjustBarBoxTables(1)}
                disabled={barBoxTables === venue.bar_box_tables}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Regulation Tables */}
          <div>
            <Label className="mb-2 block">
              Regulation Tables
              <span className="text-gray-500 font-normal ml-2">
                (max: {venue.regulation_tables})
              </span>
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => adjustRegulationTables(-1)}
                disabled={regulationTables === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-semibold text-gray-900">
                  {regulationTables}
                </span>
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => adjustRegulationTables(1)}
                disabled={regulationTables === venue.regulation_tables}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">Total Available:</span>
              <span className="text-lg font-bold text-blue-900">{totalTables} tables</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
