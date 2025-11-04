import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth';
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
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setUser({
        ...currentUser,
        attributes,
      });
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Password length:', password?.length);
      console.log('Calling signIn...');
      
      const result = await signIn({
        username: email,
        password,
      });
      
      console.log('✓ Login successful!');
      console.log('Login result:', JSON.stringify(result, null, 2));
      await checkUser();
    } catch (err) {
      console.error('=== LOGIN ERROR ===');
      console.error('Full error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error stack:', err.stack);
      
      // Try to extract more details
      if (err.$metadata) {
        console.error('Error metadata:', JSON.stringify(err.$metadata, null, 2));
      }
      if (err.response) {
        console.error('Error response:', JSON.stringify(err.response, null, 2));
      }
      
      // Log all error properties
      console.error('All error keys:', Object.keys(err));
      console.error('Error toString:', err.toString());
      console.error('Error JSON:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      
      const errorMessage = err.message || err.toString() || 'Failed to login';
      setError(errorMessage);
      throw err;
    }
  };

  const signup = async (email, password, name, role) => {
    setError(null);
    try {
      console.log('=== SIGNUP ATTEMPT ===');
      console.log('Email:', email);
      console.log('Name:', name);
      console.log('Role:', role);
      console.log('Password length:', password?.length);
      console.log('Calling signUp...');
      
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            // Note: custom:role removed - store role in your database after signup
            // or configure custom attributes in Cognito User Pool first
          },
        },
      });
      
      console.log('✓ Signup successful!');
      console.log('Signup result:', JSON.stringify(result, null, 2));
      return result;
    } catch (err) {
      console.error('=== SIGNUP ERROR ===');
      console.error('Full error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error stack:', err.stack);
      
      // Try to extract more details
      if (err.$metadata) {
        console.error('Error metadata:', JSON.stringify(err.$metadata, null, 2));
      }
      if (err.response) {
        console.error('Error response:', JSON.stringify(err.response, null, 2));
      }
      
      // Log all error properties
      console.error('All error keys:', Object.keys(err));
      console.error('Error toString:', err.toString());
      console.error('Error JSON:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      
      const errorMessage = err.message || err.toString() || 'Failed to sign up';
      setError(errorMessage);
      throw err;
    }
  };

  const confirmSignup = async (email, code) => {
    setError(null);
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
    } catch (err) {
      const errorMessage = err.message || 'Failed to confirm signup';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut();
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
