import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RequestTrackingScreen({ route, navigation }) {
  const { song, requestType } = route.params || {};

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusBadge}>⏳ In Queue</Text>
          <Text style={styles.songTitle}>{song?.title || 'Your Request'}</Text>
          <Text style={styles.songArtist}>{song?.artist || 'Artist'}</Text>
        </View>

        {/* Queue Position */}
        <View style={styles.positionCard}>
          <Text style={styles.positionLabel}>Position in Queue</Text>
          <Text style={styles.positionNumber}>5 of 12</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>
          </View>

          <View style={styles.estimateContainer}>
            <Text style={styles.estimateIcon}>⏱️</Text>
            <Text style={styles.estimateText}>Estimated wait: ~18 minutes</Text>
          </View>
        </View>

        {/* Request Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Request Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {requestType === 'spotlight' ? '⭐ Spotlight' : 
               requestType === 'group' ? '👥 Group' : 
               'Standard'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>Pending</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted:</Text>
            <Text style={styles.detailValue}>Just now</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Queue')}
        >
          <Text style={styles.primaryButtonText}>📋 View Full Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SongSelection')}
        >
          <Text style={styles.secondaryButtonText}>➕ Add Another Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.secondaryButtonText}>🏠 Back to Home</Text>
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
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#374151',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  statusBadge: {
    backgroundColor: '#fbbf24',
    color: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  songTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  songArtist: {
    color: '#9ca3af',
    fontSize: 18,
    textAlign: 'center',
  },
  positionCard: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  positionLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  positionNumber: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  estimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  estimateText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  detailsCard: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#9ca3af',
    fontSize: 16,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#374151',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
});
