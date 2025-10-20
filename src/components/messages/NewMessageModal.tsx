/**
 * @fileoverview New Message Modal
 *
 * Modal for starting a new conversation.
 * Features:
 * - Search bar for finding users
 * - Filter tabs: All | My Leagues | My Teams
 * - Clickable user list with compact cards
 * - Fetches real members from database
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/supabaseClient';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  system_player_number: number;
}

interface NewMessageModalProps {
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

type FilterTab = 'all' | 'leagues' | 'teams';

export function NewMessageModal({ onClose, onSelectUser }: NewMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all members
  useEffect(() => {
    async function fetchMembers() {
      // Only fetch members with user_id (authenticated accounts)
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, system_player_number')
        .not('user_id', 'is', null)
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching members:', error);
        setLoading(false);
        return;
      }

      setMembers(data || []);
      setLoading(false);
    }

    fetchMembers();
  }, []);

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    // Remove 'p-' prefix if user typed it
    const cleanQuery = query.replace(/^p-?/, '');
    const playerNumber = member.system_player_number.toString().padStart(5, '0');

    return (
      fullName.includes(query) ||
      playerNumber.includes(cleanQuery)
    );
  });

  const handleUserClick = (userId: string) => {
    onSelectUser(userId);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">New Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or member number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-4 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                'pb-3 px-2 text-sm font-medium border-b-2 transition-colors',
                activeFilter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('leagues')}
              className={cn(
                'pb-3 px-2 text-sm font-medium border-b-2 transition-colors',
                activeFilter === 'leagues'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              My Leagues
            </button>
            <button
              onClick={() => setActiveFilter('teams')}
              className={cn(
                'pb-3 px-2 text-sm font-medium border-b-2 transition-colors',
                activeFilter === 'teams'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              My Teams
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No members found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleUserClick(member.id)}
                  className="w-full p-2 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      P-{member.system_player_number.toString().padStart(5, '0')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
