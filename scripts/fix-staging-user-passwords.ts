/**
 * @fileoverview Create or Fix Staging User Passwords
 *
 * This script handles the 32 staging test users from seed_staging_users.sql:
 * - If the user exists: updates their password
 * - If the user doesn't exist: creates them with the correct password and member record
 *
 * This uses Supabase's auth admin API to properly create/update users with
 * working passwords (avoiding the invalid bcrypt hash issue in the SQL seed).
 *
 * Usage:
 *   Local:   pnpm tsx scripts/fix-staging-user-passwords.ts
 *   Staging: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx pnpm tsx scripts/fix-staging-user-passwords.ts
 *
 * Password for all users: test-password-123
 */

import { createClient } from '@supabase/supabase-js';

// Get configuration from environment variables or use local defaults
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Determine which environment we're targeting
const isLocal = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
const environment = isLocal ? 'LOCAL' : 'STAGING';

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// The password we want all staging users to have
const PASSWORD = 'test-password-123';

// All 32 staging users with their details
interface StagingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
}

const stagingUsers: StagingUser[] = [
  { id: 'a0000001-0001-0001-0001-000000000001', email: 'eliseo.sandoval@test.com', firstName: 'Eliseo', lastName: 'Sandoval', nickname: 'EliseoS', phone: '555-101-0001', address: '101 Palm Beach Blvd', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1985-03-15' },
  { id: 'a0000001-0001-0001-0001-000000000002', email: 'john.finley@test.com', firstName: 'John', lastName: 'Finley', nickname: 'JohnF', phone: '555-101-0002', address: '202 Coconut Dr', city: 'Naples', state: 'FL', zipCode: '34102', dateOfBirth: '1978-07-22' },
  { id: 'a0000001-0001-0001-0001-000000000003', email: 'jose.sanabria@test.com', firstName: 'Jose', lastName: 'Sanabria', nickname: 'JoseS', phone: '555-101-0003', address: '303 Gulf Shore Blvd', city: 'Bonita Springs', state: 'FL', zipCode: '34134', dateOfBirth: '1990-11-08' },
  { id: 'a0000001-0001-0001-0001-000000000004', email: 'paul.runyan@test.com', firstName: 'Paul', lastName: 'Runyan', nickname: 'PaulR', phone: '555-101-0004', address: '404 Estero Blvd', city: 'Fort Myers Beach', state: 'FL', zipCode: '33931', dateOfBirth: '1982-05-30' },
  { id: 'a0000001-0001-0001-0001-000000000005', email: 'margie.sandoval@test.com', firstName: 'Margie', lastName: 'Sandoval', nickname: 'MargieS', phone: '555-101-0005', address: '505 McGregor Blvd', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1988-09-12' },
  { id: 'a0000001-0001-0001-0001-000000000006', email: 'david.grimes@test.com', firstName: 'David', lastName: 'Grimes', nickname: 'DavidG', phone: '555-101-0006', address: '606 Colonial Blvd', city: 'Fort Myers', state: 'FL', zipCode: '33907', dateOfBirth: '1975-12-03' },
  { id: 'a0000001-0001-0001-0001-000000000007', email: 'kristine.guzman@test.com', firstName: 'Kristine', lastName: 'Guzman', nickname: 'KristineG', phone: '555-101-0007', address: '707 Daniels Pkwy', city: 'Fort Myers', state: 'FL', zipCode: '33912', dateOfBirth: '1992-04-18' },
  { id: 'a0000001-0001-0001-0001-000000000008', email: 'donnie.sandoval@test.com', firstName: 'Donnie', lastName: 'Sandoval', nickname: 'DonnieS', phone: '555-101-0008', address: '808 Metro Pkwy', city: 'Fort Myers', state: 'FL', zipCode: '33966', dateOfBirth: '1995-08-25' },
  { id: 'a0000001-0001-0001-0001-000000000009', email: 'tim.carpenter@test.com', firstName: 'Tim', lastName: 'Carpenter', nickname: 'TimC', phone: '555-101-0009', address: '909 Summerlin Rd', city: 'Fort Myers', state: 'FL', zipCode: '33931', dateOfBirth: '1980-01-14' },
  { id: 'a0000001-0001-0001-0001-000000000010', email: 'gynn.hathaway@test.com', firstName: 'Gynn', lastName: 'Hathaway', nickname: 'GynnH', phone: '555-101-0010', address: '1010 Six Mile Cypress', city: 'Fort Myers', state: 'FL', zipCode: '33912', dateOfBirth: '1987-06-07' },
  { id: 'a0000001-0001-0001-0001-000000000011', email: 'gerald.knierim@test.com', firstName: 'Gerald', lastName: 'Knierim', nickname: 'GeraldK', phone: '555-101-0011', address: '1111 Gladiolus Dr', city: 'Fort Myers', state: 'FL', zipCode: '33908', dateOfBirth: '1973-10-29' },
  { id: 'a0000001-0001-0001-0001-000000000012', email: 'hotrod.zalewski@test.com', firstName: 'Hot Rod', lastName: 'Zalewski', nickname: 'HotRodZ', phone: '555-101-0012', address: '1212 Winkler Ave', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1970-02-16' },
  { id: 'a0000001-0001-0001-0001-000000000013', email: 'trent.bailey@test.com', firstName: 'Trent', lastName: 'Bailey', nickname: 'TrentB', phone: '555-101-0013', address: '1313 Cleveland Ave', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1993-07-11' },
  { id: 'a0000001-0001-0001-0001-000000000014', email: 'rick.bergevinjr@test.com', firstName: 'Rick', lastName: 'Bergevin Jr.', nickname: 'RickB', phone: '555-101-0014', address: '1414 Fowler St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1991-03-28' },
  { id: 'a0000001-0001-0001-0001-000000000015', email: 'mike.patten@test.com', firstName: 'Mike', lastName: 'Patten', nickname: 'MikeP', phone: '555-101-0015', address: '1515 Edison Ave', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1984-11-19' },
  { id: 'a0000001-0001-0001-0001-000000000016', email: 'rick.bergevinsr@test.com', firstName: 'Rick', lastName: 'Bergevin Sr.', nickname: 'RickB', phone: '555-101-0016', address: '1616 First St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1965-09-05' },
  { id: 'a0000001-0001-0001-0001-000000000017', email: 'johnny.braxton@test.com', firstName: 'Johnny', lastName: 'Braxton', nickname: 'JohnnyB', phone: '555-101-0017', address: '1717 Second St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1977-04-23' },
  { id: 'a0000001-0001-0001-0001-000000000018', email: 'ed.phillips@test.com', firstName: 'Ed', lastName: 'Phillips', nickname: 'EdP', phone: '555-101-0018', address: '1818 Broadway', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1969-12-31' },
  { id: 'a0000001-0001-0001-0001-000000000019', email: 'jimmy.newsome@test.com', firstName: 'Jimmy', lastName: 'Newsome', nickname: 'JimmyN', phone: '555-101-0019', address: '1919 Main St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1981-08-17' },
  { id: 'a0000001-0001-0001-0001-000000000020', email: 'melinda.newsome@test.com', firstName: 'Melinda', lastName: 'Newsome', nickname: 'MelindaN', phone: '555-101-0020', address: '2020 Main St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1983-05-09' },
  { id: 'a0000001-0001-0001-0001-000000000021', email: 'ed.carle@test.com', firstName: 'Ed', lastName: 'Carle', nickname: 'EdC', phone: '555-101-0021', address: '2121 Bay St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1972-02-28' },
  { id: 'a0000001-0001-0001-0001-000000000022', email: 'bill.holly@test.com', firstName: 'Bill', lastName: 'Holly', nickname: 'BillH', phone: '555-101-0022', address: '2222 Oak St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1968-10-14' },
  { id: 'a0000001-0001-0001-0001-000000000023', email: 'oren.gomez@test.com', firstName: 'Oren', lastName: 'Gomez', nickname: 'OrenG', phone: '555-101-0023', address: '2323 Pine St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1994-06-21' },
  { id: 'a0000001-0001-0001-0001-000000000024', email: 'sherie.grayling@test.com', firstName: 'Sherie', lastName: 'Grayling', nickname: 'SherieG', phone: '555-101-0024', address: '2424 Maple St', city: 'Fort Myers', state: 'FL', zipCode: '33901', dateOfBirth: '1986-01-07' },
  { id: 'a0000001-0001-0001-0001-000000000025', email: 'justin.whidden@test.com', firstName: 'Justin', lastName: 'Whidden', nickname: 'JustinW', phone: '555-101-0025', address: '2525 Cedar St', city: 'Cape Coral', state: 'FL', zipCode: '33904', dateOfBirth: '1989-09-30' },
  { id: 'a0000001-0001-0001-0001-000000000026', email: 'ed.poplet@test.com', firstName: 'Ed', lastName: 'Poplet', nickname: 'EdP', phone: '555-101-0026', address: '2626 Del Prado Blvd', city: 'Cape Coral', state: 'FL', zipCode: '33904', dateOfBirth: '1979-03-12' },
  { id: 'a0000001-0001-0001-0001-000000000027', email: 'glenn.lewis@test.com', firstName: 'Glenn', lastName: 'Lewis', nickname: 'ShaneL', phone: '555-101-0027', address: '2727 Santa Barbara Blvd', city: 'Cape Coral', state: 'FL', zipCode: '33914', dateOfBirth: '1976-07-04' },
  { id: 'a0000001-0001-0001-0001-000000000028', email: 'derek.samuels@test.com', firstName: 'Derek', lastName: 'Samuels', nickname: 'DerekS', phone: '555-101-0028', address: '2828 Chiquita Blvd', city: 'Cape Coral', state: 'FL', zipCode: '33914', dateOfBirth: '1996-11-22' },
  { id: 'a0000001-0001-0001-0001-000000000029', email: 'kelvin.singleton@test.com', firstName: 'Kelvin', lastName: 'Singleton', nickname: 'KelvinS', phone: '555-101-0029', address: '2929 Skyline Blvd', city: 'Cape Coral', state: 'FL', zipCode: '33914', dateOfBirth: '1988-04-15' },
  { id: 'a0000001-0001-0001-0001-000000000030', email: 'mike.stepp@test.com', firstName: 'Mike', lastName: 'Stepp', nickname: 'MikeS', phone: '555-101-0030', address: '3030 Veterans Pkwy', city: 'Cape Coral', state: 'FL', zipCode: '33914', dateOfBirth: '1974-08-08' },
  { id: 'a0000001-0001-0001-0001-000000000031', email: 'craig.pickard@test.com', firstName: 'Craig', lastName: 'Pickard', nickname: 'CraigP', phone: '555-101-0031', address: '3131 Country Club Blvd', city: 'Cape Coral', state: 'FL', zipCode: '33990', dateOfBirth: '1971-12-25' },
  { id: 'a0000001-0001-0001-0001-000000000032', email: 'justine.valentine@test.com', firstName: 'Justine', lastName: 'Valentine', nickname: 'JustineV', phone: '555-101-0032', address: '3232 Coronado Pkwy', city: 'Cape Coral', state: 'FL', zipCode: '33904', dateOfBirth: '1997-02-14' },
];

/**
 * Creates a member record for a user
 */
async function createMemberRecord(user: StagingUser, authUserId: string): Promise<boolean> {
  const { error } = await supabase.from('members').insert({
    user_id: authUserId,
    first_name: user.firstName,
    last_name: user.lastName,
    nickname: user.nickname,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    zip_code: user.zipCode,
    date_of_birth: user.dateOfBirth,
    role: 'player',
  });

  if (error) {
    // Might already exist via user_id constraint
    if (error.code === '23505') {
      return true; // Already exists, that's fine
    }
    console.error(`    ❌ Member record error: ${error.message}`);
    return false;
  }
  return true;
}

/**
 * Creates or updates all staging users
 */
async function setupStagingUsers() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log(`║    Setting Up Staging Test Users (${environment})              ║`);
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║ URL: ${supabaseUrl.substring(0, 45).padEnd(50)}║`);
  console.log(`║ Target: ${stagingUsers.length} users                                     ║`);
  console.log(`║ Password: ${PASSWORD}                          ║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const user of stagingUsers) {
    // Check if user exists by ID first
    const { data: existingUser } = await supabase.auth.admin.getUserById(user.id);

    if (existingUser?.user) {
      // User exists with expected ID - update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: PASSWORD,
      });

      if (updateError) {
        console.log(`❌ Failed to update ${user.email}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`✓  Updated: ${user.email}`);
        updatedCount++;
      }
    } else {
      // Check if user exists by email (might have different ID)
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingByEmail = users?.find(u => u.email === user.email);

      if (existingByEmail) {
        // User exists with different ID - update password
        const { error: updateErr } = await supabase.auth.admin.updateUserById(existingByEmail.id, {
          password: PASSWORD,
        });
        if (updateErr) {
          console.log(`❌ Failed to update ${user.email}: ${updateErr.message}`);
          errorCount++;
        } else {
          console.log(`✓  Updated: ${user.email} (existing user)`);
          updatedCount++;
        }
      } else {
        // User doesn't exist - create them
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: PASSWORD,
          email_confirm: true,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
          },
        });

        if (createError) {
          console.log(`❌ Failed to create ${user.email}: ${createError.message}`);
          errorCount++;
          continue;
        }

        if (newUser?.user) {
          console.log(`✓  Created: ${user.email}`);
          // Create member record
          const memberCreated = await createMemberRecord(user, newUser.user.id);
          if (memberCreated) {
            console.log(`    ✓  Member record created`);
          }
          createdCount++;
        }
      }
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║    Summary                                             ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  if (createdCount > 0) {
    console.log(`║ ✓ Created: ${createdCount.toString().padEnd(44)}║`);
  }
  if (updatedCount > 0) {
    console.log(`║ ✓ Updated: ${updatedCount.toString().padEnd(44)}║`);
  }
  if (errorCount > 0) {
    console.log(`║ ❌ Errors:  ${errorCount.toString().padEnd(44)}║`);
  }
  if (createdCount === 0 && updatedCount === 0 && errorCount === 0) {
    console.log(`║ No changes made                                        ║`);
  }
  console.log('╚════════════════════════════════════════════════════════╝');

  if (createdCount > 0 || updatedCount > 0) {
    console.log('\n📝 Login credentials:');
    console.log('   Email: firstname.lastname@test.com');
    console.log('   Password: test-password-123');
    console.log('\n   Examples:');
    console.log('   - eliseo.sandoval@test.com / test-password-123');
    console.log('   - john.finley@test.com / test-password-123');
    console.log('   - ed.poplet@test.com / test-password-123');
  }
}

// Run the script
setupStagingUsers().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
