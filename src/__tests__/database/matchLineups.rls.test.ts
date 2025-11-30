/**
 * @fileoverview RLS Tests for Match Lineups Table
 *
 * Tests lineup management operations:
 * - Auto-creation via triggers
 * - Players assigning themselves to games
 * - Operators managing lineups
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createTestClient, getSingleResult } from '@/test/dbTestUtils';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

describe('Match Lineups Table - RLS Tests', () => {
  let client: SupabaseClient<Database>;
  let testLineupId: string;
  let testMatchId: string;

  beforeAll(async () => {
    client = createTestClient();

    // Get a test lineup
    const { data: lineup } = await client
      .from('match_lineups')
      .select('id, match_id')
      .limit(1)
      .single();

    if (lineup) {
      testLineupId = lineup.id;
      testMatchId = lineup.match_id;
    }
  });

  describe('SELECT Operations', () => {
    it('should allow viewing all match lineups', async () => {
      const { data, error } = await client
        .from('match_lineups')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should allow viewing lineup by id', async () => {
      if (!testLineupId) {
        console.warn('⚠️ No test lineup found, skipping test');
        return;
      }

      const { data, error } = await client
        .from('match_lineups')
        .select('*')
        .eq('id', testLineupId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should allow viewing lineups for a match', async () => {
      if (!testMatchId) {
        console.warn('⚠️ No test match found, skipping test');
        return;
      }

      const { data, error } = await client
        .from('match_lineups')
        .select('*')
        .eq('match_id', testMatchId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    // NOTE: Player join test removed - match_lineups has player1_id, player2_id, etc.
    // not a single player_id, so joining to "members" is ambiguous
    // This tests Supabase join syntax, not RLS. SELECT * test above is sufficient for RLS.
  });

  describe('UPDATE Operations - Player Assignments', () => {
    it('should allow updating lineup position', async () => {
      if (!testLineupId) {
        console.warn('⚠️ No test lineup found, skipping test');
        return;
      }

      const { data: before } = await client
        .from('match_lineups')
        .select('lineup_position')
        .eq('id', testLineupId)
        .single();

      const newPosition = before?.lineup_position === 1 ? 2 : 1;
      const { error } = await client
        .from('match_lineups')
        .update({ lineup_position: newPosition })
        .eq('id', testLineupId);

      expect(error).toBeNull();

      // Restore
      if (before) {
        await client
          .from('match_lineups')
          .update({ lineup_position: before.lineup_position })
          .eq('id', testLineupId);
      }
    });

    it('should allow assigning player to lineup slot', async () => {
      if (!testLineupId) {
        console.warn('⚠️ No test lineup found, skipping test');
        return;
      }

      const { data: before } = await client
        .from('match_lineups')
        .select('player_id')
        .eq('id', testLineupId)
        .single();

      // Get a player
      const { data: member } = await client
        .from('members')
        .select('id')
        .limit(1)
        .single();

      if (!member) return;

      const { error } = await client
        .from('match_lineups')
        .update({ player_id: member.id })
        .eq('id', testLineupId);

      expect(error).toBeNull();

      // Restore
      if (before) {
        await client
          .from('match_lineups')
          .update({ player_id: before.player_id })
          .eq('id', testLineupId);
      }
    });

    it('should allow updating is_substitute flag', async () => {
      if (!testLineupId) {
        console.warn('⚠️ No test lineup found, skipping test');
        return;
      }

      const { data: before } = await client
        .from('match_lineups')
        .select('is_substitute')
        .eq('id', testLineupId)
        .single();

      const newValue = !before?.is_substitute;
      const { error } = await client
        .from('match_lineups')
        .update({ is_substitute: newValue })
        .eq('id', testLineupId);

      expect(error).toBeNull();

      // Restore
      if (before !== null && before !== undefined) {
        await client
          .from('match_lineups')
          .update({ is_substitute: before.is_substitute })
          .eq('id', testLineupId);
      }
    });
  });

  describe('INSERT Operations', () => {
    it('should allow manually creating lineup entries', async () => {
      if (!testMatchId) {
        console.warn('⚠️ No test match found, skipping test');
        return;
      }

      // Get the team for this match
      const { data: match } = await client
        .from('matches')
        .select('home_team_id')
        .eq('id', testMatchId)
        .single();

      if (!match) return;

      const { data: newLineup, error } = await client
        .from('match_lineups')
        .insert({
          match_id: testMatchId,
          team_id: match.home_team_id,
          lineup_position: 99, // Test position
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(newLineup).toBeDefined();

      // Clean up
      if (newLineup) {
        await client
          .from('match_lineups')
          .delete()
          .eq('id', newLineup.id);
      }
    });
  });

  describe('DELETE Operations', () => {
    it('should allow deleting lineup entries', async () => {
      if (!testMatchId) {
        console.warn('⚠️ No test match found, skipping test');
        return;
      }

      // Create test lineup
      const { data: match } = await client
        .from('matches')
        .select('home_team_id')
        .eq('id', testMatchId)
        .single();

      if (!match) return;

      const { data: testLineup } = await client
        .from('match_lineups')
        .insert({
          match_id: testMatchId,
          team_id: match.home_team_id,
          lineup_position: 999,
        })
        .select()
        .single();

      if (!testLineup) return;

      // Delete it
      const { error } = await client
        .from('match_lineups')
        .delete()
        .eq('id', testLineup.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deleted } = await client
        .from('match_lineups')
        .select('*')
        .eq('id', testLineup.id)
        .single();

      expect(deleted).toBeNull();
    });
  });
});

describe('Preferences Tables - RLS Tests', () => {
  let client: SupabaseClient<Database>;
  let testLeagueId: string;
  let testOrgId: string;

  beforeAll(async () => {
    client = createTestClient();

    // Get a test league
    const { data: league } = await client
      .from('leagues')
      .select('id, organization_id')
      .limit(1)
      .single();

    if (league) {
      testLeagueId = league.id;
      testOrgId = league.organization_id;
    }
  });

  describe('Preferences Table - SELECT Operations', () => {
    it('should allow viewing all preferences', async () => {
      const { data, error } = await client
        .from('preferences')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should allow viewing preferences for a league', async () => {
      if (!testLeagueId) {
        console.warn('⚠️ No test league found, skipping test');
        return;
      }

      const { data, error } = await client
        .from('preferences')
        .select('*')
        .eq('league_id', testLeagueId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Preferences Table - INSERT/UPDATE Operations', () => {
    it('should allow creating preferences', async () => {
      if (!testLeagueId) {
        console.warn('⚠️ No test league found, skipping test');
        return;
      }

      const { data: newPref, error } = await client
        .from('preferences')
        .insert({
          league_id: testLeagueId,
          preference_type: 'custom',
          preference_action: 'ignore',
          preference_date: '2025-12-25',
          preference_name: 'Test Holiday',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(newPref).toBeDefined();

      // Clean up
      if (newPref) {
        await client
          .from('preferences')
          .delete()
          .eq('id', newPref.id);
      }
    });

    it('should allow updating preferences', async () => {
      if (!testLeagueId) {
        console.warn('⚠️ No test league found, skipping test');
        return;
      }

      // Get an existing preference
      const { data: pref } = await client
        .from('preferences')
        .select('id, preference_action')
        .eq('league_id', testLeagueId)
        .limit(1)
        .single();

      if (!pref) return;

      const newAction = pref.preference_action === 'blackout' ? 'ignore' : 'blackout';
      const { error } = await client
        .from('preferences')
        .update({ preference_action: newAction })
        .eq('id', pref.id);

      expect(error).toBeNull();

      // Restore
      await client
        .from('preferences')
        .update({ preference_action: pref.preference_action })
        .eq('id', pref.id);
    });
  });

  describe('Operator Blackout Preferences - SELECT Operations', () => {
    it('should allow viewing operator blackout preferences', async () => {
      const { data, error } = await client
        .from('operator_blackout_preferences')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should allow viewing blackouts for an organization', async () => {
      if (!testOrgId) {
        console.warn('⚠️ No test organization found, skipping test');
        return;
      }

      const { data, error } = await client
        .from('operator_blackout_preferences')
        .select('*')
        .eq('organization_id', testOrgId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Operator Blackout Preferences - INSERT/UPDATE Operations', () => {
    it('should allow creating blackout preferences', async () => {
      if (!testOrgId) {
        console.warn('⚠️ No test organization found, skipping test');
        return;
      }

      const { data: newBlackout, error } = await client
        .from('operator_blackout_preferences')
        .insert({
          organization_id: testOrgId,
          blackout_date: '2025-12-25',
          blackout_name: 'Test Blackout',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(newBlackout).toBeDefined();

      // Clean up
      if (newBlackout) {
        await client
          .from('operator_blackout_preferences')
          .delete()
          .eq('id', newBlackout.id);
      }
    });

    it('should allow updating blackout preferences', async () => {
      if (!testOrgId) {
        console.warn('⚠️ No test organization found, skipping test');
        return;
      }

      // Get an existing blackout
      const { data: blackout } = await client
        .from('operator_blackout_preferences')
        .select('id, blackout_name')
        .eq('organization_id', testOrgId)
        .limit(1)
        .single();

      if (!blackout) return;

      const { error } = await client
        .from('operator_blackout_preferences')
        .update({ blackout_name: 'Updated Blackout' })
        .eq('id', blackout.id);

      expect(error).toBeNull();

      // Restore
      await client
        .from('operator_blackout_preferences')
        .update({ blackout_name: blackout.blackout_name })
        .eq('id', blackout.id);
    });
  });
});
