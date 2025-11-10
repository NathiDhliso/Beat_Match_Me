/**
 * Component Instance Tracker
 * Helps debug duplicate component mounting and re-render issues
 */

import { useRef, useEffect } from 'react';

export interface InstanceTrackerOptions {
  componentName: string;
  logMounts?: boolean;
  logRenders?: boolean;
  logUnmounts?: boolean;
}

/**
 * Hook to track component instances and render cycles
 * Useful for debugging duplicate mounting and excessive re-renders
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { instanceId, renderCount } = useInstanceTracker({
 *     componentName: 'MyComponent',
 *     logMounts: true,
 *     logRenders: false, // Set to true only when debugging
 *   });
 * 
 *   console.log(`Instance ${instanceId}, Render #${renderCount}`);
 * }
 * ```
 */
export const useInstanceTracker = (options: InstanceTrackerOptions) => {
  const {
    componentName,
    logMounts = true,
    logRenders = false,
    logUnmounts = true,
  } = options;

  // Stable instance ID (never changes)
  const instanceId = useRef(
    Math.random().toString(36).substring(2, 9)
  );

  // Render counter
  const renderCount = useRef(0);
  renderCount.current++;

  // Track if this is first render
  const isFirstRender = useRef(true);

  // Log mount
  useEffect(() => {
    if (logMounts) {
      console.log(
        `🟢 [${componentName}] MOUNTED`,
        `| Instance: ${instanceId.current}`,
        `| Timestamp: ${new Date().toLocaleTimeString()}`
      );
    }

    isFirstRender.current = false;

    // Log unmount
    return () => {
      if (logUnmounts) {
        console.log(
          `🔴 [${componentName}] UNMOUNTED`,
          `| Instance: ${instanceId.current}`,
          `| Total Renders: ${renderCount.current}`,
          `| Timestamp: ${new Date().toLocaleTimeString()}`
        );
      }
    };
  }, [componentName, logMounts, logUnmounts]);

  // Log renders
  useEffect(() => {
    if (logRenders && !isFirstRender.current) {
      console.log(
        `🔄 [${componentName}] RENDER #${renderCount.current}`,
        `| Instance: ${instanceId.current}`
      );
    }
  });

  return {
    instanceId: instanceId.current,
    renderCount: renderCount.current,
    isFirstRender: isFirstRender.current,
  };
};

/**
 * Check if multiple instances of the same component exist
 * Useful for detecting accidental duplicate mounting
 */
const instanceRegistry = new Map<string, Set<string>>();

export const useInstanceRegistry = (componentName: string) => {
  const instanceId = useRef(
    Math.random().toString(36).substring(2, 9)
  );

  useEffect(() => {
    // Register this instance
    if (!instanceRegistry.has(componentName)) {
      instanceRegistry.set(componentName, new Set());
    }
    
    const instances = instanceRegistry.get(componentName)!;
    instances.add(instanceId.current);

    // Warn if multiple instances
    if (instances.size > 1) {
      console.warn(
        `⚠️ Multiple instances of ${componentName} detected!`,
        `| Count: ${instances.size}`,
        `| Instance IDs: ${Array.from(instances).join(', ')}`
      );
    }

    // Cleanup on unmount
    return () => {
      instances.delete(instanceId.current);
      if (instances.size === 0) {
        instanceRegistry.delete(componentName);
      }
    };
  }, [componentName]);

  return {
    instanceId: instanceId.current,
    totalInstances: instanceRegistry.get(componentName)?.size || 0,
  };
};

/**
 * Track event listener count for debugging memory leaks
 */
export const useEventListenerTracker = (
  elementRef: React.RefObject<HTMLElement>,
  eventType: string
) => {
  useEffect(() => {
    if (!elementRef.current || typeof window === 'undefined') return;

    // This requires Chrome DevTools
    if ('getEventListeners' in window) {
      const listeners = (window as any).getEventListeners(elementRef.current);
      const count = listeners[eventType]?.length || 0;

      if (count > 1) {
        console.warn(
          `⚠️ Multiple ${eventType} listeners detected!`,
          `| Count: ${count}`,
          `| Element:`, elementRef.current
        );
      }
    }
  }, [elementRef, eventType]);
};

/**
 * Performance tracker - measure render time
 */
export const useRenderTimer = (componentName: string, enabled = false) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    if (enabled) {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;

      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(
          `⚠️ [${componentName}] Slow render!`,
          `| Time: ${renderTime.toFixed(2)}ms`,
          `| Target: <16ms (60fps)`
        );
      }

      startTime.current = endTime;
    }
  });
};
