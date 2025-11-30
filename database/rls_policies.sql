-- =====================================================
-- ROW LEVEL SECURITY POLICIES - ALL TABLES
-- =====================================================
-- Single source of truth for all RLS policies
--
-- Progress: 25/25 tables complete ✅
--
-- Strategy: Answer 4 questions for each table:
--   1. SELECT - Who can view rows?
--   2. INSERT - Who can create rows?
--   3. UPDATE - Who can edit rows?
--   4. DELETE - Who can remove rows?
-- =====================================================

-- ✅ COMPLETE: ALL 25 TABLES!
-- members, venues, teams, leagues, preferences, championship_date_options,
-- operator_blackout_preferences, organizations, organization_staff, seasons,
-- season_weeks, league_venues, team_players, matches, match_lineups, match_games,
-- conversations, conversation_participants, messages, blocked_users, user_reports,
-- report_actions, report_updates, handicap_chart_3vs3, venue_owners

-- =====================================================
-- TABLE 1: members (COMPLETE)
-- =====================================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view members"
  ON members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own member record"
  ON members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own member record"
  ON members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- TABLE 2: venues (COMPLETE)
-- =====================================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view venues"
  ON venues FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can create venues"
  ON venues FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can update venues"
  ON venues FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- =====================================================
-- TABLE 3: teams (COMPLETE)
-- =====================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view teams"
  ON teams FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can create teams"
  ON teams FOR INSERT
  WITH CHECK (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Captains can update their own teams"
  ON teams FOR UPDATE
  USING (
    captain_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Organization staff can update teams"
  ON teams FOR UPDATE
  USING (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Organization staff can delete teams"
  ON teams FOR DELETE
  USING (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

-- =====================================================
-- TABLE 4: leagues (COMPLETE)
-- =====================================================

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view leagues"
  ON leagues FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can create leagues"
  ON leagues FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can update leagues"
  ON leagues FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization owners can delete leagues"
  ON leagues FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
        AND position = 'owner'
    )
  );

-- =====================================================
-- TABLE 5: preferences (COMPLETE)
-- =====================================================

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view preferences"
  ON preferences FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can create preferences"
  ON preferences FOR INSERT
  WITH CHECK (
    entity_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
    OR entity_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Organization staff can update preferences"
  ON preferences FOR UPDATE
  USING (
    entity_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
    OR entity_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

-- DELETE: No policy (use NULL values, cascade on organization delete)

-- =====================================================
-- TABLE 6: championship_date_options (COMPLETE)
-- =====================================================

ALTER TABLE championship_date_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization staff can view championship dates"
  ON championship_date_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can create championship dates"
  ON championship_date_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can update championship dates"
  ON championship_date_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- DELETE: No policy (championship dates are referenced by season_weeks)

-- =====================================================
-- TABLE 7: operator_blackout_preferences (COMPLETE)
-- =====================================================

ALTER TABLE operator_blackout_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization staff can view their blackout preferences"
  ON operator_blackout_preferences FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can create blackout preferences"
  ON operator_blackout_preferences FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can update blackout preferences"
  ON operator_blackout_preferences FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- DELETE: No policy (preferences persist for historical reference)

-- =====================================================
-- TABLE 8: organizations (COMPLETE)
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view organizations"
  ON organizations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Any authenticated user can create an organization"
  ON organizations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- DELETE: No policy (organizations are permanent)

-- =====================================================
-- TABLE 9: organization_staff (COMPLETE)
-- =====================================================

ALTER TABLE organization_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization staff can view their organization's staff"
  ON organization_staff FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization owners can add staff"
  ON organization_staff FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
        AND position = 'owner'
    )
  );

CREATE POLICY "Organization owners can update staff positions"
  ON organization_staff FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
        AND position = 'owner'
    )
  );

CREATE POLICY "Organization owners can remove staff"
  ON organization_staff FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
        AND position = 'owner'
    )
  );

CREATE POLICY "Staff members can remove themselves"
  ON organization_staff FOR DELETE
  USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- =====================================================
