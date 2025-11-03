import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './components/DarkModeTheme';
import { apolloClient } from './services/api';
import { Login } from './pages/Login';
import { DJPortal } from './pages/DJPortal';
import { UserPortal } from './pages/UserPortal';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'PERFORMER' | 'AUDIENCE' }> = ({
  children,
  allowedRole,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Router - redirects based on role
const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'PERFORMER') {
    return <Navigate to="/dj-portal" replace />;
  }

  return <Navigate to="/user-portal" replace />;
};

function App() {
  return (
    <ThemeProvider defaultMode="dark">
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/dj-portal"
                element={
                  <ProtectedRoute allowedRole="PERFORMER">
                    <DJPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-portal"
                element={
                  <ProtectedRoute allowedRole="AUDIENCE">
                    <UserPortal />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default App;
