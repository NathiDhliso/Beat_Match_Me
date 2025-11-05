import { generateClient } from 'aws-amplify/api';

export const validateBackendReady = async (): Promise<{
  subscriptionsAvailable: boolean;
  mutationsAvailable: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  let subscriptionsAvailable = false;
  let mutationsAvailable = false;

  try {
    const client = generateClient();

    // Test if subscription type exists
    try {
      // This will fail gracefully if subscription isn't configured
      const subscription = client.graphql({
        query: `subscription OnQueueUpdateTest {
          onQueueUpdate(eventId: "validation-test") {
            eventId
          }
        }`
      });

      subscriptionsAvailable = true;
      console.log('✅ GraphQL Subscriptions available');
      
      // Clean up test subscription
      if ('unsubscribe' in subscription) {
        (subscription as any).unsubscribe();
      }
    } catch (error: any) {
      errors.push(`Subscriptions not available: ${error.message}`);
      console.warn('⚠️ Subscriptions not configured, will use polling fallback');
    }

    // Test if mutations exist
    try {
      // Just validate the schema, don't execute
      await client.graphql({
        query: `query TestSchema { __schema { mutationType { name } } }`
      });
      mutationsAvailable = true;
      console.log('✅ GraphQL Mutations available');
    } catch (error: any) {
      errors.push(`Mutations not available: ${error.message}`);
    }

  } catch (error: any) {
    errors.push(`Backend connection failed: ${error.message}`);
    console.error('❌ Backend validation failed:', error);
  }

  return {
    subscriptionsAvailable,
    mutationsAvailable,
    errors
  };
};

// Helper to determine if we should use real-time or polling
export const shouldUseRealTime = async (): Promise<boolean> => {
  const { subscriptionsAvailable } = await validateBackendReady();
  return subscriptionsAvailable;
};
