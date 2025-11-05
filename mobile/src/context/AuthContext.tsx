/**
 * AuthContext - Mobile
 * Authentication state management with AWS Amplify Cognito
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
  type SignInInput,
  type SignUpInput,
} from 'aws-amplify/auth';

export type UserRole = 'PERFORMER' | 'AUDIENCE';
export type UserTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface User {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  tier: UserTier;
  profileImage?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log('[Auth] Checking authentication status...');

      // Add timeout protection for Cognito calls
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 10000)
      );

      const authCheck = async () => {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        return { currentUser, attributes };
      };

      const { currentUser, attributes } = (await Promise.race([
        authCheck(),
        timeout,
      ])) as any;

      const userData: User = {
        userId: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || '',
        role: (attributes['custom:role'] as UserRole) || 'AUDIENCE',
        tier: (attributes['custom:tier'] as UserTier) || 'BRONZE',
        profileImage: attributes['custom:profileImage'],
        phone: attributes.phone_number,
      };

      console.log('[Auth] User authenticated:', userData.email);
      setUser(userData);
    } catch (err: any) {
      // User not authenticated or timeout
      console.log('[Auth] Not authenticated:', err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Logging in:', email);

      const signInInput: SignInInput = {
        username: email,
        password,
      };

      // Add timeout protection
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout - please try again')), 15000)
      );

      const loginAttempt = async () => {
        try {
          await signIn(signInInput);
        } catch (signInError: any) {
          // If user is already authenticated, sign out and try again
          if (signInError.name === 'UserAlreadyAuthenticatedException') {
            console.log('[Auth] User already authenticated, signing out first...');
            await signOut();
            await signIn(signInInput);
          } else {
            throw signInError;
          }
        }
      };

      await Promise.race([loginAttempt(), timeout]);
      console.log('[Auth] Login successful');
      await checkAuthStatus();
    } catch (err: any) {
      console.error('[Auth] Login failed:', err);

      // User-friendly error messages
      let errorMessage = 'Failed to login';

      if (
        err.name === 'UserAlreadyAuthenticatedException' ||
        err.message?.includes('already a signed in user')
      ) {
        errorMessage = 'Already signed in. Refreshing session...';
      } else if (err.message?.includes('User does not exist')) {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (err.message?.includes('Incorrect username or password')) {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (err.message?.includes('User is not confirmed')) {
        errorMessage = 'Please verify your email before logging in.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Signing up:', email, 'as', role);

      const signUpInput: SignUpInput = {
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            'custom:role': role,
            'custom:tier': 'BRONZE', // Default tier
          },
        },
      };

      // Add timeout protection
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Signup timeout - please try again')), 15000)
      );

      await Promise.race([signUp(signUpInput), timeout]);
      console.log('[Auth] Signup successful, verification code sent');
    } catch (err: any) {
      console.error('[Auth] Signup failed:', err);

      // User-friendly error messages
      let errorMessage = 'Failed to sign up';

      if (err.message?.includes('User already exists')) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (err.message?.includes('Password did not conform')) {
        errorMessage =
          'Password must be at least 8 characters with uppercase, lowercase, and numbers.';
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const confirmSignup = async (email: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Confirming signup for:', email);

      // Add timeout protection
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Confirmation timeout - please try again')), 15000)
      );

      await Promise.race([
        confirmSignUp({
          username: email,
          confirmationCode: code,
        }),
        timeout,
      ]);

      console.log('[Auth] Signup confirmed successfully');
    } catch (err: any) {
      console.error('[Auth] Confirmation failed:', err);
      const errorMessage = err.message || 'Failed to confirm signup';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Logging out...');

      // Add timeout protection
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Logout timeout')), 10000)
      );

      await Promise.race([signOut(), timeout]);
      setUser(null);
      console.log('[Auth] Logout successful');
    } catch (err: any) {
      // Even if logout times out, clear user locally
      console.warn('[Auth] Logout timeout, cleared local session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Auth] Updating profile...');

      const attributes: Record<string, string> = {};
      if (updates.name) attributes.name = updates.name;
      if (updates.phone) attributes.phone_number = updates.phone;
      if (updates.profileImage) attributes['custom:profileImage'] = updates.profileImage;

      // Add timeout protection
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile update timeout')), 15000)
      );

      await Promise.race([updateUserAttributes({ userAttributes: attributes }), timeout]);
      await checkAuthStatus();
      console.log('[Auth] Profile updated successfully');
    } catch (err: any) {
      console.error('[Auth] Profile update failed:', err);
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    confirmSignup,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
