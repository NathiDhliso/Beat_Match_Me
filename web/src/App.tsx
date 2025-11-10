import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './components/DarkModeTheme';
import { useBackend } from './context/BackendContext';
import { apolloClient } from './services/api';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { YocoTestPage } from './pages/YocoTestPage';
import { PeekPreviewTest } from './pages/PeekPreviewTest';
import { OfflineBanner } from './components/StatusModals';
import { initPullToRefreshPrevention } from './utils/preventPullToRefresh';

// Phase 8: Lazy load route components for massive bundle size reduction
const DJPortal = lazy(() => import('./pages/DJPortalOrbital').then(m => ({ default: m.DJPortalOrbital })));
const UserPortal = lazy(() => import('./pages/UserPortalInnovative').then(m => ({ default: m.UserPortalInnovative })));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'PERFORMER' | 'AUDIENCE' }> = ({
  children,
  allowedRole,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 h-dvh bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    console.log(`Access denied: User role is ${user.role}, but ${allowedRole} required`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log(`Access granted: User role ${user.role} matches required ${allowedRole || 'any'}`);

  return <>{children}</>;
};

// Dashboard Router - redirects based on role
const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Debug logging
  console.log('Dashboard - User role:', user.role);
  console.log('Dashboard - Full user:', user);

  if (user.role === 'PERFORMER') {
    console.log('Redirecting to DJ Portal');
    return <Navigate to="/dj-portal" replace />;
  }

  console.log('Redirecting to User Portal');
  return <Navigate to="/user-portal" replace />;
};

// Loading Screen Component
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 h-dvh bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-white text-2xl mb-4">{message}</div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

// Offline Mode Banner
function App() {
  const { isReady, errors } = useBackend();
  const [isOffline, setIsOffline] = React.useState(false);

  useEffect(() => {
    if (isReady && errors.length > 0) {
      console.warn('Backend validation warnings:', errors);
    }
  }, [isReady, errors]);

  // Offline mode detection
  useEffect(() => {
    const handleOffline = () => {
      console.warn('🔴 App went offline');
      setIsOffline(true);
    };
    
    const handleOnline = () => {
      console.log('🟢 App back online');
      setIsOffline(false);
      
      // Optional: Trigger data sync when coming back online
      // syncPendingActions();
    };
    
    // Check initial state
    setIsOffline(!navigator.onLine);
    
    // Add event listeners
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Initialize pull-to-refresh prevention on mobile
  useEffect(() => {
    initPullToRefreshPrevention();
  }, []);

  // Show loading screen until backend is validated
  if (!isReady) {
    return <LoadingScreen message="Connecting to backend..." />;
  }

  return (
    <ThemeProvider defaultMode="dark">
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          {/* Offline mode banner */}
          <header role="banner">
            {isOffline && <OfflineBanner />}
          </header>
          
          <Router>
            <main role="main">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/yoco-test" element={<YocoTestPage />} />
                <Route path="/peek-test" element={<PeekPreviewTest />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Phase 8: Lazy loaded routes with Suspense for code splitting */}
                <Route
                  path="/dj-portal"
                  element={
                    <ProtectedRoute allowedRole="PERFORMER">
                      <Suspense fallback={<LoadingScreen message="Loading DJ Portal..." />}>
                        <DJPortal />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-portal"
                  element={
                    <ProtectedRoute allowedRole="AUDIENCE">
                      <Suspense fallback={<LoadingScreen message="Loading User Portal..." />}>
                        <UserPortal />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </Router>
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default App;
