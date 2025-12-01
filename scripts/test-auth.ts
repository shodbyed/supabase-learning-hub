/**
 * Quick test to verify authenticated users can sign in
 */

import { createAuthenticatedClient } from '../src/test/dbTestUtils';

async function testAuth() {
  console.log('Testing authentication...\n');

  try {
    const playerClient = await createAuthenticatedClient('player');
    const { data: { user } } = await playerClient.auth.getUser();
    console.log('✓ Player authenticated:', user?.email);

    const operatorClient = await createAuthenticatedClient('operator');
    const { data: { user: opUser } } = await operatorClient.auth.getUser();
    console.log('✓ Operator authenticated:', opUser?.email);

    console.log('\n✓ All test users can authenticate!');
  } catch (error) {
    console.error('✗ Authentication failed:', error);
  }
}

testAuth();
