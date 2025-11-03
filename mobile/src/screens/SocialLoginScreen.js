import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithRedirect } from 'aws-amplify/auth';

export default function SocialLoginScreen({ navigation }) {
  const handleSocialLogin = async (provider) => {
    try {
      await signInWithRedirect({ provider });
      // User will be redirected to provider's login page
    } catch (error) {
      Alert.alert('Error', `Failed to login with ${provider}`);
    }
  };

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Sign In Method</Text>

        {/* Google */}
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={() => handleSocialLogin('Google')}
        >
          <Text style={styles.googleText}>🔍 Continue with Google</Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity
          style={[styles.button, styles.facebookButton]}
          onPress={() => handleSocialLogin('Facebook')}
        >
          <Text style={styles.buttonText}>📘 Continue with Facebook</Text>
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={() => handleSocialLogin('Apple')}
        >
          <Text style={styles.buttonText}>🍎 Continue with Apple</Text>
        </TouchableOpacity>

        {/* Email/Password */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.emailButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>📧 Continue with Email</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  googleText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  emailButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4b5563',
  },
  dividerText: {
    color: '#9ca3af',
    paddingHorizontal: 16,
    fontSize: 12,
  },
});
