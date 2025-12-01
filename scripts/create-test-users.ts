/**
 * @fileoverview Create test users for RLS testing
 *
 * Run this script to create authenticated test users that can be used
 * in RLS tests with createAuthenticatedClient()
 *
 * Usage: pnpm tsx scripts/create-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: 'player@test.com',
    password: 'test-password-123',
    firstName: 'Test',
    lastName: 'Player',
    role: 'player' as const,
    systemPlayerNumber: 100001,
  },
  {
    email: 'operator@test.com',
    password: 'test-password-123',
    firstName: 'Test',
    lastName: 'Operator',
    role: 'league_operator' as const,
    systemPlayerNumber: 100002,
  },
  {
    email: 'captain@test.com',
    password: 'test-password-123',
    firstName: 'Test',
    lastName: 'Captain',
    role: 'player' as const,
    systemPlayerNumber: 100003,
  },
  {
    email: 'owner@test.com',
    password: 'test-password-123',
    firstName: 'Test',
    lastName: 'Owner',
    role: 'league_operator' as const,
    systemPlayerNumber: 100004,
  },
];

async function createTestUsers() {
  console.log('Creating test users for RLS testing...\n');

  for (const user of testUsers) {
    console.log(`Creating user: ${user.email}`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log(`  ✓ User already exists, skipping...`);
        continue;
      }
      console.error(`  ✗ Error creating auth user:`, authError);
      continue;
    }

    console.log(`  ✓ Auth user created: ${authData.user?.id}`);

    // Create member record
    const { error: memberError } = await supabase.from('members').insert({
      user_id: authData.user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      phone: `555-000${testUsers.indexOf(user) + 1}`,
      address: '123 Test Street',
      city: 'Test City',
      state: 'TX',
      zip_code: '12345',
      date_of_birth: '1990-01-01',
      role: user.role,
      system_player_number: user.systemPlayerNumber,
    });

    if (memberError) {
      console.error(`  ✗ Error creating member:`, memberError);
    } else {
      console.log(`  ✓ Member record created`);
    }

    console.log('');
  }

  console.log('Done!');
}

createTestUsers().catch(console.error);
