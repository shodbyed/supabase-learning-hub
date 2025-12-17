/**
 * @fileoverview Test script for placeholder player search functionality
 *
 * Runs various test scenarios against the database to demonstrate
 * how the search_placeholder_matches_v2 function works with different
 * levels of information provided.
 *
 * Run with: pnpm tsx scripts/test-placeholder-search.ts
 */

import { createClient } from '@supabase/supabase-js';

// Connect directly to local Supabase
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

interface TestCase {
  name: string;
  description: string;
  expectedGrade: 'A' | 'B' | 'C' | 'none';
  criteria: Record<string, string | number | boolean | null>;
}

// Test cases based on actual data in the database
// NOTE: This function uses EXACT matching (not fuzzy/soundex)
// NOTE: Requires minimum 4 fields to be provided
const testCases: TestCase[] = [
  // ============================================================================
  // GRADE A TESTS (6+ matches - should auto-merge)
  // ============================================================================
  {
    name: 'Grade A: Perfect match with many fields',
    description: 'James Anderson on Team 2 with captain Captainzo Two - all info correct',
    expectedGrade: 'A',
    criteria: {
      p_system_first_name: 'James',
      p_system_last_name: 'Anderson',
      p_system_player_number: 3,
      p_system_nickname: 'Jimmy',
      p_team_name: 'Team 2',
      p_captain_first_name: 'Captainzo',
      p_captain_last_name: 'Two',
      p_city: 'Miami',
      p_state: 'FL',
    },
  },
  {
    name: 'Grade A: Name + Team + Captain + Location',
    description: 'Keith Bustamante with full info - should reach 6+ matches',
    expectedGrade: 'A',
    criteria: {
      p_system_first_name: 'Keith',
      p_system_last_name: 'Bustamante',
      p_system_nickname: 'Busta',
      p_system_player_number: 119,
      p_team_name: 'Team 2',
      p_captain_first_name: 'Captainzo',
      p_city: 'Port St. Lucie',
      p_state: 'FL',
    },
  },

  // ============================================================================
  // GRADE B TESTS (4-5 matches - needs LO review)
  // ============================================================================
  {
    name: 'Grade B: Name + City + State + Nickname (5 matches)',
    description: 'Keith Bustamante - knows name and location but not team/captain',
    expectedGrade: 'B',
    criteria: {
      p_system_first_name: 'Keith',
      p_system_last_name: 'Bustamante',
      p_city: 'Port St. Lucie',
      p_state: 'FL',
      p_system_nickname: 'Busta',
    },
  },
  {
    name: 'Grade B: Name + Team + Captain (4 matches, wrong city)',
    description: 'Evelyn Barrera - knows team/captain but has wrong city',
    expectedGrade: 'B',
    criteria: {
      p_system_first_name: 'Evelyn',
      p_system_last_name: 'Barrera',
      p_team_name: 'Team 2',
      p_captain_first_name: 'Captainzo',
      p_city: 'Tampa', // Wrong city - she's in Clearwater
    },
  },
  {
    name: 'Grade B: Exact name match with player number (4 matches)',
    description: 'Michael Hernandez with exact first name (not "Mike")',
    expectedGrade: 'B',
    criteria: {
      p_system_first_name: 'Michael', // Exact match required
      p_system_last_name: 'Hernandez',
      p_system_player_number: 7,
      p_city: 'Miami Beach',
      p_state: 'FL',
    },
  },

  // ============================================================================
  // GRADE C TESTS (<4 matches - no confident match)
  // ============================================================================
  {
    name: 'Grade C: 3 matches only',
    description: 'Carl Blanco - name + state = 3 matches',
    expectedGrade: 'C',
    criteria: {
      p_system_first_name: 'Carl',
      p_system_last_name: 'Blanco',
      p_state: 'FL',
      p_city: 'Wrong City', // Won't match, so only 3 points
    },
  },

  // ============================================================================
  // NO RESULTS TESTS (minimum fields not met OR no matches)
  // ============================================================================
  {
    name: 'No Results: Only 2 fields provided (below minimum)',
    description: 'Daniel Ramirez - only knows their own name (need 4 min)',
    expectedGrade: 'none',
    criteria: {
      p_system_first_name: 'Daniel',
      p_system_last_name: 'Ramirez',
    },
  },
  {
    name: 'Grade C: 4 fields but nothing matches well',
    description: 'Searching with wrong info - fuzzy may find weak matches (Grade C)',
    expectedGrade: 'C',
    criteria: {
      p_system_first_name: 'John',
      p_system_last_name: 'Smith',
      p_city: 'New York',
      p_state: 'NY',
    },
  },
  {
    name: 'No Results: Only 3 fields provided (below minimum)',
    description: 'Typo in name - but only 3 fields so rejected',
    expectedGrade: 'none',
    criteria: {
      p_system_first_name: 'Jmaes', // Typo
      p_system_last_name: 'Andersen', // Wrong spelling
      p_state: 'FL',
    },
  },
  {
    name: 'Grade C: Person not in system - fuzzy may find weak matches',
    description: 'Soundex can find phonetic similarities even with unusual names',
    expectedGrade: 'C',
    criteria: {
      p_system_first_name: 'Zebediah',
      p_system_last_name: 'Xylophone',
      p_city: 'Atlantis',
      p_state: 'XX',
    },
  },
  {
    name: 'No Results: Only 1 field (player number)',
    description: 'User only knows their player number - not enough fields',
    expectedGrade: 'none',
    criteria: {
      p_system_player_number: 119, // Keith Bustamante's number
    },
  },

  // ============================================================================
  // EDGE CASE TESTS - Demonstrating exact match behavior
  // ============================================================================
  {
    name: 'Edge: Nickname vs First Name (exact match only)',
    description: 'Mike does NOT match Michael - exact matching only',
    expectedGrade: 'B', // lastName, playerNumber, city, state = 4
    criteria: {
      p_system_first_name: 'Mike', // Won't match "Michael"
      p_system_last_name: 'Hernandez',
      p_system_player_number: 7,
      p_city: 'Miami Beach',
      p_state: 'FL',
    },
  },
  {
    name: 'Edge: City typo (exact match only)',
    description: 'Tamppa does NOT match Tampa - no fuzzy matching',
    expectedGrade: 'C', // firstName, lastName, state = 3
    criteria: {
      p_system_first_name: 'Ashley',
      p_system_last_name: 'Reyes',
      p_city: 'Tamppa', // Won't match "Tampa"
      p_state: 'FL',
      p_team_name: 'Wrong Team', // Need 4 fields min
    },
  },
  {
    name: 'Edge: Case insensitive matching',
    description: 'JAMES should match James (case insensitive)',
    expectedGrade: 'B',
    criteria: {
      p_system_first_name: 'JAMES',
      p_system_last_name: 'ANDERSON',
      p_city: 'MIAMI',
      p_state: 'fl', // lowercase
    },
  },
];

