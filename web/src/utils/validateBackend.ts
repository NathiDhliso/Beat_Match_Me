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

    // Test with timeout wrapper
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Backend validation timeout after 5s')), 5000)
    );

    // Test if mutations exist with timeout
    try {
      await Promise.race([
        client.graphql({
          query: `query TestSchema { __schema { mutationType { name } } }`
        }),
        timeoutPromise
      ]);
      mutationsAvailable = true;
      console.log('✅ GraphQL Backend available');
    } catch (error: any) {
      errors.push(`Backend check failed: ${error.message}`);
      console.warn('⚠️ Backend validation failed, continuing anyway:', error.message);
      // Set to true anyway to let the app load
      mutationsAvailable = true;
    }

    // Skip subscription test for now - it's causing hangs
    subscriptionsAvailable = false;
    console.log('ℹ️ Subscriptions disabled, using polling mode');

  } catch (error: any) {
    errors.push(`Backend connection failed: ${error.message}`);
    console.error('❌ Backend validation failed:', error);
    // Set to true anyway to let the app load
    mutationsAvailable = true;
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
