/**
 * User Portal Screen - Mobile
 * Audience interface for discovering events, browsing songs, and submitting requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../hooks/useEvent';
import { useQueue } from '../hooks/useQueue';
import { useTracklist } from '../hooks/useTracklist';
import { useQueueSubscription } from '../hooks/useQueueSubscription';
import {
  fetchActiveEvents,
  submitRequest,
  fetchUserActiveRequests,
} from '../services/graphql';

type ViewState = 'discovery' | 'browsing' | 'requesting' | 'waiting';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  basePrice: number;
  albumArt?: string;
}

export const UserPortalScreen: React.FC = () => {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('discovery');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [myRequestPosition, setMyRequestPosition] = useState<number | null>(null);
  const [dedicationMessage, setDedicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event Discovery
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tinder-style swipe
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDelta, setCurrentDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPeeking, setIsPeeking] = useState(false);

  // Hooks
  const { event } = useEvent(currentEventId);
  const { queue, refetch: refetchQueue } = useQueue(currentSetId);
  const { tracklist, loading: tracklistLoading } = useTracklist(currentEventId);
  const { queueData: liveQueue } = useQueueSubscription(
    currentSetId || '',
    currentEventId || ''
  );

  // Combine queue data (prefer live subscription data)
  const queueRequests = (liveQueue?.orderedRequests || queue?.orderedRequests || []);

  // Load active events
  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      console.log('[User Portal] Loading active events...');
      
      const data = await fetchActiveEvents();
      setEvents(data || []);
      console.log('[User Portal] Events loaded:', data?.length || 0);
    } catch (error: any) {
      console.error('[User Portal] Failed to load events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    if (currentSetId) {
      await refetchQueue();
    }
    setRefreshing(false);
  };

  // Check user's position in queue
  useEffect(() => {
    if (!queueRequests || !user?.userId) return;

    const myRequest = queueRequests.find((req: any) =>
      req.userId === user.userId && (req.status === 'PENDING' || req.status === 'ACCEPTED')
    );

    if (myRequest) {
      setMyRequestPosition(myRequest.queuePosition || null);
      if (viewState !== 'waiting' && myRequest.queuePosition) {
        setViewState('waiting');
      }
    } else {
      setMyRequestPosition(null);
    }
  }, [queueRequests, user?.userId]);

  // Load user's active requests on mount
  useEffect(() => {
    const loadMyRequests = async () => {
      if (!user?.userId || !currentEventId) return;

      try {
        const activeRequests = await fetchUserActiveRequests(user.userId, currentEventId);

        if (activeRequests && activeRequests.length > 0) {
          const activeRequest = activeRequests[0];
          setMyRequestPosition(activeRequest.queuePosition || null);
          setViewState('waiting');
          console.log('[User Portal] Active request found:', activeRequest);
        }
      } catch (error) {
        console.error('[User Portal] Failed to load active requests:', error);
      }
    };

    if (currentEventId) {
      loadMyRequests();
    }
  }, [user?.userId, currentEventId]);

  // Handle event selection
  const handleSelectEvent = (eventData: any) => {
    setCurrentEventId(eventData.eventId);
    setCurrentSetId(eventData.eventId); // Simplified - using eventId as setId
    setViewState('browsing');
  };

  // Handle song selection
  const handleSelectSong = (song: Song) => {
    // Check for duplicate requests
    const existingRequest = queueRequests.find(
      (req: any) =>
        req.songTitle === song.title &&
        req.artistName === song.artist &&
        req.userId === user?.userId
    );

    if (existingRequest) {
      Alert.alert('Already Requested', 'You already requested this song!');
      return;
    }

    // Check user's active request limit (max 3)
    const userActiveRequests = queueRequests.filter(
      (req: any) => req.userId === user?.userId && req.status === 'PENDING'
    ).length || 0;

    if (userActiveRequests >= 3) {
      Alert.alert('Request Limit', 'Maximum 3 active requests allowed');
      return;
    }

    setSelectedSong(song);
    setViewState('requesting');
  };

  // Submit request
  const handleSubmitRequest = async () => {
    if (!selectedSong || !currentEventId || !currentSetId || !user?.userId) return;

    setIsSubmitting(true);

    try {
      console.log('[User Portal] Submitting request:', selectedSong);

      // Create request input
      const requestInput = {
        eventId: currentEventId,
        setId: currentSetId,
        userId: user.userId,
        userName: user.name || 'User',
        userTier: user.tier || 'BRONZE',
        songId: selectedSong.id,
        songTitle: selectedSong.title,
        artistName: selectedSong.artist,
        genre: selectedSong.genre,
        price: selectedSong.basePrice,
        dedicationMessage: dedicationMessage.trim() || undefined,
        requestType: 'STANDARD',
        status: 'PENDING',
        timestamp: Date.now(),
      };

      // Submit request
      await submitRequest(requestInput);

      Alert.alert(
        'Request Submitted! 🎵',
        `${selectedSong.title} by ${selectedSong.artist} has been added to the queue!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setViewState('waiting');
              setDedicationMessage('');
              refetchQueue();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[User Portal] Submit request failed:', error);
      Alert.alert('Error', error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter songs by search query
  const filteredSongs = tracklist.filter((song) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.genre.toLowerCase().includes(query)
    );
  });

  // Swipe handlers (reused from web with peek animation)
  const handleTouchStart = (e: any) => {
    setTouchStart({
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    });
    setIsPeeking(true);
  };

  const handleTouchMove = (e: any) => {
    if (!touchStart) return;

    const deltaX = e.nativeEvent.pageX - touchStart.x;
    const deltaY = e.nativeEvent.pageY - touchStart.y;

    // Resistance effect (30% of actual movement)
    const resistance = 0.3;
    setCurrentDelta({
      x: deltaX * resistance,
      y: deltaY * resistance,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart) return;

    const absX = Math.abs(currentDelta.x);
    const absY = Math.abs(currentDelta.y);
    const threshold = 30; // 100px actual movement = 30px with resistance

    // Reset peek
    setCurrentDelta({ x: 0, y: 0 });
    setIsPeeking(false);

    // Determine swipe direction
    if (absX > threshold && absX > absY) {
      if (currentDelta.x > 0) {
        // Swipe right - join event
        if (events[currentEventIndex]) {
          handleSelectEvent(events[currentEventIndex]);
        }
      } else {
        // Swipe left - skip
        setCurrentEventIndex(prev => Math.min(prev + 1, events.length - 1));
      }
    }

    setTouchStart(null);
  };

  // Get swipe hint indicator
  const getSwipeHint = () => {
    if (!isPeeking) return null;
    
    const absX = Math.abs(currentDelta.x);
    const absY = Math.abs(currentDelta.y);
    
    if (absX < 6 && absY < 6) return null; // 20px actual = 6px with resistance
    
    if (absX > absY) {
      return currentDelta.x > 0 ? '→' : '←';
    } else {
      return currentDelta.y > 0 ? '↓' : '↑';
    }
  };

  // Render Event Discovery
  const renderDiscovery = () => {
    if (eventsLoading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      );
    }

    const currentEvent = events[currentEventIndex];
    const swipeHint = getSwipeHint();

    if (!currentEvent) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Discover Events</Text>
            <Text style={styles.headerSubtitle}>Swipe right to join →</Text>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No More Events</Text>
            <Text style={styles.emptyStateText}>
              Check back soon for new events!
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                setCurrentEventIndex(0);
                onRefresh();
              }}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover Events</Text>
          <Text style={styles.headerSubtitle}>
            Swipe right to join → | Event {currentEventIndex + 1} of {events.length}
          </Text>
        </View>

        {/* Tinder Card with Peek Animation */}
        <View
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateX: currentDelta.x },
                { translateY: currentDelta.y },
              ]
            }
          ]}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <View style={styles.eventCardSwipe}>
            <View style={styles.eventCardContent}>
              <Text style={styles.eventVenue}>{currentEvent.venueName}</Text>
              {currentEvent.djName && (
                <Text style={styles.eventDJ}>DJ: {currentEvent.djName}</Text>
              )}
              <View style={styles.eventMeta}>
                {currentEvent.status === 'ACTIVE' && (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE NOW</Text>
                  </View>
                )}
                {currentEvent.genre && (
                  <Text style={styles.eventGenre}>{currentEvent.genre}</Text>
                )}
              </View>
            </View>

            {/* Swipe Indicators */}
            {currentDelta.x < -18 && (
              <View style={styles.swipeIndicatorLeft}>
                <Text style={styles.swipeText}>← SKIP</Text>
              </View>
            )}
            {currentDelta.x > 18 && (
              <View style={styles.swipeIndicatorRight}>
                <Text style={styles.swipeText}>JOIN →</Text>
              </View>
            )}
          </View>

          {/* Swipe Hint */}
          {swipeHint && (
            <View style={styles.swipeHintContainer}>
              <View style={styles.swipeHint}>
                <Text style={styles.swipeHintText}>{swipeHint}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => setCurrentEventIndex(prev => Math.min(prev + 1, events.length - 1))}
          >
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => currentEvent && handleSelectEvent(currentEvent)}
          >
            <Text style={styles.buttonText}>Join Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render Song Browsing
  const renderBrowsing = () => {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setCurrentEventId(null);
              setCurrentSetId(null);
              setViewState('discovery');
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {event?.venueName || 'Select a Song'}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Song List */}
        <ScrollView style={styles.songList}>
          {tracklistLoading ? (
            <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 32 }} />
          ) : filteredSongs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No Songs Available</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No songs match your search' : 'DJ library is empty'}
              </Text>
            </View>
          ) : (
            filteredSongs.map((song) => (
              <TouchableOpacity
                key={song.id}
                style={styles.songCard}
                onPress={() => handleSelectSong(song)}
              >
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songArtist}>{song.artist}</Text>
                  <View style={styles.songMeta}>
                    <Text style={styles.songGenre}>{song.genre}</Text>
                    <Text style={styles.songPrice}>R{song.basePrice}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  // Render Request Confirmation
  const renderRequesting = () => {
    if (!selectedSong) return null;

    return (
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Request</Text>

            <View style={styles.songPreview}>
              <Text style={styles.songPreviewTitle}>{selectedSong.title}</Text>
              <Text style={styles.songPreviewArtist}>{selectedSong.artist}</Text>
              <Text style={styles.songPreviewPrice}>R{selectedSong.basePrice}</Text>
            </View>

            <View style={styles.dedicationContainer}>
              <Text style={styles.dedicationLabel}>Dedication (Optional)</Text>
              <TextInput
                style={styles.dedicationInput}
                placeholder="Add a personal message..."
                placeholderTextColor="#9ca3af"
                value={dedicationMessage}
                onChangeText={setDedicationMessage}
                multiline
                maxLength={200}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSelectedSong(null);
                  setViewState('browsing');
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmitRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render Waiting State
  const renderWaiting = () => {
    return (
      <View style={styles.container}>
        <View style={styles.waitingContainer}>
          <View style={styles.positionBadge}>
            <Text style={styles.positionNumber}>#{myRequestPosition || '?'}</Text>
            <Text style={styles.positionLabel}>In Queue</Text>
          </View>

          {selectedSong && (
            <View style={styles.waitingSongInfo}>
              <Text style={styles.waitingSongTitle}>{selectedSong.title}</Text>
              <Text style={styles.waitingSongArtist}>{selectedSong.artist}</Text>
            </View>
          )}

          <Text style={styles.waitingMessage}>
            {myRequestPosition === 1
              ? '🎵 Your song is playing NOW!'
              : myRequestPosition === 2
              ? '🔜 You\'re up next!'
              : `${queueRequests.length - (myRequestPosition || 0)} songs ahead of you`}
          </Text>

          <TouchableOpacity
            style={styles.backToBrowsingButton}
            onPress={() => setViewState('browsing')}
          >
            <Text style={styles.backToBrowsingText}>Browse More Songs</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Main Render
  return (
    <View style={styles.container}>
      {viewState === 'discovery' && renderDiscovery()}
      {viewState === 'browsing' && renderBrowsing()}
      {viewState === 'requesting' && renderRequesting()}
      {viewState === 'waiting' && renderWaiting()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 48,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f3f4f6',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  eventCardContent: {},
  eventVenue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  eventDJ: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventGenre: {
    fontSize: 12,
    color: '#9ca3af',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    color: '#f3f4f6',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  songList: {
    flex: 1,
  },
  songCard: {
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  songInfo: {},
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  songMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songGenre: {
    fontSize: 12,
    color: '#6b7280',
  },
  songPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f3f4f6',
    marginBottom: 20,
    textAlign: 'center',
  },
  songPreview: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 20,
  },
  songPreviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  songPreviewArtist: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 12,
  },
  songPreviewPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  dedicationContainer: {
    marginBottom: 20,
  },
  dedicationLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  dedicationInput: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    color: '#f3f4f6',
    fontSize: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#374151',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#f3f4f6',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#8b5cf6',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  positionBadge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  positionNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  positionLabel: {
    fontSize: 16,
    color: '#e9d5ff',
    marginTop: 4,
  },
  waitingSongInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  waitingSongTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f3f4f6',
    textAlign: 'center',
  },
  waitingSongArtist: {
    fontSize: 18,
    color: '#9ca3af',
    marginTop: 4,
  },
  waitingMessage: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 32,
  },
  backToBrowsingButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  backToBrowsingText: {
    color: '#f3f4f6',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  eventCardSwipe: {
    width: '100%',
    height: 500,
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  swipeIndicatorLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 12,
    borderRadius: 12,
  },
  swipeIndicatorRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    padding: 12,
    borderRadius: 12,
  },
  swipeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  swipeHintContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
  },
  swipeHint: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 48,
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  skipButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserPortalScreen;
