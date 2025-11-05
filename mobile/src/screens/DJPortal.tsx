/**
 * DJ Portal Screen - Mobile
 * Simplified DJ interface for managing sets, queue, and requests
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../hooks/useEvent';
import { useQueue } from '../hooks/useQueue';
import { useQueueSubscription } from '../hooks/useQueueSubscription';
import {
  submitAcceptRequest,
  submitVeto,
  submitMarkPlaying,
  submitMarkCompleted,
  submitRefund,
} from '../services/graphql';

type TabView = 'queue' | 'history' | 'settings';

export const DJPortalScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabView>('queue');
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load user's sets (simplified - in production would list all sets)
  useEffect(() => {
    // In production, fetch user's active DJ sets here
    // For now, hardcode or load from AsyncStorage
    // setCurrentSetId('set-123');
    // setCurrentEventId('event-456');
  }, [user?.userId]);

  // Hooks
  const { event } = useEvent(currentEventId);
  const { queue, loading, refetch } = useQueue(currentSetId);
  const { queueData: liveQueue, connectionStatus } = useQueueSubscription(
    currentSetId || '',
    currentEventId || ''
  );

  // Combine queue data (prefer live subscription data if available)
  const queueRequests = (liveQueue?.orderedRequests || queue?.orderedRequests || [])
    .map((req: any, index: number) => ({
      ...req,
      queuePosition: index + 1,
    }));

  const pendingRequests = queueRequests.filter((r: any) => r.status === 'PENDING');
  const acceptedRequests = queueRequests.filter((r: any) => r.status === 'ACCEPTED');

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Accept Request
  const handleAcceptRequest = async (request: any) => {
    if (!currentSetId) {
      Alert.alert('Error', 'No active set selected');
      return;
    }

    Alert.alert(
      'Accept Request',
      `Accept "${request.songTitle}" by ${request.artistName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              console.log('[DJ Portal] Accepting request:', request.requestId);
              await submitAcceptRequest(request.requestId, currentSetId);
              Alert.alert('Success', 'Request accepted!');
              await refetch();
            } catch (error: any) {
              console.error('[DJ Portal] Accept failed:', error);
              Alert.alert('Error', error.message || 'Failed to accept request');
            }
          },
        },
      ]
    );
  };

  // Veto Request
  const handleVetoRequest = async (request: any) => {
    Alert.alert(
      'Veto Request',
      `Veto "${request.songTitle}"? User will be refunded.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Veto',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[DJ Portal] Vetoing request:', request.requestId);
              
              // 1. Veto the request
              await submitVeto(request.requestId, 'DJ vetoed');
              
              // 2. Process refund
              try {
                await submitRefund(request.requestId, 'DJ vetoed request');
                console.log('[DJ Portal] Refund processed');
              } catch (refundError) {
                console.error('[DJ Portal] Refund failed:', refundError);
              }
              
              Alert.alert('Success', 'Request vetoed and refunded');
              await refetch();
            } catch (error: any) {
              console.error('[DJ Portal] Veto failed:', error);
              Alert.alert('Error', error.message || 'Failed to veto request');
            }
          },
        },
      ]
    );
  };

  // Mark Request as Playing
  const handleMarkPlaying = async (request: any) => {
    if (!currentSetId) {
      Alert.alert('Error', 'No active set selected');
      return;
    }

    try {
      console.log('[DJ Portal] Marking as playing:', request.requestId);
      await submitMarkPlaying(request.requestId, currentSetId);
      
      setCurrentlyPlaying({
        requestId: request.requestId,
        songTitle: request.songTitle,
        artistName: request.artistName,
        startedAt: Date.now(),
      });
      
      Alert.alert('Now Playing', `${request.songTitle} by ${request.artistName}`);
      await refetch();
    } catch (error: any) {
      console.error('[DJ Portal] Mark playing failed:', error);
      Alert.alert('Error', error.message || 'Failed to mark as playing');
    }
  };

  // Mark Song as Completed
  const handleMarkCompleted = async () => {
    if (!currentlyPlaying) return;

    try {
      console.log('[DJ Portal] Marking as completed:', currentlyPlaying.requestId);
      await submitMarkCompleted(currentlyPlaying.requestId);
      
      setCurrentlyPlaying(null);
      Alert.alert('Completed', 'Song marked as completed');
      await refetch();
    } catch (error: any) {
      console.error('[DJ Portal] Mark completed failed:', error);
      Alert.alert('Error', error.message || 'Failed to mark as completed');
    }
  };

  // Render Now Playing Banner
  const renderNowPlaying = () => {
    if (!currentlyPlaying) return null;

    return (
      <View style={styles.nowPlayingBanner}>
        <View style={styles.nowPlayingContent}>
          <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
          <Text style={styles.nowPlayingTitle}>{currentlyPlaying.songTitle}</Text>
          <Text style={styles.nowPlayingArtist}>{currentlyPlaying.artistName}</Text>
        </View>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleMarkCompleted}
        >
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Queue Item
  const renderQueueItem = (request: any) => {
    const isPending = request.status === 'PENDING';
    const isAccepted = request.status === 'ACCEPTED';

    return (
      <View key={request.requestId} style={styles.queueItem}>
        <View style={styles.queueItemHeader}>
          <View style={styles.queuePosition}>
            <Text style={styles.queuePositionText}>#{request.queuePosition}</Text>
          </View>
          <View style={styles.queueItemInfo}>
            <Text style={styles.songTitle}>{request.songTitle}</Text>
            <Text style={styles.artistName}>{request.artistName}</Text>
            {request.userName && (
              <Text style={styles.requestedBy}>Requested by: {request.userName}</Text>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              isPending && styles.statusPending,
              isAccepted && styles.statusAccepted,
            ]}
          >
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isPending && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAcceptRequest(request)}
              >
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.vetoButton]}
                onPress={() => handleVetoRequest(request)}
              >
                <Text style={styles.actionButtonText}>Veto</Text>
              </TouchableOpacity>
            </>
          )}
          {isAccepted && request.queuePosition === 1 && !currentlyPlaying && (
            <TouchableOpacity
              style={[styles.actionButton, styles.playButton]}
              onPress={() => handleMarkPlaying(request)}
            >
              <Text style={styles.actionButtonText}>Mark as Playing</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Connection Status Indicator
  const renderConnectionStatus = () => {
    let statusColor = '#gray';
    let statusText = 'Disconnected';

    if (connectionStatus === 'connected') {
      statusColor = '#10b981';
      statusText = 'Live';
    } else if (connectionStatus === 'connecting') {
      statusColor = '#f59e0b';
      statusText = 'Connecting...';
    }

    return (
      <View style={styles.connectionStatus}>
        <View style={[styles.connectionDot, { backgroundColor: statusColor }]} />
        <Text style={styles.connectionText}>{statusText}</Text>
      </View>
    );
  };

  if (!currentSetId) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Active Set</Text>
          <Text style={styles.emptyStateText}>
            Create or select a DJ set to start accepting requests
          </Text>
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DJ Portal</Text>
          {event && <Text style={styles.headerSubtitle}>{event.venueName}</Text>}
        </View>
        {renderConnectionStatus()}
      </View>

      {/* Now Playing Banner */}
      {renderNowPlaying()}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'queue' && styles.tabActive]}
          onPress={() => setCurrentTab('queue')}
        >
          <Text style={[styles.tabText, currentTab === 'queue' && styles.tabTextActive]}>
            Queue ({queueRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'history' && styles.tabActive]}
          onPress={() => setCurrentTab('history')}
        >
          <Text style={[styles.tabText, currentTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'settings' && styles.tabActive]}
          onPress={() => setCurrentTab('settings')}
        >
          <Text style={[styles.tabText, currentTab === 'settings' && styles.tabTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Queue List */}
      {currentTab === 'queue' && (
        <ScrollView
          style={styles.queueList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {queueRequests.length === 0 ? (
            <View style={styles.emptyQueue}>
              <Text style={styles.emptyQueueText}>No requests yet</Text>
              <Text style={styles.emptyQueueSubtext}>
                Share your QR code with patrons to receive requests
              </Text>
            </View>
          ) : (
            queueRequests.map(renderQueueItem)
          )}
        </ScrollView>
      )}

      {/* History Tab (Placeholder) */}
      {currentTab === 'history' && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>History coming soon</Text>
        </View>
      )}

      {/* Settings Tab (Placeholder) */}
      {currentTab === 'settings' && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Settings coming soon</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '600',
  },
  nowPlayingBanner: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nowPlayingContent: {
    flex: 1,
  },
  nowPlayingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e9d5ff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nowPlayingArtist: {
    fontSize: 14,
    color: '#e9d5ff',
    marginTop: 2,
  },
  completeButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#8b5cf6',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  queueList: {
    flex: 1,
  },
  queueItem: {
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  queueItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  queuePosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  queuePositionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  queueItemInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  artistName: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  requestedBy: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusAccepted: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  vetoButton: {
    backgroundColor: '#ef4444',
  },
  playButton: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyQueue: {
    padding: 32,
    alignItems: 'center',
  },
  emptyQueueText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
  },
  emptyQueueSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default DJPortalScreen;
