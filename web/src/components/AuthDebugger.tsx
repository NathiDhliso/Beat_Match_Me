/**
 * Authentication Debugger Component
 * Add this to any page to see authentication status in real-time
 * 
 * Usage:
 * import { AuthDebugger } from '../components/AuthDebugger';
 * 
 * // In your component:
 * <AuthDebugger />
 */

import React, { useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

export const AuthDebugger: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    const status: any = {
      timestamp: new Date().toISOString(),
      isAuthenticated: false,
      user: null,
      tokens: {
        idToken: false,
        accessToken: false,
      },
      config: null,
      error: null,
    };

    try {
      // Get current user
      const user = await getCurrentUser();
      status.isAuthenticated = true;
      status.user = {
        userId: user.userId,
        username: user.username,
      };

      // Get session tokens
      const session = await fetchAuthSession();
      status.tokens = {
        idToken: !!session.tokens?.idToken,
        accessToken: !!session.tokens?.accessToken,
      };

      // Get Amplify config
      const config = Amplify.getConfig();
      status.config = {
        userPoolId: config.Auth?.Cognito?.userPoolId,
        userPoolClientId: config.Auth?.Cognito?.userPoolClientId,
        graphqlEndpoint: config.API?.GraphQL?.endpoint,
        region: config.API?.GraphQL?.region,
        authMode: config.API?.GraphQL?.defaultAuthMode,
      };
    } catch (error: any) {
      status.error = {
        message: error.message,
        name: error.name,
      };
    }

    setAuthStatus(status);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
        <div className="text-sm">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">🔐 Auth Debugger</h3>
        <button
          onClick={checkAuth}
          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Authentication Status */}
        <div>
          <span className="font-semibold">Status:</span>{' '}
          {authStatus.isAuthenticated ? (
            <span className="text-green-400">✅ Authenticated</span>
          ) : (
            <span className="text-red-400">❌ Not Authenticated</span>
          )}
        </div>

        {/* User Info */}
        {authStatus.user && (
          <div>
            <span className="font-semibold">User ID:</span>{' '}
            <code className="text-blue-300">{authStatus.user.userId}</code>
          </div>
        )}

        {/* Tokens */}
        <div>
          <span className="font-semibold">Tokens:</span>
          <div className="ml-4 mt-1">
            <div>
              ID Token:{' '}
              {authStatus.tokens.idToken ? (
                <span className="text-green-400">✅</span>
              ) : (
                <span className="text-red-400">❌</span>
              )}
            </div>
            <div>
              Access Token:{' '}
              {authStatus.tokens.accessToken ? (
                <span className="text-green-400">✅</span>
              ) : (
                <span className="text-red-400">❌</span>
              )}
            </div>
          </div>
        </div>

        {/* Config */}
        {authStatus.config && (
          <div>
            <span className="font-semibold">Config:</span>
            <div className="ml-4 mt-1 space-y-1">
              <div className="truncate">
                Pool: <code className="text-blue-300">{authStatus.config.userPoolId}</code>
              </div>
              <div className="truncate">
                Client: <code className="text-blue-300">{authStatus.config.userPoolClientId}</code>
              </div>
              <div>
                Auth Mode: <code className="text-blue-300">{authStatus.config.authMode}</code>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {authStatus.error && (
          <div className="mt-2 p-2 bg-red-900 bg-opacity-50 rounded">
            <div className="font-semibold text-red-400">Error:</div>
            <div className="text-red-300">{authStatus.error.name}</div>
            <div className="text-red-200 text-xs mt-1">{authStatus.error.message}</div>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-2">
          Last check: {new Date(authStatus.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
