/**
 * DJ Portal - Orbital Interface
 * Revolutionary gesture-first design with floating controls
 */

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../hooks/useEvent';
import { useQueue } from '../hooks/useQueue';
import { useTracklist } from '../hooks/useTracklist';
import { useNotifications } from '../context/NotificationContext';
import { useTheme, useThemeClasses } from '../context/ThemeContext';
import { useQueueSubscription } from '../hooks/useQueueSubscription';
import {
  FloatingActionBubble,
  StatusArc,
  CircularQueueVisualizer,
  GestureHandler,
} from '../components/OrbitalInterface';
import { DJLibrary } from '../components/DJLibrary';
import type { Track } from '../components/DJLibrary';
import { LogOut, Music, DollarSign, Settings, Search, QrCode, Play, Bell, Sparkles } from 'lucide-react';
import { MarkPlayingPanel, PlayingCelebration } from '../components/MarkPlayingPanel';
import { NowPlayingCard } from '../components/NowPlayingCard';
import { DJProfileScreen } from '../components/ProfileManagement';
import { RequestCapManager } from '../components/RequestCapManager';
import { showUndoToast } from '../components/UndoToast';
import { submitAcceptRequest, submitVeto, submitMarkPlaying, submitMarkCompleted, submitRefund, submitUpdateSetStatus, submitUploadTracklist, submitSetEventTracklist } from '../services/graphql';
import { updateDJSetSettings, updateDJProfile, updateSetPlaylist } from '../services/djSettings';
// import { processRefund } from '../services/payment'; // Available for future use
import { BusinessMetrics } from '../services/analytics';

// Phase 8: Lazy load large modals for better performance
const EventCreator = lazy(() => import('../components').then(m => ({ default: m.EventCreator })));
const EventPlaylistManager = lazy(() => import('../components').then(m => ({ default: m.EventPlaylistManager })));
const QRCodeDisplay = lazy(() => import('../components').then(m => ({ default: m.QRCodeDisplay })));
const NotificationCenter = lazy(() => import('../components/Notifications').then(m => ({ default: m.NotificationCenter })));
const SettingsModal = lazy(() => import('../components/Settings').then(m => ({ default: m.Settings })));

type ViewMode = 'queue' | 'library' | 'revenue' | 'settings';

