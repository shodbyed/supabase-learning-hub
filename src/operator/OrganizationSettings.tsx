/**
 * @fileoverview Organization Settings Page
 *
 * Allows league operators to view and edit their organization profile.
 * Each section (name, address, email, phone) is independently editable.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Save, X, ArrowLeft } from 'lucide-react';
import type { LeagueOperator, ContactVisibility } from '@/types/operator';

type EditSection = 'name' | 'address' | 'email' | 'phone' | null;

/**
 * Organization Settings Component
 * Separate edit mode for each section for better UX
 */
export const OrganizationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { member } = useUserProfile();

  // Operator profile state
  const [operatorProfile, setOperatorProfile] = useState<LeagueOperator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state - track which section is being edited
  const [editingSection, setEditingSection] = useState<EditSection>(null);
  const [editedData, setEditedData] = useState<Partial<LeagueOperator>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * Fetch operator profile on mount
   */
  useEffect(() => {
    const fetchOperatorProfile = async () => {
      if (!member) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('league_operators')
          .select('*')
          .eq('member_id', member.id)
          .single();

        if (error) throw error;

        setOperatorProfile(data);
      } catch (err) {
        console.error('Failed to fetch operator profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load operator profile');
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorProfile();
  }, [member]);

  /**
   * Handle edit mode for a specific section
   */
  const handleEdit = (section: EditSection) => {
    setEditingSection(section);
    setEditedData(operatorProfile || {});
    setSaveError(null);
  };

  /**
   * Handle cancel edit
   */
  const handleCancel = () => {
    setEditingSection(null);
    setEditedData({});
    setSaveError(null);
  };

  /**
   * Handle save changes for current section
   */
  const handleSave = async () => {
    if (!operatorProfile) return;

    try {
      setSaveError(null);

      // Build update object based on which section is being edited
      let updateData: Partial<LeagueOperator> = {};

      switch (editingSection) {
        case 'name':
          updateData = { organization_name: editedData.organization_name };
          break;
        case 'address':
          updateData = {
            organization_address: editedData.organization_address,
            organization_city: editedData.organization_city,
            organization_state: editedData.organization_state,
            organization_zip_code: editedData.organization_zip_code,
          };
          break;
        case 'email':
          updateData = {
            league_email: editedData.league_email,
            email_visibility: editedData.email_visibility,
          };
          break;
        case 'phone':
          updateData = {
            league_phone: editedData.league_phone,
            phone_visibility: editedData.phone_visibility,
          };
          break;
      }

      const { error } = await supabase
        .from('league_operators')
        .update(updateData)
        .eq('id', operatorProfile.id);

      if (error) throw error;

      // Update local state
      setOperatorProfile({ ...operatorProfile, ...updateData });
      setEditingSection(null);
      setEditedData({});

      console.log('✅ Organization profile updated successfully');
    } catch (err) {
      console.error('Failed to update organization profile:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  /**
   * Handle field change
   */
  const handleFieldChange = (field: keyof LeagueOperator, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center text-gray-600">Loading organization settings...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !operatorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                {error || 'No operator profile found. Please complete the operator application first.'}
              </p>
              <Button onClick={() => navigate('/operator-dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/operator-dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        </div>

        {/* Save Error */}
        {saveError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{saveError}</p>
          </div>
        )}

        {/* Organization Name Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Organization Name</CardTitle>
            {editingSection !== 'name' && (
              <Button onClick={() => handleEdit('name')} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingSection === 'name' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={editedData.organization_name || ''}
                    onChange={(e) => handleFieldChange('organization_name', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-yellow-600 mt-2">
                    ⚠️ Note: Existing leagues will keep their original names. Only new leagues will use the updated organization name.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900">{operatorProfile.organization_name}</p>
            )}
          </CardContent>
        </Card>

        {/* Address Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mailing Address</CardTitle>
              <p className="text-sm text-gray-600 mt-1">For BCA materials</p>
            </div>
            {editingSection !== 'address' && (
              <Button onClick={() => handleEdit('address')} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingSection === 'address' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={editedData.organization_address || ''}
                    onChange={(e) => handleFieldChange('organization_address', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editedData.organization_city || ''}
                      onChange={(e) => handleFieldChange('organization_city', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={editedData.organization_state || ''}
                      onChange={(e) => handleFieldChange('organization_state', e.target.value.toUpperCase())}
                      className="mt-1"
                      maxLength={2}
                      placeholder="IL"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={editedData.organization_zip_code || ''}
                    onChange={(e) => handleFieldChange('organization_zip_code', e.target.value)}
                    className="mt-1"
                    placeholder="12345"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-900">
                <p>{operatorProfile.organization_address}</p>
                <p>{operatorProfile.organization_city}, {operatorProfile.organization_state} {operatorProfile.organization_zip_code}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>League Contact Email</CardTitle>
              <p className="text-sm text-gray-600 mt-1">How players contact you by email</p>
            </div>
            {editingSection !== 'email' && (
              <Button onClick={() => handleEdit('email')} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingSection === 'email' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedData.league_email || ''}
                    onChange={(e) => handleFieldChange('league_email', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email-visibility">Who can see your email?</Label>
                  <Select
                    value={editedData.email_visibility || 'in_app_only'}
                    onValueChange={(value) => handleFieldChange('email_visibility', value as ContactVisibility)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_app_only">In-app only (most private)</SelectItem>
                      <SelectItem value="my_organization">My organization</SelectItem>
                      <SelectItem value="my_team_captains">My team captains</SelectItem>
                      <SelectItem value="my_teams">My teams</SelectItem>
                      <SelectItem value="anyone">Anyone (public)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-900">{operatorProfile.league_email}</p>
                <p className="text-sm text-gray-600 mt-1 capitalize">
                  Visible to: {operatorProfile.email_visibility?.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phone Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>League Contact Phone</CardTitle>
              <p className="text-sm text-gray-600 mt-1">How players contact you by phone</p>
            </div>
            {editingSection !== 'phone' && (
              <Button onClick={() => handleEdit('phone')} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingSection === 'phone' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editedData.league_phone || ''}
                    onChange={(e) => handleFieldChange('league_phone', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone-visibility">Who can see your phone?</Label>
                  <Select
                    value={editedData.phone_visibility || 'in_app_only'}
                    onValueChange={(value) => handleFieldChange('phone_visibility', value as ContactVisibility)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_app_only">In-app only (most private)</SelectItem>
                      <SelectItem value="my_organization">My organization</SelectItem>
                      <SelectItem value="my_team_captains">My team captains</SelectItem>
                      <SelectItem value="my_teams">My teams</SelectItem>
                      <SelectItem value="anyone">Anyone (public)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-900">{operatorProfile.league_phone}</p>
                <p className="text-sm text-gray-600 mt-1 capitalize">
                  Visible to: {operatorProfile.phone_visibility?.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information (Read-Only) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Card Brand</Label>
                <p className="text-gray-900 mt-1 capitalize">{operatorProfile.card_brand}</p>
              </div>
              <div>
                <Label>Card Ending In</Label>
                <p className="text-gray-900 mt-1">•••• {operatorProfile.card_last4}</p>
              </div>
              <div>
                <Label>Expires</Label>
                <p className="text-gray-900 mt-1">
                  {operatorProfile.expiry_month}/{operatorProfile.expiry_year}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="text-gray-900 mt-1">
                  {operatorProfile.payment_verified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600">⚠ Pending</span>
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Update Payment Method (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
