/**
 * @fileoverview New Message Modal
 *
 * Modal for starting a new conversation.
 * Features:
 * - Search bar for finding users
 * - Filter tabs: All | My Leagues | My Teams
 * - Clickable user list
 * - Creates or opens existing conversation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  memberNumber: string;
  context?: string; // e.g., "Monday Night League" or "Team Sharks"
}

interface NewMessageModalProps {
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

type FilterTab = 'all' | 'leagues' | 'teams';

// Mock data - will be replaced with real data from database
const MOCK_USERS: User[] = [
  { id: '1', name: 'John Smith', memberNumber: '12345', context: 'Monday Night League' },
  { id: '2', name: 'Sarah Johnson', memberNumber: '23456', context: 'Team Sharks' },
  { id: '3', name: 'Mike Williams', memberNumber: '34567', context: 'Monday Night League' },
  { id: '4', name: 'Lisa Brown', memberNumber: '45678', context: 'Team Sharks' },
  { id: '5', name: 'Tom Davis', memberNumber: '56789', context: 'Wednesday League' },
];

export function NewMessageModal({ onClose, onSelectUser }: NewMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Filter users based on search query
  const filteredUsers = MOCK_USERS.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.memberNumber.includes(searchQuery)
  );

  const handleUserClick = (userId: string) => {
    onSelectUser(userId);
    onClose();
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
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No users found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="w-full p-4 rounded-lg border hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        Member #{user.memberNumber}
                      </p>
                    </div>
                    {user.context && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {user.context}
                      </span>
                    )}
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
