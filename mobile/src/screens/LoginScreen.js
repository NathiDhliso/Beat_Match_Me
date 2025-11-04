import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'confirm'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, confirmSignup } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.message || error.toString() || 'Unknown error occurred';
      Alert.alert('Login Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name || !role) {
      Alert.alert('Error', 'Please fill all fields and select a role');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name, role);
      setMode('confirm');
      Alert.alert('Success', 'Check your email for verification code');
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = error.message || error.toString() || 'Unknown error occurred';
      Alert.alert('Signup Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmCode) {
      Alert.alert('Error', 'Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      await confirmSignup(email, confirmCode);
      Alert.alert('Success', 'Account confirmed! Please login.');
      setMode('login');
    } catch (error) {
      Alert.alert('Confirmation Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'confirm') {
    return (
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerContent}>
            <Text style={styles.logo}>✉️</Text>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>Enter the code sent to your email</Text>

            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              placeholderTextColor="#9ca3af"
              value={confirmCode}
              onChangeText={setConfirmCode}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Confirming...' : 'Confirm Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('login')}>
              <Text style={styles.linkText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (mode === 'signup' && !role) {
    return (
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerContent}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={[styles.subtitle, {marginBottom: 30}]}>Select how you'll use BeatMatchMe</Text>

            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => setRole('PERFORMER')}
            >
              <Text style={styles.roleEmoji}>🎧</Text>
              <Text style={styles.roleTitle}>I'm a Performer</Text>
              <Text style={styles.roleSubtitle}>DJ, Band, or Artist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => setRole('AUDIENCE')}
            >
              <Text style={styles.roleEmoji}>🎵</Text>
              <Text style={styles.roleTitle}>I'm Here to Request</Text>
              <Text style={styles.roleSubtitle}>Music Lover & Fan</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('login')}>
              <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (mode === 'signup') {
    return (
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerContent}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {role === 'PERFORMER' ? '🎧 Performer' : '🎵 Audience'}
              </Text>
            </View>

            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Create your BeatMatchMe account</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setRole(null)}>
              <Text style={styles.linkText}>Change role</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('login')}>
              <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>🎵</Text>
            <Text style={styles.title}>BeatMatchMe</Text>
            <Text style={styles.subtitle}>Live Music Request Platform</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode('signup')}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  button: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  roleCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  roleEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  centerContent: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  roleBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
