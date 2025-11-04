import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  
  // Get user role from attributes (if configured in Cognito)
  const userRole = user?.attributes?.['custom:role'] || 'AUDIENCE';
  const isPerformer = userRole === 'PERFORMER';
  
  return (
    <LinearGradient
      colors={['#1f2937', '#111827']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isPerformer ? '🎧 DJ Portal' : '🎵 BeatMatchMe'}
          </Text>
          <Text style={styles.subtitle}>
            {isPerformer ? 'Manage Your Event' : 'Request Your Favorite Songs'}
          </Text>
          {user && (
            <Text style={styles.userName}>Welcome, {user.attributes?.name || 'User'}!</Text>
          )}
          <Text style={styles.roleText}>
            Role: {isPerformer ? 'Performer' : 'Audience'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {isPerformer ? (
            // DJ/Performer buttons
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Queue')}
              >
                <Text style={styles.primaryButtonText}>📋 Manage Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => alert('DJ Library - Coming Soon!')}
              >
                <Text style={styles.secondaryButtonText}>🎸 My Library</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => alert('Revenue Dashboard - Coming Soon!')}
              >
                <Text style={styles.secondaryButtonText}>💰 Revenue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => alert('Event Settings - Coming Soon!')}
              >
                <Text style={styles.secondaryButtonText}>⚙️ Settings</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Audience buttons
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('SongSelection')}
              >
                <Text style={styles.primaryButtonText}>🎸 Browse Songs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Queue')}
              >
                <Text style={styles.secondaryButtonText}>📋 View Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('RequestTracking')}
              >
                <Text style={styles.secondaryButtonText}>🎯 Track My Request</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>
            {isPerformer ? 'DJ Features:' : 'How it works:'}
          </Text>
          {isPerformer ? (
            <>
              <Text style={styles.infoText}>• Manage your song queue</Text>
              <Text style={styles.infoText}>• View incoming requests</Text>
              <Text style={styles.infoText}>• Track revenue (coming soon)</Text>
              <Text style={styles.infoText}>• Manage your library (coming soon)</Text>
              <Text style={styles.infoText}>• Configure event settings (coming soon)</Text>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>1. Browse the DJ's tracklist</Text>
              <Text style={styles.infoText}>2. Select your favorite song</Text>
              <Text style={styles.infoText}>3. Choose request type & add-ons</Text>
              <Text style={styles.infoText}>4. Pay securely</Text>
              <Text style={styles.infoText}>5. Track your request in real-time!</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#374151',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    color: '#8b5cf6',
    marginTop: 8,
  },
  roleText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
