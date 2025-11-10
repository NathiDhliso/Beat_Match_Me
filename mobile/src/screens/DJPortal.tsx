/**
 * DJ Portal Screen - Mobile
 * Swipeable interface with peek previews for Queue, Library, Revenue, and Settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
import { HorizontalPager } from '../components/HorizontalPager';
import { QueueView } from './views/QueueView';
import { LibraryView } from './views/LibraryView';
import { RevenueView } from './views/RevenueView';
import { SettingsView } from './views/SettingsView';

type PageView = 'queue' | 'library' | 'revenue' | 'settings';

export const DJPortalScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState<PageView>('queue');
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'orbital'>('orbital');

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
      position: index + 1,
      type: req.isSpotlight ? 'spotlight' : req.dedication ? 'dedication' : 'standard',
    }));

  const pendingRequests = queueRequests.filter((r: any) => r.status === 'PENDING');
  const acceptedRequests = queueRequests.filter((r: any) => r.status === 'ACCEPTED');

  const pageNames: PageView[] = ['queue', 'library', 'revenue', 'settings'];
  
  // Calculate total revenue
  const totalRevenue = queueRequests.reduce((sum: number, req: any) => sum + (req.price || 0), 0);

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

  const pages = [
    <QueueView
      queueRequests={queueRequests}
      totalRevenue={totalRevenue}
      viewMode={viewMode}
      setViewMode={setViewMode}
      refreshing={refreshing}
      onRefresh={onRefresh}
      currentlyPlaying={currentlyPlaying}
      onAcceptRequest={handleAcceptRequest}
      onVetoRequest={handleVetoRequest}
      onMarkPlaying={handleMarkPlaying}
    />,
    <LibraryView />,
    <RevenueView
      totalRevenue={totalRevenue}
      queueRequests={queueRequests}
      acceptedRequests={acceptedRequests}
      pendingRequests={pendingRequests}
      event={event}
    />,
    <SettingsView
      currentEventId={currentEventId}
      connectionStatus={connectionStatus}
      onLogout={logout}
    />,
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DJ Portal</Text>
          {event && <Text style={styles.headerSubtitle}>{event.venueName}</Text>}
        </View>
        <Text style={styles.pageIndicator}>{currentPage.toUpperCase()}</Text>
      </View>

      {renderNowPlaying()}

      <HorizontalPager
        pages={pages}
        initialPage={0}
        onPageChange={(index) => setCurrentPage(pageNames[index])}
      />
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
  pageIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
    letterSpacing: 1,
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
});

export default DJPortalScreen;
