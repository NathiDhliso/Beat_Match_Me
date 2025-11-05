/**
 * Verification Screen - Mobile
 * Email verification code confirmation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface VerificationScreenProps {
  email: string;
  onVerificationSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
  email,
  onVerificationSuccess,
  onNavigateToLogin,
}) => {
  const { confirmSignup, loading } = useAuth();
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Validation Error', 'Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Validation Error', 'Verification code must be 6 digits');
      return;
    }

    try {
      await confirmSignup(email, code.trim());

      // Success
      Alert.alert(
        'Email Verified! 🎉',
        'Your account has been successfully verified. Please sign in to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onVerificationSuccess) {
                onVerificationSuccess();
              } else if (onNavigateToLogin) {
                onNavigateToLogin();
              }
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Verification Failed',
        err.message || 'Invalid verification code. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>✉️</Text>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to:{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.form}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#9ca3af"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
          />

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>Didn't receive the code?</Text>
            <Text style={styles.helpSubtext}>
              Check your spam folder or contact support
            </Text>
          </View>

          {/* Back to Login */}
          {onNavigateToLogin && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onNavigateToLogin}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>← Back to Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  icon: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    color: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#374151',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: '#6d28d9',
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  helpText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  helpSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  backButton: {
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VerificationScreen;