export const DJPortalOrbital: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentTheme, themeMode, setThemeMode } = useTheme();
  const themeClasses = useThemeClasses();
  const [currentView, setCurrentView] = useState<ViewMode>('queue');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  
  // Settings state
  const [basePrice, setBasePrice] = useState(20);
  const [requestsPerHour, setRequestsPerHour] = useState(20);
  const [spotlightSlots, setSpotlightSlots] = useState(1);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  // DJ Set management state
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false); // Converted to slide-out panel
  const [mySets, setMySets] = useState<any[]>([]);
  const [showSetSelector, setShowSetSelector] = useState(false);

  // Features 6, 10, 12 - Accept/Veto/Playing state
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showPlayingPanel, setShowPlayingPanel] = useState(false);
  const [showPlayingCelebration, setShowPlayingCelebration] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Phase 4: DJ Portal features
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Converted to slide-out panel
  const { notifications, unreadCount, addNotification, markAsRead, clearNotification } = useNotifications();

  // Live Mode Control - Manual toggle for when DJ is ready to accept requests
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Real-time queue subscription (rename to avoid shadowing local queue variable)
  const { queueData: liveQueueData } = useQueueSubscription(
    currentSetId || '',
    currentEventId || ''
  );

  // Track last queue count for new request notifications
  const lastQueueCountRef = useRef(0);
  const lastNotificationTime = useRef<Record<string, number>>({});

  // Play a short notification beep using Web Audio API (browser-safe)
  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880; // A high beep
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.45);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.45);

      // Close context after short delay to free resources
      setTimeout(() => {
        try { audioContext.close(); } catch { /* ignore */ }
      }, 1000);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  // Helper: simple throttle so we don't spam sounds/notifications (1 per 2 seconds per type)
  const canNotify = useCallback((key: string, minInterval = 2000) => {
    const now = Date.now();
    const last = lastNotificationTime.current[key] || 0;
    if (now - last < minInterval) return false;
    lastNotificationTime.current[key] = now;
    return true;
  }, []);

  // Watch live subscription updates and notify on new requests
  useEffect(() => {
    const newCount = liveQueueData?.orderedRequests?.length || 0;

    // If queue grew, notify
    if (newCount > lastQueueCountRef.current) {
      // Throttle notification events
      if (canNotify('new_request')) {
        playNotificationSound();
        addNotification({
          type: 'queue_update',
          title: '🎵 New Request',
          message: `Queue now has ${newCount} request${newCount === 1 ? '' : 's'}`,
          metadata: { eventId: currentEventId || undefined },
        });
      }
    }

    lastQueueCountRef.current = newCount;
  }, [liveQueueData, playNotificationSound, addNotification, canNotify, currentEventId]);

  // Load performer's DJ sets on mount
  useEffect(() => {
    const loadPerformerSets = async () => {
      if (!user?.userId) {
        console.log('❌ No userId available yet');
        return;
      }

      console.log('🔍 Loading DJ sets for performer:', user.userId);

      try {
        const { generateClient } = await import('aws-amplify/api');
        const client = generateClient({
          authMode: 'userPool'
        });
        
        console.log('📡 Querying listPerformerSets...');
        
        const response: any = await client.graphql({
          query: `
            query ListPerformerSets($performerId: ID!) {
              listPerformerSets(performerId: $performerId) {
                setId
                eventId
                performerId
                setStartTime
                setEndTime
                status
                isAcceptingRequests
                playlistType
                playlistId
                playlistName
                playlistTracks
                playlistAppliedAt
              }
            }
          `,
          variables: { performerId: user.userId }
        });

        console.log('✅ Raw response:', response);
        const performerSets = response.data.listPerformerSets || [];
        console.log(`📊 Found ${performerSets.length} sets:`, performerSets);
        
        // Fetch event details for each set to get venue name
        const setsWithEvents = await Promise.all(
          performerSets.map(async (set: any) => {
            try {
              const eventResponse: any = await client.graphql({
                query: `
                  query GetEvent($eventId: ID!) {
                    getEvent(eventId: $eventId) {
                      eventId
                      venueName
                      venueLocation {
                        address
                        city
                      }
                    }
                  }
                `,
                variables: { eventId: set.eventId }
              });
              return {
                ...set,
                event: eventResponse.data.getEvent
              };
            } catch (error) {
              console.error(`❌ Failed to fetch event ${set.eventId}:`, error);
              return set;
            }
          })
        );
        
        console.log('📋 Sets with event details:', setsWithEvents);
        setMySets(setsWithEvents);
        
        // Auto-select most recent ACTIVE set if no set selected
        if (!currentSetId && performerSets.length > 0) {
          const activeSets = performerSets
            .filter((s: any) => s.status === 'ACTIVE' || s.status === 'SCHEDULED')
            .sort((a: any, b: any) => new Date(b.setStartTime).getTime() - new Date(a.setStartTime).getTime());
          
          if (activeSets.length > 0) {
            console.log('🎵 Auto-loading most recent set:', activeSets[0].setId);
            setCurrentSetId(activeSets[0].setId);
            setCurrentEventId(activeSets[0].eventId);
          } else {
            console.log('⚠️ No active/scheduled sets found');
            // Don't set any IDs if no active sets
            setCurrentSetId(null);
            setCurrentEventId(null);
          }
        }
      } catch (error) {
        console.error('❌ Failed to load performer sets:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
    };

    loadPerformerSets();
  }, [user?.userId]); // Removed currentSetId dependency to allow reloading

  // Fetch real data
  const { event: currentEvent } = useEvent(currentEventId);
  const { queue: queueData } = useQueue(currentSetId);
  const { tracklist, reload: reloadTracklist } = useTracklist(currentEventId);

  // Transform data
  const queueRequests = queueData?.orderedRequests?.map((req: any, index: number) => ({
    id: req.requestId,
    songTitle: req.songTitle,
    artistName: req.artistName,
    type: req.requestType || 'standard',
    position: index + 1,
  })) || [];

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoaded, setTracksLoaded] = useState(false);

  const totalRevenue = queueRequests.reduce((sum: number) => sum + 20, 0);

  // Load tracks from backend (from tracklist) and apply saved playlist
  useEffect(() => {
    const loadTracksAndPlaylist = async () => {
      if (!currentSetId || !user?.userId) return;
      
      try {
        const client = generateClient({
          authMode: 'userPool'
        });
        
        // 1. Load tracklist first (this contains the actual track data)
        if (tracklist.length > 0 && !tracksLoaded) {
          console.log(`📚 Loading ${tracklist.length} tracks from tracklist`);
          const initialTracks = tracklist.map((t, i) => ({
            id: `track-${i}`,
            title: t.title,
            artist: t.artist,
            genre: t.genre,
            basePrice: t.basePrice,
            isEnabled: true,
            duration: t.duration ? parseInt(t.duration) : undefined,
            albumArt: t.albumArt,
          }));
          setTracks(initialTracks);
          setTracksLoaded(true);
        }
        
        // 2. Load saved playlist settings
        const response: any = await client.graphql({
          query: `
            query GetDJSet($setId: ID!) {
              getDJSet(setId: $setId) {
                setId
                playlistType
                playlistId
                playlistName
                playlistTracks
                playlistAppliedAt
              }
            }
          `,
          variables: { setId: currentSetId }
        });
        
        const set = response.data.getDJSet;
        
        // 3. Apply saved playlist (enable/disable tracks based on saved IDs)
        if (set && set.playlistTracks && set.playlistTracks.length > 0) {
          console.log(`🎵 Applying saved playlist: ${set.playlistName} (${set.playlistTracks.length} songs)`);
          
          setTracks(prevTracks => {
            if (prevTracks.length === 0) return prevTracks;
            
            return prevTracks.map(track => ({
              ...track,
              isEnabled: set.playlistTracks.includes(track.id)
            }));
          });
          
          addNotification({
            type: 'info',
            title: '🎵 Playlist Loaded',
            message: `${set.playlistName}: ${set.playlistTracks.length} songs enabled`,
          });
        } else {
          console.log('ℹ️ No saved playlist for this set');
        }
      } catch (error) {
        console.error('❌ Failed to load tracks/playlist:', error);
      }
    };
    
    loadTracksAndPlaylist();
  }, [currentSetId, tracklist, tracksLoaded, user?.userId]); // Run when set or tracklist changes

  // Gesture Navigation
  const handleSwipeUp = () => setCurrentView('queue');
  const handleSwipeDown = () => setCurrentView('library');
  const handleSwipeLeft = () => setCurrentView('revenue');
  const handleSwipeRight = () => setCurrentView('settings');

  // Track Management with Backend Sync
  const syncTracksToBackend = async (updatedTracks: Track[]) => {
    if (!user?.userId || !currentEventId) {
      console.warn('⚠️ Cannot sync tracks: missing userId or eventId');
      throw new Error('Missing userId or eventId');
    }
    
    // CRITICAL FIX: Wrapped in try-catch for error handling
    try {
      console.log('💾 Syncing tracks to backend...');
      const songs = updatedTracks.map(t => ({
        title: t.title,
        artist: t.artist,
        genre: t.genre,
        basePrice: t.basePrice,
        isEnabled: t.isEnabled,
        albumArt: t.albumArt,
        duration: t.duration
      }));
      
      // Step 1: Upload tracks to DJ's library
      const uploadResult = await submitUploadTracklist(user.userId, songs);
      console.log('✅ Tracks uploaded to library:', uploadResult);
      
      // Step 2: Link tracks to the current event (use track titles as IDs for now)
      // Note: In production, you'd use actual song IDs returned from uploadTracklist
      const songIds = updatedTracks.map(t => t.id);
      const linkResult = await submitSetEventTracklist(currentEventId, songIds);
      console.log('✅ Tracks linked to event:', linkResult);
      
      // Step 3: Reset tracksLoaded and reload tracklist from backend
      setTracksLoaded(false);
      if (reloadTracklist) {
        reloadTracklist();
      }
      
      addNotification({
        type: 'info',
        title: '✅ Tracklist Updated',
        message: `${songs.length} songs synced to event`,
      });
    } catch (error) {
      console.error('❌ Failed to sync tracks:', error);
      addNotification({
        type: 'error',
        title: '❌ Sync Failed',
        message: 'Could not sync tracks to backend. Changes have been rolled back.',
      });
      // Rethrow error so calling functions can handle rollback
      throw error;
    }
  };

  const handleAddTrack = async (track: Omit<Track, 'id'>) => {
    // CRITICAL FIX: Capture state snapshot before optimistic update
    const previousTracks = [...tracks];
    
    try {
      // Optimistic update
      const newTrack = { ...track, id: `track-${Date.now()}` };
      const updatedTracks = [...tracks, newTrack];
      setTracks(updatedTracks);
      
      // Sync to backend (will throw on failure)
      await syncTracksToBackend(updatedTracks);
      
      addNotification({
        type: 'info',
        title: '✅ Track Added',
        message: `${track.title} by ${track.artist}`,
      });
    } catch (error) {
      // ROLLBACK: Restore previous state
      console.error('❌ Track add failed, rolling back:', error);
      setTracks(previousTracks);
      addNotification({
        type: 'error',
        title: '❌ Failed to Add Track',
        message: `Could not add ${track.title}. Please try again.`,
      });
    }
  };

  const handleUpdateTrack = async (id: string, updates: Partial<Track>) => {
    // CRITICAL FIX: Capture state snapshot before optimistic update
    const previousTracks = [...tracks];
    
    try {
      // Optimistic update
      const updatedTracks = tracks.map(t => (t.id === id ? { ...t, ...updates } : t));
      setTracks(updatedTracks);
      
      // Sync to backend (will throw on failure)
      await syncTracksToBackend(updatedTracks);
    } catch (error) {
      // ROLLBACK: Restore previous state
      console.error('❌ Track update failed, rolling back:', error);
      setTracks(previousTracks);
      addNotification({
        type: 'error',
        title: '❌ Failed to Update Track',
        message: 'Changes have been rolled back. Please try again.',
      });
    }
  };

  const handleDeleteTrack = async (id: string) => {
    // CRITICAL FIX: Capture state snapshot before optimistic update
    const previousTracks = [...tracks];
    const track = tracks.find(t => t.id === id);
    
    try {
      // Optimistic update
      const updatedTracks = tracks.filter(t => t.id !== id);
      setTracks(updatedTracks);
      
      // Sync to backend (will throw on failure)
      await syncTracksToBackend(updatedTracks);
      
      if (track) {
        addNotification({
          type: 'info',
          title: '🗑️ Track Removed',
          message: `${track.title} deleted`,
        });
      }
    } catch (error) {
      // ROLLBACK: Restore previous state
      console.error('❌ Track delete failed, rolling back:', error);
      setTracks(previousTracks);
      addNotification({
        type: 'error',
        title: '❌ Failed to Delete Track',
        message: track ? `Could not delete ${track.title}. Please try again.` : 'Failed to delete track.',
      });
    }
  };

  const handleToggleTrack = async (id: string) => {
    // CRITICAL FIX: Capture state snapshot before optimistic update
    const previousTracks = [...tracks];
    
    try {
      // Optimistic update
      const updatedTracks = tracks.map(t => (t.id === id ? { ...t, isEnabled: !t.isEnabled } : t));
      setTracks(updatedTracks);
      
      // Sync to backend (will throw on failure)
      await syncTracksToBackend(updatedTracks);
      
      const track = updatedTracks.find(t => t.id === id);
      if (track) {
        addNotification({
          type: 'info',
          title: track.isEnabled ? '✅ Track Enabled' : '⏸️ Track Disabled',
          message: `${track.title}`,
        });
      }
    } catch (error) {
      // ROLLBACK: Restore previous state
      console.error('❌ Track toggle failed, rolling back:', error);
      setTracks(previousTracks);
      addNotification({
        type: 'error',
        title: '❌ Failed to Toggle Track',
        message: 'Changes have been rolled back. Please try again.',
      });
    }
  };

  // Track vetoed requests for optimistic UI
  const [vetoedRequestIds, setVetoedRequestIds] = useState<Set<string>>(new Set());
  // Track accepted requests for optimistic UI
  const [acceptedRequestIds, setAcceptedRequestIds] = useState<Set<string>>(new Set());

  const handleVeto = (requestId: string) => {
    console.log('Veto request (optimistic):', requestId);
    const request = queueRequests.find((r: any) => r.requestId === requestId);
    if (!request) return;

    let vetoTimerId: NodeJS.Timeout | null = null;
    let isVetoed = false;

    // Optimistically hide from UI
    setVetoedRequestIds(prev => new Set(prev).add(requestId));

    // Show undo toast
    showUndoToast({
      message: `Vetoing "${request.songTitle}" - R${request.price} will be refunded`,
      duration: 5000,
      onUndo: () => {
        // Cancel the veto
        if (vetoTimerId) {
          clearTimeout(vetoTimerId);
          vetoTimerId = null;
        }
        
        // Restore in UI
        setVetoedRequestIds(prev => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
        isVetoed = false;

        addNotification({
          type: 'info',
          title: '↩️ Veto Cancelled',
          message: `"${request.songTitle}" restored to queue`,
        });
      },
    });

    // Finalize veto after 5 seconds
    vetoTimerId = setTimeout(async () => {
      if (isVetoed) return; // Already processed
      isVetoed = true;

      try {
        // 1. Veto the request
        await submitVeto(request.requestId, "DJ vetoed request");
        
        // 2. Process refund automatically
        try {
          const refund = await submitRefund(request.requestId, 'DJ vetoed request');
          console.log('✅ Refund processed:', refund);
          
          // 3. Notify DJ of successful veto + refund
          addNotification({
            type: 'info',
            title: '✅ Request Vetoed',
            message: `Refund of R${request.price} processed for ${request.userName}`,
            metadata: {
              requestId: request.requestId,
            }
          });
        } catch (refundError) {
          console.error('⚠️ Refund processing failed:', refundError);
          
          // Alert DJ but don't fail the veto
          addNotification({
            type: 'error',
            title: '⚠️ Refund Pending',
            message: 'Request vetoed but refund needs manual processing. Contact support.',
          });
        }

        console.log('✅ Request vetoed successfully');
      } catch (error) {
        console.error('❌ Veto failed:', error);
        
        // Restore in UI on error
        setVetoedRequestIds(prev => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
        
        addNotification({
          type: 'error',
          title: '❌ Veto Failed',
          message: 'Failed to veto request. Changes rolled back.',
        });
      }
    }, 5000);
  };

  // Features 6, 10, 12 - Request Management Handlers
  const handleRequestTap = (request: any) => {
    // Direct accept with optimistic UI (no modal)
    handleAccept(request);
  };

  const handleAccept = async (request?: any) => {
    const requestToAccept = request || selectedRequest;
    if (!requestToAccept || !currentSetId) return;

    let acceptTimerId: NodeJS.Timeout | null = null;
    let isAccepted = false;

    // Optimistically mark as accepted in UI
    setAcceptedRequestIds(prev => new Set(prev).add(requestToAccept.requestId));

    // Show undo toast
    showUndoToast({
      message: `Accepting "${requestToAccept.songTitle}" by ${requestToAccept.artistName}`,
      duration: 5000,
      onUndo: () => {
        // Cancel the accept
        if (acceptTimerId) {
          clearTimeout(acceptTimerId);
          acceptTimerId = null;
        }
        
        // Restore in UI
        setAcceptedRequestIds(prev => {
          const next = new Set(prev);
          next.delete(requestToAccept.requestId);
          return next;
        });
        isAccepted = false;

        addNotification({
          type: 'info',
          title: '↩️ Accept Cancelled',
          message: `"${requestToAccept.songTitle}" moved back to pending`,
        });
      },
    });

    // Finalize accept after 5 seconds
    acceptTimerId = setTimeout(async () => {
      if (isAccepted) return; // Already processed
      isAccepted = true;

      try {
        await submitAcceptRequest(requestToAccept.requestId, currentSetId);
        
        addNotification({
          type: 'info',
          title: '✅ Request Accepted',
          message: `"${requestToAccept.songTitle}" added to queue`,
        });

        console.log('✅ Request accepted successfully');
      } catch (error) {
        console.error('❌ Accept failed:', error);
        
        // Restore in UI on error
        setAcceptedRequestIds(prev => {
          const next = new Set(prev);
          next.delete(requestToAccept.requestId);
          return next;
        });
        
        addNotification({
          type: 'error',
          title: '❌ Accept Failed',
          message: 'Failed to accept request. Changes rolled back.',
        });
      }
    }, 5000);
  };

  // Old veto confirm handler removed - now using optimistic pattern

  const handleMarkPlaying = () => {
    // Get the #1 request in queue
    const topRequest = queueRequests.find((r: any) => r.queuePosition === 1) || queueRequests[0];
    if (topRequest) {
      setSelectedRequest(topRequest);
      setShowPlayingPanel(true);
    }
  };

  const handlePlayingConfirm = async () => {
    if (!selectedRequest || !currentSetId) return;
    setIsProcessing(true);
    
    try {
      await submitMarkPlaying(selectedRequest.requestId, currentSetId);
      setShowPlayingPanel(false);
      setShowPlayingCelebration(true);
      setCurrentlyPlaying({
        requestId: selectedRequest.requestId,
        songTitle: selectedRequest.songTitle,
        artistName: selectedRequest.artistName,
        albumArt: selectedRequest.albumArt,
        duration: selectedRequest.duration || '3:00',
        userName: selectedRequest.userName,
        userTier: selectedRequest.userTier,
        price: selectedRequest.price,
        startedAt: Date.now(),
      });
      
      // Auto-hide celebration after 2 seconds
      setTimeout(() => {
        setShowPlayingCelebration(false);
      }, 2000);

      console.log('✅ Marked as playing successfully');
    } catch (error) {
      console.error('❌ Mark playing failed:', error);
      alert('Failed to mark as playing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentlyPlaying) return;
    
    try {
      await submitMarkCompleted(currentlyPlaying.requestId);
      setCurrentlyPlaying(null);
      console.log('✅ Request marked as completed');
    } catch (error) {
      console.error('❌ Mark complete failed:', error);
      alert('Failed to mark as complete.');
    }
  };

  const handleEventCreated = async (eventId: string, setId?: string) => {
    console.log('✅ Event created callback:', { eventId, setId });
    setCurrentEventId(eventId);
    if (setId) {
      setCurrentSetId(setId);
      
      // Manually add the new set to the list (optimistic update)
      const newSet = {
        setId,
        eventId,
        performerId: user?.userId,
        setStartTime: Date.now(),
        setEndTime: Date.now() + (2 * 60 * 60 * 1000), // +2 hours
        status: 'SCHEDULED',
        isAcceptingRequests: true,
        event: null // Will be fetched on next load
      };
      
      setMySets(prev => [...prev, newSet]);
      
      // Fetch the event details for the new set
      try {
        const { generateClient } = await import('aws-amplify/api');
        const client = generateClient({
          authMode: 'userPool'
        });
        
        const eventResponse: any = await client.graphql({
          query: `
            query GetEvent($eventId: ID!) {
              getEvent(eventId: $eventId) {
                eventId
                venueName
                venueLocation {
                  address
                  city
                }
              }
            }
          `,
          variables: { eventId }
        });
        
        // Update the set with event details
        setMySets(prev => prev.map(s => 
          s.setId === setId 
            ? { ...s, event: eventResponse.data.getEvent }
            : s
        ));
      } catch (error) {
        console.error('Failed to fetch event details:', error);
      }
    }
  };

  // Handle GO LIVE - DJ manually activates live mode
  const handleGoLive = async () => {
    if (!currentSetId) return;
    
    const confirmed = window.confirm(
      '🔴 GO LIVE?\n\nUsers will be able to scan the QR code and submit song requests.\n\nMake sure you\'re ready!'
    );
    
    if (!confirmed) return;
    
    setIsLiveMode(true);
    
    addNotification({
      type: 'info',
      title: '🔴 You are LIVE!',
      message: 'Users can now scan QR code and submit requests',
    });
  };

  // Handle PAUSE LIVE MODE - Stop accepting new requests
  const handlePauseLive = async () => {
    const confirmed = window.confirm(
      '⏸️ PAUSE LIVE MODE?\n\nNew requests will be blocked, but your current queue will be preserved.\n\nYou can resume anytime.'
    );
    
    if (!confirmed) return;
    
    setIsLiveMode(false);
    
    addNotification({
      type: 'info',
      title: '⏸️ Live Mode Paused',
      message: 'Not accepting new requests. Current queue preserved.',
    });
  };

  const handleEndSet = async () => {
    if (!currentSetId) return;
    
    const pendingRequests = queueRequests.filter(
      (req: any) => req.status === 'PENDING' || req.status === 'ACCEPTED'
    );
    
    const confirmMessage = pendingRequests.length > 0
      ? `End set and refund ${pendingRequests.length} pending request${pendingRequests.length === 1 ? '' : 's'}?`
      : 'Are you sure you want to end this DJ set?';
    
    if (!confirm(confirmMessage)) return;
    
    setIsProcessing(true);
    
    try {
      // 1. Update set status to COMPLETED
      console.log('Ending DJ set:', currentSetId);
      await submitUpdateSetStatus(currentSetId, 'COMPLETED');
      
      // 2. Process refunds for all pending requests
      if (pendingRequests.length > 0) {
        console.log(`Processing ${pendingRequests.length} refunds...`);
        
        const refundPromises = pendingRequests.map(async (req: any) => {
          try {
            const refund = await submitRefund(req.requestId, 'DJ set ended');
            console.log('✅ Refunded:', req.requestId, refund);
            return { success: true, requestId: req.requestId };
          } catch (error) {
            console.error('❌ Refund failed:', req.requestId, error);
            return { success: false, requestId: req.requestId };
          }
        });
        
        const results = await Promise.all(refundPromises);
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        
        // 3. Notify DJ of results
        if (failCount === 0) {
          addNotification({
            type: 'info',
            title: '✅ Set Ended',
            message: `${successCount} request${successCount === 1 ? '' : 's'} refunded successfully`,
          });
        } else {
          addNotification({
            type: 'error',
            title: '⚠️ Set Ended (Refunds Pending)',
            message: `${successCount} refunded, ${failCount} need manual processing`,
          });
        }
        
        // Track business metrics
        BusinessMetrics.djSetEnded(
          currentSetId,
          totalRevenue,
          queueRequests.length
        );
      } else {
        addNotification({
          type: 'info',
          title: '✅ Set Ended',
          message: 'No pending refunds required',
        });
      }
      
      // 4. Clear local state
      setCurrentSetId(null);
      setCurrentEventId(null);
      
    } catch (error) {
      console.error('Failed to end set cleanly:', error);
      addNotification({
        type: 'error',
        title: '❌ End Set Failed',
        message: 'Failed to end set properly. Contact support if needed.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine status arc mode
  const mode = queueRequests.length > 0 ? 'active' : 'browsing';

  // Menu options for radial menu
  const menuOptions = [
    {
      icon: <Music className="w-5 h-5" />,
      label: 'Queue',
      angle: -90,
      color: 'from-blue-500 to-cyan-500',
      onClick: () => {
        setCurrentView('queue');
        setIsMenuExpanded(false);
      },
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Library',
      angle: 0,
      color: 'from-green-500 to-emerald-500',
      onClick: () => {
        setCurrentView('library');
        setIsMenuExpanded(false);
      },
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Revenue',
      angle: 90,
      color: 'from-yellow-500 to-orange-500',
      onClick: () => {
        setCurrentView('revenue');
        setIsMenuExpanded(false);
      },
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      angle: 180,
      color: themeClasses.gradientPrimary.replace('bg-gradient-to-r ', ''),
      onClick: () => {
        setShowSettings(true);
        setIsMenuExpanded(false);
      },
    },
  ];

  return (
    <GestureHandler
      onSwipeUp={handleSwipeUp}
      onSwipeDown={handleSwipeDown}
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
    >
      <div 
        className="min-h-screen relative overflow-hidden animate-vinyl-spin"
        style={{
          background: `linear-gradient(to bottom right, rgb(17, 24, 39), ${currentTheme.primary}33, rgb(17, 24, 39))`
        }}
      >
        {/* Status Arc - Hide when live or menu open */}
        {!isLiveMode && !showSetSelector && (
          <StatusArc
            mode={mode}
            revenue={totalRevenue}
            requestCount={queueRequests.length}
          />
        )}

        {/* Floating Action Bubble - Hide when live or menu open */}
        {!isLiveMode && !showSetSelector && (
          <FloatingActionBubble
            onMenuToggle={() => setIsMenuExpanded(!isMenuExpanded)}
            isExpanded={isMenuExpanded}
            menuOptions={menuOptions}
          />
        )}

        {/* Notification Bell - Hide when live, minimize when menu open */}
        {!isLiveMode && (
          <button
            onClick={() => setShowNotifications(true)}
            className={`relative fixed z-40 bg-black/50 backdrop-blur-lg rounded-full border border-white/10 hover:bg-white/5 transition-all duration-300 ${
              showSetSelector 
                ? 'top-2 right-14 p-1.5 opacity-30' 
                : 'top-2 right-14 sm:top-4 sm:right-20 p-2 sm:p-3'
            }`}
            title="Notifications"
          >
            <Bell className={`text-gray-300 transition-all duration-300 ${
              showSetSelector ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'
            }`} />
            {unreadCount > 0 && !showSetSelector && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Logout Button - Hide when live, minimize when menu open */}
        {!isLiveMode && (
          <button
            onClick={logout}
            className={`fixed z-40 bg-black/50 backdrop-blur-lg rounded-full border border-red-500/50 hover:bg-red-500/20 transition-all duration-300 group ${
              showSetSelector 
                ? 'top-2 right-2 p-1.5 opacity-30' 
                : 'top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3'
            }`}
            title="Logout"
          >
            <LogOut className={`text-red-400 group-hover:text-red-300 transition-all duration-300 ${
              showSetSelector ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'
            }`} />
          </button>
        )}

        {/* Main Content Area */}
        <div className="h-screen w-full">
          {/* Queue View - Circular Visualizer */}
          {currentView === 'queue' && (
            <div className="h-full flex flex-col items-center justify-center">
              {!currentSetId ? (
                // No Set - Show Create Button
                <div className="text-center max-w-md">
                  <button
                    onClick={() => setShowEventCreator(true)}
                    className={`w-32 h-32 mx-auto mb-6 rounded-full ${themeClasses.gradientPrimary} flex items-center justify-center animate-pulse-glow hover:scale-110 transition-all cursor-pointer`}
                    title="Create Event"
                  >
                    <span className="text-6xl">🎵</span>
                  </button>
                  <h2 className="text-3xl font-bold text-white mb-8">Ready to Start?</h2>
                  
                  <button
                    onClick={() => setShowEventCreator(true)}
                    className={`px-8 py-4 ${themeClasses.gradientPrimary} hover:opacity-90 text-white rounded-full font-semibold text-lg transition-all shadow-lg`}
                  >
                    Create Event
                  </button>
                </div>
              ) : queueRequests.length > 0 ? (
                // Has Event + Requests
                <div className="flex flex-col items-center gap-6">
                  <CircularQueueVisualizer
                    requests={queueRequests.filter((r: any) => 
                      !vetoedRequestIds.has(r.requestId || r.id) && 
                      !acceptedRequestIds.has(r.requestId || r.id)
                    )}
                    onVeto={handleVeto}
                    onRequestTap={handleRequestTap}
                    onAccept={handleAccept}
                  />
                  
                  {/* Play Next Song Button (Feature 12) */}
                  {!currentlyPlaying && queueRequests.length > 0 && (
                    <button
                      onClick={handleMarkPlaying}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-full shadow-2xl transition-all transform hover:scale-105 flex items-center gap-3"
                    >
                      <Play className="w-6 h-6" />
                      <span className="text-lg">Play Next</span>
                    </button>
                  )}
                </div>
              ) : (
                // Has Event, No Requests - SIMPLIFIED CLEAN UI WITH ANIMATED MENU
                <div className="text-center max-w-lg mx-auto space-y-8 relative">
                  
                  {/* Page content - Fade out when menu opens */}
                  <div className={`transition-opacity duration-300 ${showSetSelector ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {/* Event Info */}
                    {currentEvent && !showSetSelector && (
                      <div className="text-lg font-semibold text-white mb-6">
                        {currentEvent.venueName}
                      </div>
                    )}
                  </div>
                  
                  {/* Music Button - Morphs and moves to top when open */}
                  {!showSetSelector && (
                    <button
                      onClick={() => setShowSetSelector(!showSetSelector)}
                      className="mx-auto mb-6 w-48 h-48 rounded-full flex items-center justify-center border-4 cursor-pointer group relative transition-all hover:scale-105 z-10"
                      style={{
                        background: `linear-gradient(to bottom right, ${currentTheme.primary}33, ${currentTheme.secondary}33)`,
                        borderColor: `${currentTheme.primary}4D`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${currentTheme.primary}80`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${currentTheme.primary}4D`;
                      }}
                      title="Switch DJ Sets"
                    >
                      <span className="text-8xl">🎵</span>
                      
                      {/* Subtle hint - only when closed */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span 
                          className="text-xs font-semibold whitespace-nowrap"
                          style={{ color: currentTheme.accent }}
                        >
                          Switch Sets ({mySets.length})
                        </span>
                      </div>
                    </button>
                  )}
                  
                  {/* DJ Sets List - Slides up from bottom */}
                  {showSetSelector && (
                    <div 
                      className="fixed inset-0 z-40 animate-slide-up"
                    >
                      <div className="h-full bg-black/95 backdrop-blur-lg overflow-hidden flex flex-col">
                        {/* Header Button - Fixed at top */}
                        <button
                          onClick={() => setShowSetSelector(false)}
                          className="flex-shrink-0 w-80 h-16 mx-auto mt-4 rounded-3xl flex items-center justify-center border-4 cursor-pointer transition-all duration-300 z-50"
                          style={{
                            background: `linear-gradient(to bottom right, ${currentTheme.primary}33, ${currentTheme.secondary}33)`,
                            borderColor: `${currentTheme.primary}4D`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${currentTheme.primary}80`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = `${currentTheme.primary}4D`;
                          }}
                        >
                          <span className="text-4xl">🎵</span>
                          <span className="ml-3 text-white font-bold text-xl animate-fade-in">DJ Sets</span>
                        </button>
                        {/* Sets List - Scrollable content below header */}
                        {mySets.length > 0 ? (
                          <div className="flex-1 overflow-y-auto p-4 pb-32">
                            {mySets
                              .sort((a: any, b: any) => new Date(b.setStartTime).getTime() - new Date(a.setStartTime).getTime())
                              .map((set: any, index: any) => {
                                const startTime = new Date(set.setStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const endTime = new Date(set.setEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                
                                return (
                                  <button
                                    key={set.setId}
                                    onClick={() => {
                                      setCurrentSetId(set.setId);
                                      setCurrentEventId(set.eventId);
                                      setShowSetSelector(false);
                                    }}
                                    className={`w-full px-6 py-4 mb-3 text-left rounded-2xl transition-all transform hover:scale-[1.02] ${
                                      currentSetId === set.setId 
                                        ? `${themeClasses.gradientPrimary} shadow-lg`
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                    style={{
                                      animationDelay: `${index * 50}ms`,
                                      animation: 'fadeInUp 0.3s ease-out forwards',
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-lg truncate mb-1">
                                          {set.event?.venueName || 'Unknown Venue'}
                                        </h4>
                                        <p className="text-sm text-gray-300 truncate">
                                          {startTime} - {endTime}
                                        </p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                          set.status === 'ACTIVE' 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                          {set.status}
                                        </span>
                                      </div>
                                      {currentSetId === set.setId && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-white font-semibold">ACTIVE</span>
                                          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                              
                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                              <button
                                onClick={() => {
                                  setShowEventCreator(true);
                                  setShowSetSelector(false);
                                }}
                                className={`w-full px-6 py-4 ${themeClasses.gradientPrimary} hover:opacity-90 text-white font-bold text-lg rounded-2xl transition-all shadow-lg`}
                              >
                                + Create New Event
                              </button>
                              
                              {currentSetId && (
                                <button
                                  onClick={() => {
                                    setShowPlaylistManager(true);
                                    setShowSetSelector(false);
                                  }}
                                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                  <Sparkles className="w-5 h-5" />
                                  Manage Event Playlist
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-8">
                            <div 
                              className="w-24 h-24 mb-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${currentTheme.primary}33` }}
                            >
                              <Music 
                                className="w-12 h-12" 
                                style={{ color: currentTheme.accent }}
                              />
                            </div>
                            <p className="text-gray-400 text-lg mb-8">No other sets</p>
                            <button
                              onClick={() => {
                                setShowEventCreator(true);
                                setShowSetSelector(false);
                              }}
                              className={`px-8 py-4 ${themeClasses.gradientPrimary} hover:opacity-90 text-white font-bold text-lg rounded-2xl transition-all shadow-lg`}
                            >
                              + Create New Event
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Other Actions - Hidden when menu is open */}
                  {!showSetSelector && (
                    <div className="space-y-6 transition-opacity duration-300">
                      {/* Primary Action - GO LIVE Toggle */}
                      {!isLiveMode ? (
                        <button
                          onClick={handleGoLive}
                          className="w-full max-w-sm mx-auto py-6 text-white rounded-2xl font-bold text-xl transition-all shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
                          style={{
                            background: `linear-gradient(to right, rgb(239, 68, 68), ${currentTheme.secondary})`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `linear-gradient(to right, rgb(220, 38, 38), ${currentTheme.primary})`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `linear-gradient(to right, rgb(239, 68, 68), ${currentTheme.secondary})`;
                          }}
                        >
                          <span className="text-3xl">🔴</span>
                          <span>GO LIVE</span>
                        </button>
                      ) : (
                        <div className="space-y-4">
                          {/* Live Status Badge */}
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-400 font-semibold text-sm">LIVE</span>
                          </div>
                          
                          {/* Pause Button - Secondary */}
                          <button
                            onClick={handlePauseLive}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 mx-auto"
                          >
                            <span>⏸️</span>
                            <span>Pause</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Secondary Actions - Minimal */}
                      <div className="flex gap-3 justify-center pt-4">
                        <button
                          onClick={() => setShowQRCode(true)}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all flex items-center gap-2 text-sm"
                          title="Show QR Code"
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleEndSet}
                          className="px-5 py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-xl text-gray-400 hover:text-red-400 transition-all text-sm"
                          title="End Set"
                        >
                          End Set
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Library View */}
          {currentView === 'library' && (
            <div className="h-full pt-20 pb-20 px-4 overflow-hidden">
              <div className="max-w-6xl mx-auto h-full bg-black/30 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden">
                {/* Event Playlist Quick Access */}
                {currentEventId && (
                  <div 
                    className="p-4 border-b"
                    style={{
                      background: `linear-gradient(to right, ${currentTheme.primary}33, ${currentTheme.secondary}33)`,
                      borderColor: `${currentTheme.primary}4D`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">Event-Specific Playlist</h3>
                        <p className="text-gray-400 text-sm">Quickly curate songs for this event</p>
                      </div>
                      <button
                        onClick={() => setShowPlaylistManager(true)}
                        className={`px-4 py-2 ${themeClasses.gradientPrimary} hover:opacity-90 text-white rounded-lg font-semibold transition-all flex items-center gap-2`}
                      >
                        <Sparkles className="w-4 h-4" />
                        Manage Playlist
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Debug: Show track count */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-2 bg-blue-500/20 border-b border-blue-500/30 text-white text-xs">
                    Debug: {tracks.length} tracks loaded | Tracklist: {tracklist.length} songs | Tracks loaded: {tracksLoaded ? 'Yes' : 'No'}
                  </div>
                )}
                
                <DJLibrary
                  tracks={tracks}
                  onAddTrack={handleAddTrack}
                  onUpdateTrack={handleUpdateTrack}
                  onDeleteTrack={handleDeleteTrack}
                  onToggleTrack={handleToggleTrack}
                />
              </div>
            </div>
          )}

          {/* Revenue View */}
          {currentView === 'revenue' && (
            <div className="h-full flex items-center justify-center px-4">
              <div className="max-w-4xl w-full bg-black/30 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
                <h2 className="text-4xl font-bold text-white mb-8 text-center">Revenue Dashboard</h2>
                
                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                    <p className="text-yellow-400 text-sm mb-2">Total Earnings</p>
                    <p className="text-5xl font-bold text-yellow-400 animate-tumble">
                      R{totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                    <p className="text-green-400 text-sm mb-2">Requests Filled</p>
                    <p className="text-5xl font-bold text-green-400">{queueRequests.length}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
                    <p className="text-blue-400 text-sm mb-2">Avg per Request</p>
                    <p className="text-5xl font-bold text-blue-400">
                      R{queueRequests.length > 0 ? (totalRevenue / queueRequests.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>

                {/* Event Info */}
                {currentEvent && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-4">{currentEvent.venueName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className="text-green-400 font-semibold">{currentEvent.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Start Time</p>
                        <p className="text-white">{new Date(currentEvent.startTime).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <div className="h-full flex items-center justify-center px-4">
              <div className="max-w-2xl w-full bg-black/30 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
                <h2 className="text-4xl font-bold text-white mb-8 text-center">Settings</h2>
                
                <div className="space-y-6">
                  {/* Theme Selector */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Theme Mode</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['beatbyme', 'gold', 'platinum'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setThemeMode(mode)}
                              className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                                themeMode === mode
                                  ? 'ring-2 ring-offset-2 ring-offset-gray-900'
                                  : 'opacity-60 hover:opacity-100'
                              }`}
                              style={{
                                background: mode === 'beatbyme' 
                                  ? 'linear-gradient(to right, #8B5CF6, #EC4899)'
                                  : mode === 'gold'
                                  ? 'linear-gradient(to right, #D4AF37, #F59E0B)'
                                  : 'linear-gradient(to right, #E5E4E2, #94A3B8)',
                                color: '#ffffff',
                                ...(themeMode === mode && {
                                  boxShadow: mode === 'beatbyme' 
                                    ? '0 0 0 2px #8B5CF6'
                                    : mode === 'gold'
                                    ? '0 0 0 2px #D4AF37'
                                    : '0 0 0 2px #E5E4E2'
                                })
                              }}
                            >
                              {mode === 'beatbyme' ? '🎵 BeatByMe' : mode === 'gold' ? '👑 Gold' : '💎 Platinum'}
                            </button>
                          ))}
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          Choose your interface color scheme
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Profile</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Name</p>
                        <p className="text-white font-semibold">{user?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Role</p>
                        <p className="font-semibold" style={{ color: currentTheme.accent }}>{user?.role}</p>
                      </div>
                                <div className="pt-3">
                                  <button
                                    onClick={() => setShowProfile(true)}
                                    className="px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all"
                                    style={{ backgroundColor: currentTheme.primary }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.opacity = '0.9';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.opacity = '1';
                                    }}
                                  >
                                    Manage Profile
                                  </button>
                                </div>
                    </div>
                  </div>

                  {/* Event Settings */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Event Settings</h3>
                      <button
                        onClick={() => setIsEditingSettings(!isEditingSettings)}
                        className="px-3 py-1 rounded-lg text-white text-sm transition-all"
                        style={{ backgroundColor: currentTheme.primary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        {isEditingSettings ? 'Save' : 'Edit'}
                      </button>
                    </div>
                    <div className="space-y-4">
                      {/* Base Price */}
                      <div>
                        <label className="text-gray-300 text-sm mb-1 block">Base Price (R)</label>
                        {isEditingSettings ? (
                          <input
                            type="number"
                            value={basePrice}
                            onChange={(e) => setBasePrice(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                          />
                        ) : (
                          <div className="text-yellow-400 font-semibold text-lg">R{basePrice}</div>
                        )}
                      </div>
                      
                      {/* Requests per Hour */}
                      <div>
                        <label className="text-gray-300 text-sm mb-1 block">Requests per Hour</label>
                        {isEditingSettings ? (
                          <input
                            type="number"
                            value={requestsPerHour}
                            onChange={(e) => setRequestsPerHour(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <div className="text-blue-400 font-semibold text-lg">{requestsPerHour}</div>
                        )}
                      </div>
                      
                      {/* Spotlight Slots */}
                      <div>
                        <label className="text-gray-300 text-sm mb-1 block">Spotlight Slots</label>
                        {isEditingSettings ? (
                          <input
                            type="number"
                            value={spotlightSlots}
                            onChange={(e) => setSpotlightSlots(Number(e.target.value))}
                            min="0"
                            max="5"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
                            style={{
                              '--tw-ring-color': currentTheme.secondary,
                            } as React.CSSProperties}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = currentTheme.secondary;
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                          />
                        ) : (
                          <div className="font-semibold text-lg" style={{ color: currentTheme.secondary }}>{spotlightSlots}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Request Cap Manager - DJ control */}
                  <div className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Request Cap Manager</h3>
                    <RequestCapManager
                      currentRequestCount={queueRequests.length}
                      requestCapPerHour={requestsPerHour}
                      isSoldOut={false}
                      onUpdateSettings={async (settings) => {
                        console.log('Updating request cap settings:', settings);
                        
                        // Update local state immediately for responsive UI
                        setRequestsPerHour(settings.requestCapPerHour);
                        
                        // Persist to backend
                        if (currentSetId) {
                          try {
                            const success = await updateDJSetSettings(currentSetId, {
                              requestCapPerHour: settings.requestCapPerHour,
                              isSoldOut: settings.isSoldOut
                            });
                            
                            if (success) {
                              addNotification({
                                type: 'info',
                                title: '✅ Settings Saved',
                                message: `Request cap: ${settings.requestCapPerHour}/hour${settings.isSoldOut ? ' (Sold Out)' : ''}`,
                              });
                            } else {
                              addNotification({
                                type: 'info',
                                title: 'Settings Updated Locally',
                                message: 'Backend sync pending - settings will persist after deployment',
                              });
                            }
                          } catch (error) {
                            console.error('Failed to save settings:', error);
                            addNotification({
                              type: 'error',
                              title: '⚠️ Save Failed',
                              message: 'Could not save to backend. Using local settings.',
                            });
                          }
                        } else {
                          addNotification({
                            type: 'info',
                            title: 'Settings Updated',
                            message: 'Select an active set to persist changes',
                          });
                        }
                      }}
                    />
                  </div>

                  {/* Status Ring Legend */}
                  <div className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Neon Status Ring Legend</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      The colored ring around your screen indicates your current status and activity:
                    </p>
                    <div className="space-y-3">
                      {/* Blue - Browsing */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-pulse"></div>
                        <div>
                          <p className="text-blue-400 font-semibold text-sm">Blue - Browsing</p>
                          <p className="text-gray-400 text-xs">No active set or requests yet</p>
                        </div>
                      </div>
                      
                      {/* Green - Active */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 via-green-600 to-green-500 animate-pulse"></div>
                        <div>
                          <p className="text-green-400 font-semibold text-sm">Green - Active</p>
                          <p className="text-gray-400 text-xs">Set is live and accepting requests</p>
                        </div>
                      </div>
                      
                      {/* Yellow/Orange - Earning */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 animate-pulse"></div>
                        <div>
                          <p className="text-yellow-400 font-semibold text-sm">Yellow/Orange - Earning</p>
                          <p className="text-gray-400 text-xs">High activity with revenue flowing</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="mt-4 p-3 rounded-lg"
                      style={{
                        backgroundColor: `${currentTheme.primary}1A`,
                        borderWidth: '1px',
                        borderColor: `${currentTheme.primary}4D`,
                      }}
                    >
                      <p className="text-xs" style={{ color: currentTheme.accent }}>
                        💡 <strong>Tip:</strong> The ring automatically adjusts based on your set status and request activity. 
                        When you go LIVE, the interface simplifies to show only essential controls and the status ring.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={logout}
                    className="w-full py-4 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(to right, rgb(220, 38, 38), ${currentTheme.secondary})`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, rgb(185, 28, 28), ${currentTheme.primary})`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, rgb(220, 38, 38), ${currentTheme.secondary})`;
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gesture Hints - Bottom Center - Hide when live */}
        {!isLiveMode && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 bg-black/50 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>↑ Queue</span>
              <span>↓ Library</span>
              <span>← Revenue</span>
              <span>→ Settings</span>
            </div>
          </div>
        )}

        {/* Modals - Phase 8: Lazy loaded for performance */}
        {showEventCreator && (
          <Suspense fallback={
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-white text-lg">Loading...</div>
            </div>
          }>
            <EventCreator
              onClose={() => setShowEventCreator(false)}
              onEventCreated={handleEventCreated}
            />
          </Suspense>
        )}

        {/* Event Playlist Manager Modal */}
        {showPlaylistManager && (
          <Suspense fallback={
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-white text-lg">Loading...</div>
            </div>
          }>
            <EventPlaylistManager
              masterLibrary={tracks}
              currentEventName={currentEvent?.venueName}
              currentSetId={currentSetId || undefined}
              isLive={isLiveMode}
              onApplyPlaylist={async (trackIds, playlistInfo) => {
                console.log('📋 Applying playlist to event:', trackIds, playlistInfo);
                
                // 1. Save playlist to backend
                if (currentSetId) {
                  try {
                    await updateSetPlaylist(currentSetId, {
                      playlistType: playlistInfo.type,
                      playlistId: playlistInfo.id,
                      playlistName: playlistInfo.name,
                      playlistTracks: trackIds
                    });
                    console.log('✅ Playlist saved to backend successfully');
                  } catch (error) {
                    console.error('❌ Failed to save playlist to backend:', error);
                    // Continue anyway - playlist still applied locally
                  }
                }
                
                // 2. Enable selected tracks, disable others (local state)
                setTracks(prevTracks =>
                  prevTracks.map(track => ({
                    ...track,
                    isEnabled: trackIds.includes(track.id)
                  }))
                );
                
                // 3. Show success notification
                addNotification({
                  type: 'info',
                  title: '✅ Playlist Applied',
                  message: `${playlistInfo.name}: ${trackIds.length} songs enabled for this event`,
                });
              }}
              onClose={() => setShowPlaylistManager(false)}
            />
          </Suspense>
        )}

        {/* Features 6, 10, 12 - Request Management Modals */}
        {/* Accept modal removed - now using optimistic pattern with undo toast */}
        {/* Veto modal removed - now using optimistic pattern with undo toast */}

        {showPlayingPanel && selectedRequest && (
          <MarkPlayingPanel
            request={{
              ...selectedRequest,
              waitTime: selectedRequest.submittedAt 
                ? Math.floor((Date.now() - selectedRequest.submittedAt) / 60000)
                : 0,
            }}
            onConfirm={handlePlayingConfirm}
            onCancel={() => {
              setShowPlayingPanel(false);
              setSelectedRequest(null);
            }}
            isProcessing={isProcessing}
          />
        )}

        {showPlayingCelebration && selectedRequest && (
          <PlayingCelebration
            request={selectedRequest}
            onComplete={() => setShowPlayingCelebration(false)}
          />
        )}

        {currentlyPlaying && (
          <NowPlayingCard
            playing={currentlyPlaying}
            onMarkComplete={handleMarkComplete}
          />
        )}

        {/* Notification Center Modal */}
        {showNotifications && (
          <Suspense fallback={null}>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full max-h-[90vh]">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={() => notifications.forEach(n => markAsRead(n.id))}
                  onClearAll={() => notifications.forEach(n => clearNotification(n.id))}
                  onNotificationClick={(notification) => {
                    markAsRead(notification.id);
                    if (notification.metadata?.requestId) {
                      console.log('Open request:', notification.metadata.requestId);
                    }
                  }}
                  className="w-full"
                />
                <button
                  onClick={() => setShowNotifications(false)}
                  className="mt-4 w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Suspense>
        )}

        {/* DJ Profile Management Modal */}
        {showProfile && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <DJProfileScreen
                profile={{
                  userId: user?.userId || '',
                  name: user?.name || 'DJ',
                  email: user?.email || '',
                  photo: undefined,
                  tier: (user?.tier as any) || 'BRONZE',
                  bio: '',
                  genres: [],
                  basePrice: basePrice,
                  stats: undefined,
                }}
                onUpdateProfile={async (updates) => {
                  console.log('Save DJ profile updates:', updates);
                  
                  if (user?.userId) {
                    try {
                      const success = await updateDJProfile(user.userId, {
                        name: updates.name,
                        bio: updates.bio,
                        genres: updates.genres,
                        basePrice: updates.basePrice,
                      });
                      
                      if (success) {
                        addNotification({ 
                          type: 'info', 
                          title: '✅ Profile Updated', 
                          message: 'Your profile changes were saved successfully.' 
                        });
                      } else {
                        addNotification({ 
                          type: 'info', 
                          title: 'Profile Updated Locally', 
                          message: 'Backend sync pending - changes will persist after deployment' 
                        });
                      }
                      
                      setShowProfile(false);
                    } catch (error) {
                      console.error('Failed to update profile:', error);
                      addNotification({ 
                        type: 'error', 
                        title: '⚠️ Update Failed', 
                        message: 'Could not save profile. Please try again.' 
                      });
                    }
                  }
                }}
                onUpgradeTier={(tier) => {
                  console.log('Upgrade to tier:', tier);
                  addNotification({ 
                    type: 'info', 
                    title: 'Upgrade Requested', 
                    message: `Requested upgrade to ${tier}. Contact support to complete.` 
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Panels (non-blocking) - Phase 8: Lazy loaded */}
      {showSettings && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        }>
          <SettingsModal
            onClose={() => setShowSettings(false)}
            mode="dj"
          />
        </Suspense>
      )}

      {showQRCode && currentEvent && currentEventId && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        }>
          <QRCodeDisplay
            eventId={currentEventId}
            venueName={currentEvent.venueName}
            onClose={() => setShowQRCode(false)}
          />
        </Suspense>
      )}
    </GestureHandler>
  );
};
