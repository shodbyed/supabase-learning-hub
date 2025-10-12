/**
 * @fileoverview MemberCombobox Component
 *
 * Reusable combobox for searching and selecting members (players/captains).
 * Uses shadcn Command + Popover composition for autocomplete functionality.
 */
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Member } from '@/types/member';
import { getPlayerDisplayNumber } from '@/types/member';

interface MemberComboboxProps {
  /** List of members to choose from */
  members: Member[];
  /** Currently selected member ID */
  value: string;
  /** Called when selection changes */
  onValueChange: (memberId: string) => void;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Optional label for the combobox */
  label?: string;
  /** Disable the combobox */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MemberCombobox Component
 *
 * Searchable dropdown for selecting team members.
 * Shows member name and player number for easy identification.
 */
export const MemberCombobox: React.FC<MemberComboboxProps> = ({
  members,
  value,
  onValueChange,
  placeholder = 'Select member...',
  label,
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedMember = members.find((member) => member.id === value);

  // Debug logging
  if (open && members.length === 0) {
    console.warn('MemberCombobox opened but no members available');
  }

  // Filter members based on search query
  const filteredMembers = searchQuery
    ? members.filter((member) => {
        const playerNumber = getPlayerDisplayNumber(member);
        const searchValue = `${member.first_name} ${member.last_name} ${playerNumber}`.toLowerCase();
        return searchValue.includes(searchQuery.toLowerCase());
      })
    : members;

  /**
   * Format member display name with player number
   * Shows: FirstName LastName PlayerNumber
   */
  const formatMemberLabel = (member: Member): string => {
    const playerNumber = getPlayerDisplayNumber(member);
    return `${member.first_name} ${member.last_name} ${playerNumber}`;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="truncate">
              {selectedMember
                ? formatMemberLabel(selectedMember)
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search members..."
              className="h-9"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No member found.</CommandEmpty>
              <CommandGroup>
                {members.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">No members available</div>
                ) : (
                  filteredMembers.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={member.id}
                      onSelect={() => {
                        onValueChange(member.id === value ? '' : member.id);
                        setSearchQuery('');
                        setOpen(false);
                      }}
                    >
                      {formatMemberLabel(member)}
                      <Check
                        className={`ml-auto h-4 w-4 ${
                          member.id === value ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
