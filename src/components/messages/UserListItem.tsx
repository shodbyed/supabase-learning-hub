/**
 * @fileoverview User List Item Component
 *
 * Single responsibility: Display a single user in a selectable list.
 * Reusable component for user selection interfaces.
 */

interface UserListItemProps {
  firstName: string;
  lastName: string;
  playerNumber: number;
  onClick: () => void;
}

export function UserListItem({ firstName, lastName, playerNumber, onClick }: UserListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-2 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900">
          {firstName} {lastName}
        </p>
        <p className="text-xs text-gray-600">P-{playerNumber.toString().padStart(5, '0')}</p>
      </div>
    </button>
  );
}
