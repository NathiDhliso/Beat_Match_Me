/**
 * useRequest Hook
 * Manages request submission and tracking
 */

import { useState } from 'react';
import { submitRequest } from '../services/graphql';

export function useRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async (input: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await submitRequest(input);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createRequest, loading, error };
}
