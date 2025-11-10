/**
 * Orbital Interface - Revolutionary DJ Portal UI
 * No traditional nav/sidebar - gesture-first, floating controls
 * 
 * REFACTORED: Components split into modular structure in /core
 * This file now serves as a clean re-export facade for backward compatibility
 */

// Import all core components from the new modular structure
export { 
  FloatingActionBubble,
  StatusArc,
  CircularQueueVisualizer,
  GestureHandler,
} from './core';

// Re-export types for backward compatibility
export type{
  FloatingBubbleProps,
  MenuOption,
  StatusArcProps,
  QueueVisualizerProps,
  Request,
  GestureHandlerProps,
  PeekContent,
} from './core';

