import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Share, RefreshControl, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function RequestTrackingScreen({ route, navigation }) {
  const { song, requestType, queuePosition: initialPosition = 8, requestId } = route.params || {};
  
  const [queuePosition, setQueuePosition] = useState(initialPosition);
  const [totalInQueue, setTotalInQueue] = useState(12);
  const [songsAhead, setSongsAhead] = useState(initialPosition - 1);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState('~25 minutes');
  const [queueStatus, setQueueStatus] = useState('ACCEPTED');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isConnected, setIsConnected] = useState(true);
  const [showFullQueue, setShowFullQueue] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animated value for beacon pulse
  const pulseAnim = new Animated.Value(1);
  
  // Simulate real-time queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate position changes
      if (queuePosition > 1 && Math.random() > 0.7) {
        const newPosition = queuePosition - 1;
        setQueuePosition(newPosition);
        setSongsAhead(newPosition - 1);
        setLastUpdate(Date.now());
        
        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Update estimated wait time
        setEstimatedWaitTime(`~${newPosition * 3} minutes`);
        
        // Show notifications based on position
        if (newPosition === 2) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (newPosition === 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [queuePosition]);
  
  // Pulse animation for beacon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just requested "${song?.title}" by ${song?.artist} at the event! 🎵 Currently at position #${queuePosition} in queue.`,
        title: 'My Song Request',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdate(Date.now());
      setRefreshing(false);
    }, 1500);
  };
  
  const getStatusColor = () => {
    switch(queueStatus) {
      case 'ACCEPTED': return '#10b981';
      case 'PENDING': return '#fbbf24';
      case 'PLAYING': return '#8b5cf6';
      default: return '#6b7280';
    }
  };
  
  const getPositionMessage = () => {
    if (queuePosition === 1) return "YOU'RE NEXT!";
    if (queuePosition === 2) return "Coming Up Next!";
    if (queuePosition <= 3) return "Coming Soon!";
    return "In Queue";
  };
  
  const getTimeAgo = () => {
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
      {/* Energy Beam Visualization */}
      <View style={styles.beamContainer}>
        {/* Background Beam */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)', 'transparent']}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.beam}
        />
        
        {/* User's Beacon */}
        <Animated.View
          style={[
            styles.beacon,
            {
              bottom: `${((totalInQueue - queuePosition + 1) / totalInQueue) * 80}%`,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={queuePosition <= 2 ? ['#10b981', '#059669'] : ['#fbbf24', '#f59e0b']}
            style={styles.beaconGradient}
          >
            <Text style={styles.beaconNumber}>#{queuePosition}</Text>
          </LinearGradient>
        </Animated.View>
        
        {/* Other Requests (Dots) */}
        {[...Array(Math.min(totalInQueue - 1, 10))].map((_, i) => {
          const position = (i + 1) * (80 / totalInQueue);
          const isSpotlight = Math.random() > 0.8;
          
          return (
            <View
              key={i}
              style={[
                styles.otherRequest,
                {
                  bottom: `${position}%`,
                  backgroundColor: isSpotlight ? '#fbbf24' : '#8b5cf6',
                },
              ]}
            />
          );
        })}
        
        {/* Song Info Card */}
        <View style={styles.songInfoCard}>
          <Text style={styles.songCardTitle}>{song?.title || 'Your Request'}</Text>
          <Text style={styles.songCardArtist}>{song?.artist || 'Artist'}</Text>
          <Text style={styles.songCardTime}>Requested {getTimeAgo()}</Text>
        </View>
      </View>

      {/* Top Info Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.connectionStatus}>
          {isConnected ? (
            <Text style={styles.connectedText}>● Connected</Text>
          ) : (
            <Text style={styles.disconnectedText}>● Reconnecting...</Text>
          )}
        </View>
      </View>

      {/* Status Message */}
      <View style={styles.statusBanner}>
        <Text style={[styles.statusMessage, { color: getStatusColor() }]}>
          {getPositionMessage()}
        </Text>
      </View>

      {/* Bottom Info Panel */}
      <View style={styles.bottomPanel}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#8b5cf6"
            />
          }
        >
          {/* Progress Info */}
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>{songsAhead}</Text>
                <Text style={styles.progressLabel}>Songs Ahead</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>{estimatedWaitTime}</Text>
                <Text style={styles.progressLabel}>Est. Wait</Text>
              </View>
            </View>
          </View>

          {/* Queue Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Queue Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusBadgeText}>{queueStatus}</Text>
              </View>
            </View>
            <Text style={styles.statusSubtext}>Last updated {getTimeAgo()}</Text>
          </View>

          {/* Request Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Request Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Request ID:</Text>
              <Text style={styles.detailValue}>{requestId || 'REQ-00000'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {requestType === 'spotlight' ? '⭐ Spotlight' : 'Standard'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Position:</Text>
              <Text style={styles.detailValue}>#{queuePosition} of {totalInQueue}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowFullQueue(true)}
          >
            <Text style={styles.primaryButtonText}>📋 View Full Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
          >
            <Text style={styles.secondaryButtonText}>📤 Share Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SongSelection')}
          >
            <Text style={styles.secondaryButtonText}>➕ Browse More Songs</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Full Queue Modal */}
      <Modal
        visible={showFullQueue}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFullQueue(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Full Queue</Text>
              <TouchableOpacity onPress={() => setShowFullQueue(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.queueList}>
              {[...Array(totalInQueue)].map((_, i) => {
                const position = i + 1;
                const isUserRequest = position === queuePosition;
                const isSpotlight = Math.random() > 0.8;
                
                return (
                  <View
                    key={i}
                    style={[
                      styles.queueItem,
                      isUserRequest && styles.queueItemHighlight,
                    ]}
                  >
                    <View style={styles.queuePosition}>
                      <Text style={styles.queuePositionText}>#{position}</Text>
                    </View>
                    <View style={styles.queueInfo}>
                      <Text style={styles.queueSong}>
                        {isUserRequest ? song?.title : 'Song Title'}
                      </Text>
                      <Text style={styles.queueArtist}>
                        {isUserRequest ? song?.artist : 'Artist Name'}
                      </Text>
                    </View>
                    {isSpotlight && <Text style={styles.spotlightBadge}>⭐</Text>}
                    {isUserRequest && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>YOU</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowFullQueue(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  beamContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  beam: {
    position: 'absolute',
    width: 8,
    height: '100%',
    left: '50%',
    marginLeft: -4,
  },
  beacon: {
    position: 'absolute',
    left: '50%',
    marginLeft: -40,
    zIndex: 10,
  },
  beaconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  beaconNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  otherRequest: {
    position: 'absolute',
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.6,
  },
  songInfoCard: {
    position: 'absolute',
    left: '60%',
    top: '40%',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    maxWidth: 200,
  },
  songCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songCardArtist: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  songCardTime: {
    color: '#6b7280',
    fontSize: 12,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    zIndex: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  connectionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  connectedText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  disconnectedText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBanner: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  statusMessage: {
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  progressCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressValue: {
    color: '#8b5cf6',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#4b5563',
    marginHorizontal: 16,
  },
  statusCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusSubtext: {
    color: '#6b7280',
    fontSize: 12,
  },
  detailsCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalClose: {
    color: '#9ca3af',
    fontSize: 28,
    fontWeight: 'bold',
  },
  queueList: {
    maxHeight: 400,
  },
  queueItem: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueItemHighlight: {
    backgroundColor: '#4c1d95',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  queuePosition: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  queuePositionText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  queueInfo: {
    flex: 1,
  },
  queueSong: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  queueArtist: {
    color: '#9ca3af',
    fontSize: 14,
  },
  spotlightBadge: {
    fontSize: 20,
    marginLeft: 8,
  },
  youBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  youBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
