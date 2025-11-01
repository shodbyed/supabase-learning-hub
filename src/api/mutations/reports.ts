/**
 * @fileoverview Report Mutation Functions
 *
 * Write operations for user reports (create, update status).
 * These functions are used by TanStack Query useMutation hooks.
 *
 * @see api/hooks/useReportMutations.ts - React hooks wrapper
 */

import { supabase } from '@/supabaseClient';

/**
 * Parameters for creating a user report
 */
export interface CreateReportParams {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description?: string;
}

/**
 * Parameters for updating report status
 */
export interface UpdateReportStatusParams {
  reportId: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reviewNotes?: string;
  reviewedBy?: string;
}

/**
 * Create a new user report
 *
 * Allows users to report inappropriate behavior or content.
 * Reports start in 'pending' status and are reviewed by operators.
 *
 * @param params - Report creation parameters
 * @returns The created report record
 * @throws Error if report creation fails
 *
 * @example
 * const report = await createUserReport({
 *   reporterId: 'reporter-id',
 *   reportedUserId: 'reported-user-id',
 *   reason: 'harassment',
 *   description: 'User sent inappropriate messages'
 * });
 */
export async function createUserReport(params: CreateReportParams) {
  const { reporterId, reportedUserId, reason, description } = params;

  const { data, error } = await supabase
    .from('user_reports')
    .insert([
      {
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason,
        description: description || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user report: ${error.message}`);
  }

  return data;
}

/**
 * Update the status of a user report
 *
 * Used by operators to update report status during investigation.
 * Can add review notes and track who reviewed it.
 *
 * @param params - Report ID, new status, and optional notes
 * @returns The updated report record
 * @throws Error if update fails
 *
 * @example
 * const updated = await updateReportStatus({
 *   reportId: 'report-123',
 *   status: 'resolved',
 *   reviewNotes: 'User warned, no further action needed',
 *   reviewedBy: 'operator-id'
 * });
 */
export async function updateReportStatus(params: UpdateReportStatusParams) {
  const { reportId, status, reviewNotes, reviewedBy } = params;

  const updateData: Record<string, any> = {
    status,
    reviewed_at: new Date().toISOString(),
  };

  if (reviewNotes !== undefined) {
    updateData.review_notes = reviewNotes;
  }

  if (reviewedBy !== undefined) {
    updateData.reviewed_by = reviewedBy;
  }

  const { data, error } = await supabase
    .from('user_reports')
    .update(updateData)
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update report status: ${error.message}`);
  }

  return data;
}