-- TABLE 10: seasons (COMPLETE)
-- =====================================================

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view seasons"
  ON seasons FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can create seasons"
  ON seasons FOR INSERT
  WITH CHECK (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Organization staff can update seasons"
  ON seasons FOR UPDATE
  USING (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

-- DELETE: No policy (seasons are permanent for historical data)

-- =====================================================
-- TABLE 11: season_weeks (COMPLETE)
-- =====================================================

ALTER TABLE season_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view season weeks"
  ON season_weeks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can create season weeks"
  ON season_weeks FOR INSERT
  WITH CHECK (
    season_id IN (
      SELECT s.id FROM seasons s
      JOIN leagues l ON s.league_id = l.id
      WHERE l.organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Organization staff can update season weeks"
  ON season_weeks FOR UPDATE
  USING (
    season_id IN (
      SELECT s.id FROM seasons s
      JOIN leagues l ON s.league_id = l.id
      WHERE l.organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Organization staff can delete season weeks"
  ON season_weeks FOR DELETE
  USING (
    season_id IN (
      SELECT s.id FROM seasons s
      JOIN leagues l ON s.league_id = l.id
      WHERE l.organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

-- =====================================================
-- TABLE 12: league_venues (COMPLETE)
-- =====================================================

ALTER TABLE league_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization staff can view their league venues"
  ON league_venues FOR SELECT
  USING (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Organization staff can add league venues"
  ON league_venues FOR INSERT
  WITH CHECK (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Organization staff can update league venues"
  ON league_venues FOR UPDATE
  USING (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Organization staff can remove league venues"
  ON league_venues FOR DELETE
  USING (
    league_id IN (
      SELECT id FROM leagues
      WHERE organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

-- =====================================================
-- TABLE 13: team_players (COMPLETE)
-- =====================================================

ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view team rosters"
  ON team_players FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Team captains can manage their roster"
  ON team_players FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams
      WHERE captain_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can manage team rosters"
  ON team_players FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN leagues l ON t.league_id = l.id
      WHERE l.organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Team captains can update their roster"
  ON team_players FOR UPDATE
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE captain_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can update team rosters"
  ON team_players FOR UPDATE
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN leagues l ON t.league_id = l.id
      WHERE l.organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

-- DELETE: No policy (roster changes are permanent for historical data)

-- =====================================================
-- TABLE 14: matches (COMPLETE)
-- =====================================================

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view matches"
  ON matches FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can create matches"
  ON matches FOR INSERT
  WITH CHECK (
    season_week_id IN (
      SELECT sw.id FROM season_weeks sw
      JOIN seasons s ON sw.season_id = s.id
      JOIN leagues l ON s.league_id = l.id
      WHERE l.organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Authenticated users can update matches"
  ON matches FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Organization staff can delete matches"
  ON matches FOR DELETE
  USING (
    season_week_id IN (
      SELECT sw.id FROM season_weeks sw
      JOIN seasons s ON sw.season_id = s.id
      JOIN leagues l ON s.league_id = l.id
      WHERE l.organization_id IN (
        SELECT organization_id FROM organization_staff
        WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      )
    )
  );

-- =====================================================
-- TABLE 15: match_lineups (COMPLETE)
-- =====================================================

ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view match lineups"
  ON match_lineups FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create match lineups"
  ON match_lineups FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update match lineups"
  ON match_lineups FOR UPDATE
  USING (auth.role() = 'authenticated');

-- DELETE: No policy (lineups are permanent for historical data)

-- =====================================================
-- TABLE 16: match_games (COMPLETE)
-- =====================================================

ALTER TABLE match_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view match games"
  ON match_games FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create match games"
  ON match_games FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update match games"
  ON match_games FOR UPDATE
  USING (auth.role() = 'authenticated');

-- DELETE: No policy (game scores are permanent for historical data)

-- =====================================================
-- TABLE 17: conversations (COMPLETE)
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view conversations"
  ON conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Conversation participants can update conversations"
  ON conversations FOR UPDATE
  USING (
    id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- DELETE: No policy (conversations are permanent, use conversation_participants to leave)

-- =====================================================
-- TABLE 18: conversation_participants (COMPLETE)
-- =====================================================

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view other participants"
  ON conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can add participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Conversation participants can update participants"
  ON conversation_participants FOR UPDATE
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can remove others"
  ON conversation_participants FOR DELETE
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can remove themselves from conversations"
  ON conversation_participants FOR DELETE
  USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- =====================================================
-- TABLE 19: messages (COMPLETE)
-- =====================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can update messages"
  ON messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Message authors can delete their own messages"
  ON messages FOR DELETE
  USING (
    sender_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- =====================================================
-- TABLE 20: blocked_users (COMPLETE)
-- =====================================================

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own block list"
  ON blocked_users FOR SELECT
  USING (
    blocker_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can block other users"
  ON blocked_users FOR INSERT
  WITH CHECK (
    blocker_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own blocks"
  ON blocked_users FOR UPDATE
  USING (
    blocker_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can unblock users"
  ON blocked_users FOR DELETE
  USING (
    blocker_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- =====================================================
-- TABLE 21: user_reports (COMPLETE)
-- =====================================================

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporters can view their own reports"
  ON user_reports FOR SELECT
  USING (
    reporter_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Organization staff can view all reports"
  ON user_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create reports"
  ON user_reports FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Reporters can update their own reports"
  ON user_reports FOR UPDATE
  USING (
    reporter_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Organization staff can update reports"
  ON user_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- DELETE: No policy (reports are permanent for accountability)

-- =====================================================
-- TABLE 22: report_actions (COMPLETE)
-- =====================================================

ALTER TABLE report_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization staff can view report actions"
  ON report_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can create report actions"
  ON report_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can update report actions"
  ON report_actions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- DELETE: No policy (actions are permanent audit trail)

-- =====================================================
-- TABLE 23: report_updates (COMPLETE)
-- =====================================================

ALTER TABLE report_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization staff can view report updates"
  ON report_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can create report updates"
  ON report_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization staff can update report updates"
  ON report_updates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_staff
      WHERE member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- DELETE: No policy (updates are permanent audit trail)

-- =====================================================
-- TABLE 24: handicap_chart_3vs3 (COMPLETE)
-- =====================================================

ALTER TABLE handicap_chart_3vs3 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view handicap chart"
  ON handicap_chart_3vs3 FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: No policy (read-only table, hardcoded data)
-- UPDATE: No policy (read-only table, hardcoded data)
-- DELETE: No policy (read-only table, hardcoded data)

-- =====================================================
-- TABLE 25: venue_owners (COMPLETE)
-- =====================================================

ALTER TABLE venue_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view venue owners"
  ON venue_owners FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can register as venue owner"
  ON venue_owners FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Venue owners can update their own record"
  ON venue_owners FOR UPDATE
  USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Venue owners can remove themselves"
  ON venue_owners FOR DELETE
  USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );
