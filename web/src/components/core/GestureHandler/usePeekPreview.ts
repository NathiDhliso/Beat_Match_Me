import type { Delta, PeekContent, PeekPreview } from './types';
import { logger } from '../../../utils/debugLogger';

/**
 * Hook to calculate peek preview state based on swipe delta
 * Returns which direction to show and how much to reveal
 */
export const usePeekPreview = (
  currentDelta: Delta,
  isPeeking: boolean,
  peekContent?: PeekContent
): PeekPreview | null => {
  if (!isPeeking || !peekContent) {
    logger.debug('🚫 No peek preview:', { isPeeking, hasPeekContent: !!peekContent });
    return null;
  }
  
  const absX = Math.abs(currentDelta.x);
  const absY = Math.abs(currentDelta.y);
  
  // Peek threshold - requires 50px movement for better feel (not too sensitive)
  const PEEK_THRESHOLD = 50;
  if (absX < PEEK_THRESHOLD && absY < PEEK_THRESHOLD) {
    logger.debug('🚫 Movement too small:', { absX, absY, threshold: PEEK_THRESHOLD });
    return null;
  }
  
  let result: PeekPreview | null = null;
  
  if (absX > absY) {
    // Horizontal swipe
    if (currentDelta.x > 0 && peekContent.right) {
      result = { content: peekContent.right, direction: 'right', offset: currentDelta.x };
    } else if (currentDelta.x < 0 && peekContent.left) {
      result = { content: peekContent.left, direction: 'left', offset: currentDelta.x };
    }
  } else {
    // Vertical swipe
    if (currentDelta.y > 0 && peekContent.down) {
      result = { content: peekContent.down, direction: 'down', offset: currentDelta.y };
    } else if (currentDelta.y < 0 && peekContent.up) {
      result = { content: peekContent.up, direction: 'up', offset: currentDelta.y };
    }
  }
  
  if (result) {
    logger.info('✅ Showing peek:', { 
      direction: result.direction, 
      offset: result.offset,
      hasContent: !!result.content 
    });
  }
  
  return result;
};
