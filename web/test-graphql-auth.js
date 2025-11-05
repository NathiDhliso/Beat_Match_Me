/**
 * Test GraphQL Authentication
 * 
 * This script tests if you can make authenticated GraphQL queries.
 * Run this in the browser console after signing in.
 * 
 * Usage:
 * 1. Sign in to the web app
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 
 * Expected output:
 * - ✅ "Authentication test passed!"
 * - List of events or empty array
 */

(async () => {
  console.log('🔍 Testing GraphQL Authentication...\n');

  try {
    // Step 1: Check if user is authenticated
    console.log('Step 1: Checking authentication...');
    const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth');
    
    const user = await getCurrentUser();
    console.log('✅ User authenticated:', {
      userId: user.userId,
      username: user.username,
    });

    // Step 2: Check session tokens
    console.log('\nStep 2: Checking session tokens...');
    const session = await fetchAuthSession();
    console.log('✅ Session tokens:', {
      idToken: !!session.tokens?.idToken,
      accessToken: !!session.tokens?.accessToken,
    });

    if (!session.tokens?.idToken) {
      throw new Error('❌ No ID token found! Sign out and sign back in.');
    }

    // Step 3: Test GraphQL query
    console.log('\nStep 3: Testing GraphQL query...');
    const { generateClient } = await import('aws-amplify/api');
    const client = generateClient();

    const response = await client.graphql({
      query: `
        query ListActiveEvents {
          listActiveEvents {
            items {
              eventId
              venueName
              status
              startTime
              createdBy
            }
          }
        }
      `
    });

    console.log('✅ GraphQL query successful!');
    console.log('Response:', response);
    console.log('\nEvents:', response.data.listActiveEvents?.items || []);
    
    if (response.data.listActiveEvents?.items?.length === 0) {
      console.log('\nℹ️ No active events found. This is expected if no DJ has created events yet.');
    }

    console.log('\n✅ Authentication test PASSED! You can make authenticated GraphQL queries.');
    
  } catch (error) {
    console.error('\n❌ Authentication test FAILED!');
    console.error('Error:', error);
    
    if (error.message?.includes('not authenticated') || error.message?.includes('No current user')) {
      console.log('\n💡 Fix: You need to sign in first.');
    } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.log('\n💡 Fix: Sign out and sign back in to refresh your tokens.');
    } else if (error.errors) {
      console.error('\nGraphQL Errors:', error.errors);
      console.log('\n💡 Fix: Check the error messages above for specific issues.');
    } else {
      console.log('\n💡 Fix: See error details above.');
    }
  }
})();
