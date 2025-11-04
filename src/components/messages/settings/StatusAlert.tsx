/**
 * @fileoverview Status Alert Component
 *
 * Displays success or error alerts for settings changes.
 * Auto-dismisses success messages after 3 seconds.
 */

interface StatusAlertProps {
  type: 'success' | 'error' | null;
  message: string;
}

export function StatusAlert({ type, message }: StatusAlertProps) {
  if (!type) return null;

  if (type === 'success') {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-700 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
