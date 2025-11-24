/**
 * @fileoverview Organization Information Card Component
 *
 * Displays and allows editing of organization information in individual sections:
 * - Organization name
 * - Mailing address (street, city, state, zip)
 * - Contact email (with visibility control)
 * - Contact phone (with visibility control)
 * - Payment method (credit card - coming soon)
 *
 * Each section is independently editable with its own edit/save/cancel buttons.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/supabaseClient';
import type { LeagueOperator, ContactVisibility } from '@/types/operator';

interface OrganizationInfoCardProps {
  operatorProfile: LeagueOperator;
  onUpdate: () => void;
}

type EditingSection = 'name' | 'address' | 'email' | 'phone' | null;

// Helper to get visibility label
const getVisibilityLabel = (visibility: ContactVisibility): string => {
  const labels: Record<ContactVisibility, string> = {
    in_app_only: 'In-app Only',
    my_organization: 'My Organization',
    my_team_captains: 'Team Captains',
    my_teams: 'All Players',
    anyone: 'Public',
  };
  return labels[visibility];
};

export const OrganizationInfoCard: React.FC<OrganizationInfoCardProps> = ({
  operatorProfile,
  onUpdate,
}) => {
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for each section
  const [organizationName, setOrganizationName] = useState(operatorProfile.organization_name);
  const [address, setAddress] = useState(operatorProfile.organization_address);
  const [city, setCity] = useState(operatorProfile.organization_city);
  const [state, setState] = useState(operatorProfile.organization_state);
  const [zipCode, setZipCode] = useState(operatorProfile.organization_zip_code);
  const [email, setEmail] = useState(operatorProfile.league_email);
  const [emailVisibility, setEmailVisibility] = useState<ContactVisibility>(operatorProfile.email_visibility);
  const [phone, setPhone] = useState(operatorProfile.league_phone);
  const [phoneVisibility, setPhoneVisibility] = useState<ContactVisibility>(operatorProfile.phone_visibility);

  const startEditingSection = (section: EditingSection) => {
    // Reset form to current values
    setOrganizationName(operatorProfile.organization_name);
    setAddress(operatorProfile.organization_address);
    setCity(operatorProfile.organization_city);
    setState(operatorProfile.organization_state);
    setZipCode(operatorProfile.organization_zip_code);
    setEmail(operatorProfile.league_email);
    setEmailVisibility(operatorProfile.email_visibility);
    setPhone(operatorProfile.league_phone);
    setPhoneVisibility(operatorProfile.phone_visibility);
    setError(null);
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setError(null);
  };

  const saveName = async () => {
    if (!organizationName.trim()) {
      setError('Organization name is required');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('league_operators')
        .update({ organization_name: organizationName.trim() })
        .eq('id', operatorProfile.id);

      if (updateError) throw updateError;

      setEditingSection(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to update organization name:', err);
      setError('Failed to update organization name');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAddress = async () => {
    if (!address.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      setError('All address fields are required');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('league_operators')
        .update({
          organization_address: address.trim(),
          organization_city: city.trim(),
          organization_state: state.trim().toUpperCase(),
          organization_zip_code: zipCode.trim(),
        })
        .eq('id', operatorProfile.id);

      if (updateError) throw updateError;

      setEditingSection(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to update address:', err);
      setError('Failed to update address');
    } finally {
      setIsSaving(false);
    }
  };

  const saveEmail = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('league_operators')
        .update({
          league_email: email.trim(),
          email_visibility: emailVisibility,
        })
        .eq('id', operatorProfile.id);

      if (updateError) throw updateError;

      setEditingSection(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to update email:', err);
      setError('Failed to update email');
    } finally {
      setIsSaving(false);
    }
  };

  const savePhone = async () => {
    if (!phone.trim()) {
      setError('Phone is required');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('league_operators')
        .update({
          league_phone: phone.trim(),
          phone_visibility: phoneVisibility,
        })
        .eq('id', operatorProfile.id);

      if (updateError) throw updateError;

      setEditingSection(null);
      onUpdate();
    } catch (err) {
      console.error('Failed to update phone:', err);
      setError('Failed to update phone');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-indigo-600 text-2xl">⚙️</div>
        <h3 className="font-semibold text-gray-900">Organization Information</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Organization Name Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Organization Name</p>
            {editingSection !== 'name' && (
              <button
                onClick={() => startEditingSection('name')}
                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </button>
            )}
          </div>
          {editingSection === 'name' ? (
            <div className="space-y-3">
              <Input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your Organization Name"
              />
              <div className="flex gap-2">
                <Button onClick={saveName} disabled={isSaving} size="sm">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={cancelEditing} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-900 font-medium">{operatorProfile.organization_name}</p>
          )}
        </div>

        {/* Mailing Address Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Mailing Address</p>
            {editingSection !== 'address' && (
              <button
                onClick={() => startEditingSection('address')}
                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </button>
            )}
          </div>
          {editingSection === 'address' ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="org-address">Street Address</Label>
                <Input
                  id="org-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="org-city">City</Label>
                  <Input
                    id="org-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="org-state">State</Label>
                  <Input
                    id="org-state"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="ST"
                    maxLength={2}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="org-zip">Zip Code</Label>
                <Input
                  id="org-zip"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="12345"
                  maxLength={10}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveAddress} disabled={isSaving} size="sm">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={cancelEditing} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-900">{operatorProfile.organization_address}</p>
              <p className="text-gray-900">
                {operatorProfile.organization_city}, {operatorProfile.organization_state}{' '}
                {operatorProfile.organization_zip_code}
              </p>
            </>
          )}
        </div>

        {/* Contact Email Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Contact Email</p>
            {editingSection !== 'email' && (
              <button
                onClick={() => startEditingSection('email')}
                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </button>
            )}
          </div>
          {editingSection === 'email' ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="org-email">Email Address</Label>
                <Input
                  id="org-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <Label htmlFor="email-visibility">Visibility</Label>
                <Select value={emailVisibility} onValueChange={(value) => setEmailVisibility(value as ContactVisibility)}>
                  <SelectTrigger id="email-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app_only">In-app Only</SelectItem>
                    <SelectItem value="my_organization">My Organization</SelectItem>
                    <SelectItem value="my_team_captains">Team Captains</SelectItem>
                    <SelectItem value="my_teams">All Players</SelectItem>
                    <SelectItem value="anyone">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEmail} disabled={isSaving} size="sm">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={cancelEditing} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-900">{operatorProfile.league_email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Visibility: {getVisibilityLabel(operatorProfile.email_visibility)}
              </p>
            </>
          )}
        </div>

        {/* Contact Phone Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Contact Phone</p>
            {editingSection !== 'phone' && (
              <button
                onClick={() => startEditingSection('phone')}
                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </button>
            )}
          </div>
          {editingSection === 'phone' ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="org-phone">Phone Number</Label>
                <Input
                  id="org-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="phone-visibility">Visibility</Label>
                <Select value={phoneVisibility} onValueChange={(value) => setPhoneVisibility(value as ContactVisibility)}>
                  <SelectTrigger id="phone-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app_only">In-app Only</SelectItem>
                    <SelectItem value="my_organization">My Organization</SelectItem>
                    <SelectItem value="my_team_captains">Team Captains</SelectItem>
                    <SelectItem value="my_teams">All Players</SelectItem>
                    <SelectItem value="anyone">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={savePhone} disabled={isSaving} size="sm">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={cancelEditing} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-900">{operatorProfile.league_phone}</p>
              <p className="text-xs text-gray-500 mt-1">
                Visibility: {getVisibilityLabel(operatorProfile.phone_visibility)}
              </p>
            </>
          )}
        </div>

        {/* Payment Method Section (Coming Soon) */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Payment Method</p>
            <button
              disabled
              className="text-xs px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
          <p className="text-gray-500 text-sm italic">
            Credit card management will be available when Stripe integration is complete
          </p>
          {/* TODO: Implement credit card update when Stripe integration is ready */}
          {/* Will need to show card_brand and card_last4 */}
          {/* Add "Update Card" button that opens Stripe payment modal */}
        </div>
      </div>
    </div>
  );
};
