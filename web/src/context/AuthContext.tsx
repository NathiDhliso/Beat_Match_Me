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
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      setUser({
        userId: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || '',
        role: (attributes['custom:role'] as UserRole) || 'AUDIENCE',
        tier: (attributes['custom:tier'] as UserTier) || 'BRONZE',
        profileImage: attributes['custom:profileImage'],
        phone: attributes.phone_number,
      });
    } catch (err) {
      // User not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const signInInput: SignInInput = {
        username: email,
        password,
      };

      try {
        await signIn(signInInput);
      } catch (signInError: any) {
        // If user is already authenticated, sign out and try again
        if (signInError.name === 'UserAlreadyAuthenticatedException') {
          await signOut();
          await signIn(signInInput);
        } else {
          throw signInError;
        }
      }
      
      await checkAuthStatus();
    } catch (err: any) {
      // User-friendly error messages
      let errorMessage = 'Failed to login';
      
      if (err.name === 'UserAlreadyAuthenticatedException' || err.message?.includes('already a signed in user')) {
        errorMessage = 'You were already signed in. Signing out and logging in again...';
      } else if (err.message?.includes('SECRET_HASH')) {
        errorMessage = '⚠️ Configuration Error: Your Cognito app client has a secret enabled. Web apps cannot use client secrets. Please see FIX_COGNITO_SECRET.md in the project root for step-by-step instructions to create a new app client without a secret.';
      } else if (err.message?.includes('unauthorized attribute')) {
        errorMessage = 'Configuration Error: Custom user attributes not set up in Cognito. Signup will work but role/tier will need to be set later.';
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
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      setError(null);

      const signUpInput: SignUpInput = {
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            // Note: custom:role and custom:tier removed - add these attributes in Cognito first
            // or store in your database after signup
          },
        },
      };

      await signUp(signUpInput);
    } catch (err: any) {
      // User-friendly error messages
      let errorMessage = 'Failed to sign up';
      
      if (err.message?.includes('SECRET_HASH')) {
        errorMessage = 'Configuration Error: Please check the setup guide (FIX_COGNITO_SECRET.md)';
      } else if (err.message?.includes('User already exists')) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (err.message?.includes('Password did not conform')) {
        errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and numbers.';
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmSignup = async (email: string, code: string) => {
    try {
      setLoading(true);
      setError(null);

      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to confirm signup');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      const attributes: Record<string, string> = {};
      if (updates.name) attributes.name = updates.name;
      if (updates.phone) attributes.phone_number = updates.phone;
      if (updates.profileImage) attributes['custom:profileImage'] = updates.profileImage;

      await updateUserAttributes({ userAttributes: attributes });
      await checkAuthStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
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
