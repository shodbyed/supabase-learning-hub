/**
 * @fileoverview Quick test for team verification function
 * Run with: pnpm tsx scripts/test-team-verification.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testTeamVerification() {
  console.log('Testing get_team_verification_options...\n');

  // First, find a PP member who is on a team
  const { data: ppOnTeam, error: ppError } = await supabase
    .from('team_players')
    .select('member_id, members!inner(id, first_name, last_name, user_id)')
    .is('members.user_id', null)
    .limit(1)
    .single();

  if (ppError || !ppOnTeam) {
    console.log('Could not find a placeholder player on a team:', ppError?.message);
    return;
  }

  const member = (ppOnTeam as { member_id: string; members: { id: string; first_name: string; last_name: string } }).members;
  console.log(`Found PP on team: ${member.first_name} ${member.last_name} (${member.id})`);

  // Now test the verification function
  const { data: options, error: verifyError } = await supabase.rpc('get_team_verification_options', {
    p_member_id: member.id,
    p_decoy_count: 3,
  });

  if (verifyError) {
    console.log('Error calling get_team_verification_options:', verifyError.message);
    return;
  }

  console.log('\nVerification options returned:');
  console.log('-'.repeat(50));

  if (!options || options.length === 0) {
    console.log('No options returned!');
    return;
  }

  for (const opt of options as { team_name: string; is_correct: boolean }[]) {
    const marker = opt.is_correct ? '✓ CORRECT' : '✗ DECOY';
    console.log(`  ${marker}: ${opt.team_name}`);
  }

  const correctCount = (options as { is_correct: boolean }[]).filter(o => o.is_correct).length;
  const decoyCount = (options as { is_correct: boolean }[]).filter(o => !o.is_correct).length;

  console.log('-'.repeat(50));
  console.log(`Total: ${options.length} options (${correctCount} correct, ${decoyCount} decoys)`);
  console.log('\nTest completed successfully!');
}

testTeamVerification().catch(console.error);
