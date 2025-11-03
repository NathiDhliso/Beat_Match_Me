/**
 * useGroupRequest Hook
 * Manages group request creation and contributions
 */

import { useState, useEffect } from 'react';
import { submitGroupRequest, submitContribution } from '../services/graphql';
import { subscribeToGroupRequest } from '../services/subscriptions';

export function useGroupRequest(groupRequestId?: string) {
  const [groupRequest, setGroupRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupRequestId) return;

    // Subscribe to real-time updates
    const subscription = subscribeToGroupRequest(groupRequestId, (updated) => {
      setGroupRequest(updated);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [groupRequestId]);

  const createGroupRequest = async (input: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await submitGroupRequest(input);
      setGroupRequest(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contribute = async (groupRequestId: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await submitContribution(groupRequestId, amount);
      setGroupRequest(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to contribute';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { groupRequest, createGroupRequest, contribute, loading, error };
}
