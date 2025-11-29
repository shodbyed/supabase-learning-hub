/**
 * @fileoverview Organization Staff Card Component
 *
 * Displays organization staff members with ability to add new staff.
 * Shows staff list with names and positions (owner, admin, league_rep).
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MemberCombobox } from '@/components/MemberCombobox';
import { UserPlus } from 'lucide-react';
import { useOrganizationStaff, useAllMembers, useAddOrganizationStaff } from '@/api/hooks';

interface OrganizationStaffCardProps {
  /** Organization ID to fetch staff for */
  organizationId: string;
  /** Current user's member ID (for adding staff) */
  currentMemberId: string;
}

/**
 * Organization Staff Card Component
 *
 * Displays list of staff members for an organization.
 * Allows adding new staff members as admins.
 */
export const OrganizationStaffCard: React.FC<OrganizationStaffCardProps> = ({
  organizationId,
  currentMemberId,
}) => {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Fetch staff and members
  const { data: staff = [], isLoading: staffLoading } = useOrganizationStaff(organizationId);
  const { data: allMembers = [] } = useAllMembers();

  // Add staff mutation
  const addStaffMutation = useAddOrganizationStaff();

  const handleAddStaff = async () => {
    if (!selectedMemberId || !currentMemberId) return;

    try {
      await addStaffMutation.mutateAsync({
        organizationId,
        memberId: selectedMemberId,
        position: 'admin',
        addedBy: currentMemberId,
      });
      setShowAddStaff(false);
      setSelectedMemberId('');
    } catch (err) {
      console.error('Failed to add staff:', err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Organization Staff</CardTitle>
          <Button onClick={() => setShowAddStaff(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-1" />
            Add Staff
          </Button>
        </CardHeader>
        <CardContent>
          {staffLoading ? (
            <p className="text-gray-600 text-sm text-center py-4">Loading staff...</p>
          ) : staff.length === 0 ? (
            <div className="text-center py-6">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">No staff members yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {staff.map((staffMember) => (
                <div
                  key={staffMember.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {staffMember.member.first_name} {staffMember.member.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {staffMember.position.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MemberCombobox
              members={allMembers}
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
              placeholder="Search for member..."
              label="Select Member"
              excludeIds={staff.map((s) => s.member_id)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddStaff(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddStaff}
                disabled={!selectedMemberId || addStaffMutation.isPending}
              >
                {addStaffMutation.isPending ? 'Adding...' : 'Add as Admin'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
