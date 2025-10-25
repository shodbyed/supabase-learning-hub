/**
 * @fileoverview Report User Modal Component
 *
 * Modal for reporting users for various violations.
 * Creates immutable report records with evidence preservation.
 *
 * Features:
 * - Multiple report categories
 * - Required description
 * - Evidence preservation (context passed from parent)
 * - Privacy protection for reporter
 *
 * Usage:
 * <ReportUserModal
 *   reportedUserId="uuid"
 *   reportedUserName="John Doe"
 *   onClose={() => setShowModal(false)}
 *   contextData={{ conversation_id: 'uuid' }} // Optional
 *   evidenceSnapshot={{ message_text: 'content' }} // Optional
 * />
 */

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { createUserReport, REPORT_CATEGORIES } from '@/utils/reportingQueries';
import type { ReportCategory } from '@/utils/reportingQueries';

interface ReportUserModalProps {
  reportedUserId: string;
  reportedUserName: string;
  onClose: () => void;
  contextData?: Record<string, any>; // conversation_id, match_id, etc.
  evidenceSnapshot?: Record<string, any>; // message_text, score_data, etc.
  defaultCategory?: ReportCategory;
}

export function ReportUserModal({
  reportedUserId,
  reportedUserName,
  onClose,
  contextData,
  evidenceSnapshot,
  defaultCategory
}: ReportUserModalProps) {
  const { memberId } = useCurrentMember();
  const [category, setCategory] = useState<ReportCategory>(defaultCategory || 'other');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberId) {
      setError('You must be logged in to submit a report');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: submitError } = await createUserReport(
      memberId,
      reportedUserId,
      category,
      description.trim(),
      evidenceSnapshot,
      contextData
    );

    setIsSubmitting(false);

    if (submitError) {
      setError('Failed to submit report. Please try again.');
      return;
    }

    // Success - close modal
    alert('Report submitted successfully. A league operator will review it shortly.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Report User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Reporting */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              <strong>You are reporting:</strong> {reportedUserName}
            </p>
            <p className="text-xs text-orange-700 mt-1">
              Reports are reviewed by league operators. False reports may result in penalties.
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Report Category *</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ReportCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_CATEGORIES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail. Include specific examples if possible."
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              required
              minLength={10}
            />
            <p className="text-xs text-gray-500">
              Minimum 10 characters. Be specific and provide context.
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Privacy:</strong> Your identity will be kept confidential. The reported user will not see who filed this report.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0 flex gap-2 justify-end">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || description.trim().length < 10}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
