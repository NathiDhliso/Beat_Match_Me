/**
 * useUpvote Hook
 * Manages upvoting with optimistic updates
 */

import { useState } from 'react';
import { submitUpvote } from '../services/graphql';

export function useUpvote() {
  const [loading, setLoading] = useState(false);

  const upvote = async (requestId: string, currentUpvotes: number, onOptimisticUpdate: (upvotes: number) => void) => {
    try {
      // Optimistic update
      onOptimisticUpdate(currentUpvotes + 1);
      setLoading(true);

      const result = await submitUpvote(requestId);
      
      // Update with real value
      onOptimisticUpdate(result.upvotes);
      
      return result;
    } catch (err) {
      // Revert on error
      onOptimisticUpdate(currentUpvotes);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { upvote, loading };
}
