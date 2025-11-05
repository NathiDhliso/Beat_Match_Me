/**
 * User-Friendly Error Display Component
 * Shows errors in a clear, actionable way
 */

import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import { parseError, type ErrorInfo } from '../services/errorHandler';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  const errorInfo: ErrorInfo = parseError(error);

  const getIcon = () => {
    switch (errorInfo.severity) {
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-red-400" />;
    }
  };

  const getColors = () => {
    switch (errorInfo.severity) {
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          button: 'bg-red-500 hover:bg-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          button: 'bg-yellow-500 hover:bg-yellow-600',
        };
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          button: 'bg-blue-500 hover:bg-blue-600',
        };
      default:
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          button: 'bg-red-500 hover:bg-red-600',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${colors.text} mb-2`}>
            {errorInfo.title}
          </h3>
          
          <p className="text-white mb-2">
            {errorInfo.message}
          </p>
          
          {errorInfo.action && (
            <p className="text-gray-400 text-sm mb-4">
              {errorInfo.action}
            </p>
          )}

          {/* Show technical details in development */}
          {process.env.NODE_ENV === 'development' && errorInfo.technical && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                Technical Details
              </summary>
              <pre className="mt-2 p-3 bg-gray-900/50 rounded text-xs text-gray-400 overflow-auto">
                {errorInfo.technical}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`${colors.button} text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors`}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-white px-4 py-2 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Inline Error Message (compact version)
 */
interface InlineErrorProps {
  error: any;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ error, className = '' }) => {
  const errorInfo = parseError(error);

  return (
    <div className={`flex items-start gap-2 text-red-400 text-sm ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-medium">{errorInfo.title}:</span>{' '}
        <span>{errorInfo.message}</span>
      </div>
    </div>
  );
};

/**
 * Full Page Error Screen
 */
interface ErrorPageProps {
  error: any;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, onRetry, onGoHome }) => {
  const errorInfo = parseError(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-xl text-gray-300">
            {errorInfo.message}
          </p>
        </div>

        {errorInfo.action && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                {errorInfo.action}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          )}
          
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-bold transition-colors"
            >
              Go Home
            </button>
          )}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <a
              href="mailto:support@beatmatchme.com"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>

        {/* Technical Details (dev only) */}
        {process.env.NODE_ENV === 'development' && errorInfo.technical && (
          <details className="mt-8 bg-gray-900/50 rounded-xl p-4">
            <summary className="text-gray-500 cursor-pointer hover:text-gray-400 text-sm">
              Technical Details (Dev Only)
            </summary>
            <pre className="mt-3 p-3 bg-black/50 rounded text-xs text-gray-400 overflow-auto max-h-64">
              {JSON.stringify(
                {
                  technical: errorInfo.technical,
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};
