/**
 * GraphQL Query Wrapper with Timeout
 * Prevents hanging queries by adding configurable timeouts
 */

import { generateClient } from 'aws-amplify/api';

export interface GraphQLOptions {
  query: string;
  variables?: Record<string, any>;
  timeout?: number; // milliseconds, default 10000 (10s)
}

/**
 * Execute a GraphQL query with timeout protection
 * @param options - Query, variables, and optional timeout
 * @returns Promise with query result
 * @throws Error if timeout is reached or query fails
 */
export async function graphqlWithTimeout<T = any>(options: GraphQLOptions): Promise<T> {
  const { query, variables = {}, timeout = 10000 } = options;
  
  const client = generateClient();
  
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`GraphQL query timeout after ${timeout}ms`)), timeout)
  );
  
  const queryPromise = client.graphql({
    query,
    variables
  });
  
  try {
    const result: any = await Promise.race([queryPromise, timeoutPromise]);
    return result.data as T;
  } catch (error: any) {
    console.error('GraphQL query error:', error.message);
    throw error;
  }
}

/**
 * Execute a GraphQL mutation with timeout protection
 * @param options - Mutation query, variables, and optional timeout
 * @returns Promise with mutation result
 */
export async function mutationWithTimeout<T = any>(options: GraphQLOptions): Promise<T> {
  // Mutations might take longer, so default to 15s
  const { timeout = 15000, ...rest } = options;
  return graphqlWithTimeout<T>({ ...rest, timeout });
}

/**
 * Batch execute multiple GraphQL queries with individual timeouts
 * @param queries - Array of query options
 * @returns Promise with array of results (or errors)
 */
export async function batchGraphQLQueries<T = any>(
  queries: GraphQLOptions[]
): Promise<Array<T | Error>> {
  return Promise.allSettled(
    queries.map(query => graphqlWithTimeout<T>(query))
  ).then(results =>
    results.map(result =>
      result.status === 'fulfilled' ? result.value : result.reason
    )
  );
}

/**
 * Retry wrapper for GraphQL queries with exponential backoff
 * @param options - Query options
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise with query result
 */
export async function graphqlWithRetry<T = any>(
  options: GraphQLOptions,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await graphqlWithTimeout<T>(options);
    } catch (error: any) {
      lastError = error;
      console.warn(`GraphQL query attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
      
      // Don't retry on last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('GraphQL query failed after retries');
}
