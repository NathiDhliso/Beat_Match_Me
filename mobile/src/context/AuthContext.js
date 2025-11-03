import React, { createContext, useState, useContext, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { Alert } from 'react-native';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email, password, name, role) => {
    setError(null);
    try {
      const result = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name,
          'custom:role': role,
        },
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const confirmSignup = async (email, code) => {
    setError(null);
    try {
      await Auth.confirmSignUp(email, code);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    confirmSignup,
    logout,
    checkUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
