/**
 * @fileoverview Upgrade Reporting System Migration
 *
 * This migrates from the old simple user_reports table to the new comprehensive
 * reporting system with full audit trails, evidence preservation, and legal compliance.
 *
 * WHAT THIS DOES:
 * 1. Backs up existing reports (if any)
 * 2. Drops old simple schema
 * 3. Creates new comprehensive schema
 * 4. Restores any existing reports (mapped to new structure)
 *
 * SAFE TO RUN: Preserves existing report data
 */

-- =============================================================================
-- STEP 1: Backup existing reports (if any exist)
-- =============================================================================

-- Create temporary backup table
CREATE TEMP TABLE user_reports_backup AS
SELECT * FROM user_reports;

-- Count existing reports
DO $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count FROM user_reports_backup;
  RAISE NOTICE '📦 Backed up % existing reports', report_count;
END $$;

-- =============================================================================
-- STEP 2: Drop old schema
-- =============================================================================

DROP TABLE IF EXISTS user_reports CASCADE;

DO $$
BEGIN
  RAISE NOTICE '🗑️  Dropped old user_reports table';
END $$;

-- =============================================================================
-- STEP 3: Create new comprehensive schema
-- =============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS report_category CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS report_severity CASCADE;
DROP TYPE IF EXISTS moderation_action CASCADE;

-- Create enums for new system
CREATE TYPE report_category AS ENUM (
  'inappropriate_message',
  'harassment',
  'fake_account',
  'cheating',
  'poor_sportsmanship',
  'impersonation',
  'spam',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'under_review',
  'escalated',
  'action_taken',
  'resolved',
  'dismissed'
);

CREATE TYPE report_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE moderation_action AS ENUM (
  'warning',
  'temporary_suspension',
  'permanent_ban',
  'account_deletion',
  'no_action'
);

-- Create new user_reports table
CREATE TABLE user_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  category report_category NOT NULL,
  description TEXT NOT NULL,
  evidence_snapshot JSONB,
  context_data JSONB,
  severity report_severity DEFAULT 'medium',
  auto_flagged BOOLEAN DEFAULT FALSE,
  status report_status DEFAULT 'pending',
  assigned_operator_id UUID REFERENCES league_operators(id) ON DELETE SET NULL,
  escalated_to_dev BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  CONSTRAINT cannot_report_self CHECK (reporter_id != reported_user_id),
  CONSTRAINT description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Create report_actions table
CREATE TABLE report_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES user_reports(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  actor_role VARCHAR(50) NOT NULL,
  action_type moderation_action NOT NULL,
  action_notes TEXT NOT NULL,
  suspension_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create report_updates table
CREATE TABLE report_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES user_reports(id) ON DELETE CASCADE,
  updater_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  updater_role VARCHAR(50) NOT NULL,
  old_status report_status NOT NULL,
  new_status report_status NOT NULL,
  update_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);
CREATE INDEX idx_user_reports_category ON user_reports(category);
CREATE INDEX idx_user_reports_severity ON user_reports(severity);
CREATE INDEX idx_user_reports_assigned_operator ON user_reports(assigned_operator_id);
CREATE INDEX idx_user_reports_created_at ON user_reports(created_at DESC);
CREATE INDEX idx_user_reports_escalated ON user_reports(escalated_to_dev) WHERE escalated_to_dev = TRUE;

CREATE INDEX idx_report_actions_report ON report_actions(report_id);
CREATE INDEX idx_report_actions_actor ON report_actions(actor_id);
CREATE INDEX idx_report_actions_created ON report_actions(created_at DESC);

CREATE INDEX idx_report_updates_report ON report_updates(report_id);

-- Create triggers
CREATE OR REPLACE FUNCTION update_report_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
    NEW.reviewed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_reviewed_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_report_reviewed_at();

CREATE OR REPLACE FUNCTION update_report_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('resolved', 'dismissed', 'action_taken') AND OLD.resolved_at IS NULL THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_resolved_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_report_resolved_at();

CREATE OR REPLACE FUNCTION log_report_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO report_updates (
      report_id,
      updater_id,
      updater_role,
      old_status,
      new_status,
      update_notes
    ) VALUES (
      NEW.id,
      (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1),
      (CASE
        WHEN EXISTS (SELECT 1 FROM league_operators WHERE member_id = (SELECT id FROM members WHERE user_id = auth.uid() LIMIT 1)) THEN 'operator'
        WHEN EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'developer') THEN 'developer'
        ELSE 'unknown'
      END),
      OLD.status,
      NEW.status,
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_report_status_change
  AFTER UPDATE ON user_reports
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_report_status_change();

