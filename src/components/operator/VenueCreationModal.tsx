/**
 * @fileoverview Venue Creation Modal
 *
 * Modal form for operators to add new venues to their organization.
 * Collects required venue information (name, address, phone, table counts).
 * Optional fields can be added later via venue editing.
 */
import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { X } from 'lucide-react';
import type { VenueFormData, VenueInsertData, Venue } from '@/types/venue';
import { US_STATES } from '@/constants/states';
import { formatPhoneNumber } from '@/utils/formatters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface VenueCreationModalProps {
  /** Operator ID who is creating the venue */
  operatorId: string;
  /** Called when venue is successfully created or updated */
  onSuccess: (venue: Venue) => void;
  /** Called when user cancels or closes modal */
  onCancel: () => void;
  /** Existing venue data for editing (optional) */
  existingVenue?: Venue | null;
}

/**
 * VenueCreationModal Component
 *
 * Simple modal form for adding venues. Only collects required fields:
 * - Name, address, phone (essential contact info)
 * - Bar-box and regulation table counts (capacity planning)
 *
 * Optional fields (contacts, website, hours) can be added later via editing.
 */
export const VenueCreationModal: React.FC<VenueCreationModalProps> = ({
  operatorId,
  onSuccess,
  onCancel,
  existingVenue
}) => {
  const isEditing = !!existingVenue;

  const [formData, setFormData] = useState<VenueFormData>({
    name: existingVenue?.name || '',
    street_address: existingVenue?.street_address || '',
    city: existingVenue?.city || '',
    state: existingVenue?.state || '',
    zip_code: existingVenue?.zip_code || '',
    phone: existingVenue?.phone || '',
    bar_box_tables: existingVenue?.bar_box_tables || 0,
    regulation_tables: existingVenue?.regulation_tables || 0
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update form field value
   */
  const updateField = (field: keyof VenueFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error on input change
  };

  /**
   * Validate form data
   */
  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Venue name is required';
    if (!formData.street_address.trim()) return 'Street address is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.state.trim()) return 'State is required';
    if (!formData.zip_code.trim()) return 'Zip code is required';
    if (!formData.phone.trim()) return 'Phone number is required';

    const totalTables = formData.bar_box_tables + formData.regulation_tables;
    if (totalTables === 0) {
      return 'Venue must have at least one table (bar-box or regulation)';
    }

    if (formData.bar_box_tables < 0 || formData.regulation_tables < 0) {
      return 'Table counts cannot be negative';
    }

    return null;
  };

  /**
   * Save venue to database (create or update)
   */
  const handleSave = async () => {
    // Validate
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEditing && existingVenue) {
        // UPDATE existing venue
        const updateData = {
          name: formData.name.trim(),
          street_address: formData.street_address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim().toUpperCase(),
          zip_code: formData.zip_code.trim(),
          phone: formData.phone.trim(),
          bar_box_tables: formData.bar_box_tables,
          regulation_tables: formData.regulation_tables,
        };

        console.log('✏️ Updating venue:', updateData);

        const { data: updatedVenue, error: dbError } = await supabase
          .from('venues')
          .update(updateData)
          .eq('id', existingVenue.id)
          .select()
          .single();

        if (dbError) throw dbError;

        console.log('✅ Venue updated:', updatedVenue);
        onSuccess(updatedVenue);
      } else {
        // INSERT new venue
        const insertData: VenueInsertData = {
          created_by_operator_id: operatorId,
          name: formData.name.trim(),
          street_address: formData.street_address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim().toUpperCase(),
          zip_code: formData.zip_code.trim(),
          phone: formData.phone.trim(),
          bar_box_tables: formData.bar_box_tables,
          regulation_tables: formData.regulation_tables,
          // Optional fields - null if not provided
          proprietor_name: formData.proprietor_name?.trim() || null,
          proprietor_phone: formData.proprietor_phone?.trim() || null,
          league_contact_name: formData.league_contact_name?.trim() || null,
          league_contact_phone: formData.league_contact_phone?.trim() || null,
          league_contact_email: formData.league_contact_email?.trim() || null,
          website: formData.website?.trim() || null,
          business_hours: formData.business_hours?.trim() || null,
          notes: formData.notes?.trim() || null
        };

        console.log('🏢 Creating venue:', insertData);

        const { data: newVenue, error: dbError } = await supabase
          .from('venues')
          .insert([insertData])
          .select()
          .single();

        if (dbError) throw dbError;

        console.log('✅ Venue created:', newVenue);
        onSuccess(newVenue);
      }
    } catch (err) {
      console.error('❌ Error saving venue:', err);
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} venue`);
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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Venue' : 'Add New Venue'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Venue Name */}
          <div>
            <Label>
              Venue Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Sam's Billiards"
            />
          </div>

          {/* Address */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.street_address}
                onChange={(e) => updateField('street_address', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label>
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Springfield"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  State <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.state} onValueChange={(value) => updateField('state', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Zip Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => updateField('zip_code', e.target.value)}
                  placeholder="62701"
                />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label>
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                updateField('phone', formatted);
              }}
              placeholder="123-456-7890"
              maxLength={12}
            />
          </div>

          {/* Table Counts */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>
                Bar-Box Tables (7ft) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.bar_box_tables}
                onChange={(e) => updateField('bar_box_tables', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>
                Regulation Tables (9ft) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.regulation_tables}
                onChange={(e) => updateField('regulation_tables', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Total Tables:</strong> {formData.bar_box_tables + formData.regulation_tables}
              <br />
              <span className="text-xs">
                Capacity: {formData.bar_box_tables + formData.regulation_tables} teams travel or {(formData.bar_box_tables + formData.regulation_tables) * 2} teams in-house
              </span>
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Additional details (contacts, website, hours) can be added later by editing the venue.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Venue' : 'Create Venue')
            }
          </Button>
        </div>
      </div>
    </div>
  );
};
