import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ComponentErrorBoundaryProps {
  children: ReactNode;
  /** Component name for error reporting */
  componentName?: string;
  /** Custom fallback UI */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component-level Error Boundary
 * Catches errors in specific components without crashing the entire app
 * Shows a compact inline error state
 * 
 * @example
 * ```tsx
 * <ComponentErrorBoundary componentName="FloatingActionBubble">
 *   <FloatingActionBubble {...props} />
 * </ComponentErrorBoundary>
 * ```
 */
export class ComponentErrorBoundary extends Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ComponentErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `ComponentErrorBoundary (${this.props.componentName || 'Unknown'}) caught error:`,
      error,
      errorInfo
    );
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">
                {this.props.componentName || 'Component'} Error
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                {this.state.error?.message || 'Something went wrong'}
              </p>
            </div>
          </div>
          
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