-- Create RLS policies
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON user_reports FOR SELECT
  USING (reporter_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (reporter_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Operators can view league reports"
  ON user_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM league_operators lo
      INNER JOIN leagues l ON l.operator_id = lo.id
      INNER JOIN seasons s ON s.league_id = l.id AND s.status = 'active'
      INNER JOIN teams t ON t.season_id = s.id
      INNER JOIN team_players tp ON tp.team_id = t.id
      WHERE lo.member_id = (SELECT id FROM members WHERE user_id = auth.uid())
        AND tp.member_id = user_reports.reported_user_id
    )
  );

CREATE POLICY "Operators can update league reports"
  ON user_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM league_operators lo
      INNER JOIN leagues l ON l.operator_id = lo.id
      INNER JOIN seasons s ON s.league_id = l.id AND s.status = 'active'
      INNER JOIN teams t ON t.season_id = s.id
      INNER JOIN team_players tp ON tp.team_id = t.id
      WHERE lo.member_id = (SELECT id FROM members WHERE user_id = auth.uid())
        AND tp.member_id = user_reports.reported_user_id
    )
  );

CREATE POLICY "Developers can view all reports"
  ON user_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'developer'));

CREATE POLICY "Developers can update all reports"
  ON user_reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'developer'));

CREATE POLICY "Users can view actions on their reports"
  ON report_actions FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM user_reports
      WHERE reporter_id = (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Operators and Devs can view report actions"
  ON report_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
        AND (role = 'developer' OR role = 'league_operator')
    )
  );

CREATE POLICY "Operators and Devs can create report actions"
  ON report_actions FOR INSERT
  WITH CHECK (
    actor_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
        AND (role = 'developer' OR role = 'league_operator')
    )
  );

CREATE POLICY "Anyone can view report updates"
  ON report_updates FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM user_reports
      WHERE reporter_id = (SELECT id FROM members WHERE user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM members
      WHERE user_id = auth.uid()
        AND (role = 'developer' OR role = 'league_operator')
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Created new comprehensive reporting system';
END $$;

-- =============================================================================
-- STEP 4: Restore existing reports (if any)
-- =============================================================================

-- Map old schema to new schema
INSERT INTO user_reports (
  id,
  reporter_id,
  reported_user_id,
  category,
  description,
  status,
  evidence_snapshot,
  context_data,
  created_at,
  reviewed_at,
  resolved_at
)
SELECT
  id,
  reporter_id,
  reported_user_id,
  -- Map old categories to new enum
  CASE category
    WHEN 'harassment' THEN 'harassment'::report_category
    WHEN 'spam' THEN 'spam'::report_category
    WHEN 'inappropriate_content' THEN 'inappropriate_message'::report_category
    WHEN 'impersonation' THEN 'impersonation'::report_category
    ELSE 'other'::report_category
  END,
  description,
  -- Map old status to new enum
  CASE status
    WHEN 'pending' THEN 'pending'::report_status
    WHEN 'under_review' THEN 'under_review'::report_status
    WHEN 'resolved' THEN 'resolved'::report_status
    WHEN 'dismissed' THEN 'dismissed'::report_status
    ELSE 'pending'::report_status
  END,
  -- Create evidence snapshot from old message_id if available
  CASE
    WHEN message_id IS NOT NULL THEN
      jsonb_build_object('message_id', message_id, 'migrated_from_old_schema', true)
    ELSE NULL
  END,
  -- Create context data from old conversation_id if available
  CASE
    WHEN conversation_id IS NOT NULL THEN
      jsonb_build_object('conversation_id', conversation_id, 'migrated_from_old_schema', true)
    ELSE NULL
  END,
  created_at,
  reviewed_at,
  CASE
    WHEN status IN ('resolved', 'dismissed') THEN reviewed_at
    ELSE NULL
  END
FROM user_reports_backup;

-- Report migration results
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM user_reports;
  RAISE NOTICE '♻️  Migrated % reports to new schema', migrated_count;
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✨ Reporting System Upgrade Complete!';
  RAISE NOTICE '   - Old reports preserved and migrated';
  RAISE NOTICE '   - New comprehensive schema active';
  RAISE NOTICE '   - Full audit trail enabled';
  RAISE NOTICE '   - Evidence preservation ready';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
