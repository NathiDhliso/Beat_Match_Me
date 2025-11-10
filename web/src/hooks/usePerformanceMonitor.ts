import { useEffect, useRef, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
}

export interface UsePerformanceMonitorOptions {
  /** FPS threshold for low performance warning (default: 50) */
  fpsThreshold?: number;
  /** Enable console warnings (default: true) */
  enableWarnings?: boolean;
  /** Callback when performance drops below threshold */
  onLowPerformance?: (metrics: PerformanceMetrics) => void;
  /** Callback for continuous metrics updates */
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  /** Update interval in ms (default: 1000) */
  updateInterval?: number;
}

/**
 * Hook to monitor app performance (FPS tracking)
 * Logs warnings when FPS drops below threshold
 * 
 * @example
 * ```tsx
 * const { metrics, isMonitoring, startMonitoring, stopMonitoring } = usePerformanceMonitor({
 *   fpsThreshold: 50,
 *   onLowPerformance: (metrics) => {
 *     console.warn(`Low FPS: ${metrics.fps}`);
 *   }
 * });
 * ```
 */
export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions = {}) => {
  const {
    fpsThreshold = 50,
    enableWarnings = true,
    onLowPerformance,
    onMetricsUpdate,
    updateInterval = 1000,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const measureFrame = useCallback(() => {
    frameCountRef.current++;
    animationFrameRef.current = requestAnimationFrame(measureFrame);
  }, []);

  const calculateMetrics = useCallback(() => {
    const currentTime = performance.now();
    const elapsed = currentTime - lastTimeRef.current;
    const frameCount = frameCountRef.current;

    const fps = Math.round((frameCount / elapsed) * 1000);
    const frameTime = frameCount > 0 ? elapsed / frameCount : 0;
    const isLowPerformance = fps < fpsThreshold;

    const newMetrics: PerformanceMetrics = {
      fps,
      frameTime,
      isLowPerformance,
    };

    setMetrics(newMetrics);
    onMetricsUpdate?.(newMetrics);

    if (isLowPerformance) {
      if (enableWarnings) {
        console.warn(
          `[Performance Monitor] Low FPS detected: ${fps} FPS (threshold: ${fpsThreshold})`
        );
      }
      onLowPerformance?.(newMetrics);
    }

    // Reset for next interval
    frameCountRef.current = 0;
    lastTimeRef.current = currentTime;
  }, [fpsThreshold, enableWarnings, onLowPerformance, onMetricsUpdate]);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();

    // Start measuring frames
    animationFrameRef.current = requestAnimationFrame(measureFrame);

    // Calculate metrics at intervals
    intervalRef.current = window.setInterval(calculateMetrics, updateInterval);
  }, [isMonitoring, measureFrame, calculateMetrics, updateInterval]);

  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isMonitoring]);

  useEffect(() => {
    // Auto-start monitoring
    startMonitoring();

    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
};