async function runTests() {
  console.log('='.repeat(80));
  console.log('PLACEHOLDER PLAYER SEARCH TEST RESULTS');
  console.log('='.repeat(80));
  console.log('');

  for (const test of testCases) {
    console.log('-'.repeat(80));
    console.log(`TEST: ${test.name}`);
    console.log(`DESC: ${test.description}`);
    console.log(`EXPECTED: Grade ${test.expectedGrade.toUpperCase()}`);
    console.log('');

    // Build the RPC call parameters - set all to null first
    const params: Record<string, string | number | boolean | null> = {
      p_operator_first_name: null,
      p_operator_last_name: null,
      p_operator_player_number: null,
      p_captain_first_name: null,
      p_captain_last_name: null,
      p_captain_player_number: null,
      p_system_first_name: null,
      p_system_last_name: null,
      p_system_player_number: null,
      p_system_nickname: null,
      p_team_name: null,
      p_play_night: null,
      p_city: null,
      p_state: null,
      p_last_opponent_first_name: null,
      p_last_opponent_last_name: null,
      p_has_not_played_yet: null,
      p_limit: 5,
    };

    // Apply test criteria
    Object.assign(params, test.criteria);

    // Show what we're searching with
    const filledParams = Object.entries(test.criteria)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join('\n');
    console.log('SEARCH CRITERIA:');
    console.log(filledParams);
    console.log('');

    try {
      const { data, error } = await supabase.rpc('search_placeholder_matches_v2', params);

      if (error) {
        console.log(`ERROR: ${error.message}`);
        console.log('');
        continue;
      }

      if (!data || data.length === 0) {
        console.log('RESULT: No matches found');
        const passed = test.expectedGrade === 'none';
        console.log(`STATUS: ${passed ? '✅ PASS' : '❌ FAIL'} (expected ${test.expectedGrade})`);
      } else {
        console.log(`RESULT: ${data.length} match(es) found`);
        console.log('');

        // Show top result
        const top = data[0];
        console.log('TOP MATCH:');
        console.log(`  Name: ${top.first_name} ${top.last_name} (P-${top.system_player_number})`);
        console.log(`  Location: ${top.city}, ${top.state}`);
        console.log(`  Team: ${top.team_name || 'N/A'}`);
        console.log(`  Captain: ${top.captain_name || 'N/A'}`);
        console.log(`  Score: ${top.total_score}`);
        console.log(`  Grade: ${top.grade}`);
        console.log(`  Matched Fields: ${top.matched_fields?.join(', ') || 'none'}`);

        const passed = top.grade === test.expectedGrade;
        console.log('');
        console.log(`STATUS: ${passed ? '✅ PASS' : '❌ FAIL'} (expected ${test.expectedGrade}, got ${top.grade})`);
      }
    } catch (err) {
      console.log(`EXCEPTION: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    console.log('');
  }

  console.log('='.repeat(80));
  console.log('TEST RUN COMPLETE');
  console.log('='.repeat(80));
}

runTests().catch(console.error);
