/**
 * DJ Portal - Orbital Interface
 * Revolutionary gesture-first design with floating controls
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../hooks/useEvent';
import { useQueue } from '../hooks/useQueue';
import { useTracklist } from '../hooks/useTracklist';
import { useNotifications } from '../context/NotificationContext';
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
import { EventCreator, QRCodeDisplay, EventPlaylistManager } from '../components';
import { AcceptRequestPanel } from '../components/AcceptRequestPanel';
import { VetoConfirmation } from '../components/VetoConfirmation';
import { MarkPlayingPanel, PlayingCelebration } from '../components/MarkPlayingPanel';
import { NowPlayingCard } from '../components/NowPlayingCard';
import { DJProfileScreen } from '../components/ProfileManagement';
import { RequestCapManager } from '../components/RequestCapManager';
import { NotificationCenter } from '../components/Notifications';
import { LiveModeIndicators, LiveStatusBar } from '../components/LiveModeIndicators';
import { submitAcceptRequest, submitVeto, submitMarkPlaying, submitMarkCompleted, submitRefund, submitUpdateSetStatus } from '../services/graphql';
import { updateDJSetSettings, updateDJProfile, updateSetPlaylist } from '../services/djSettings';
// import { processRefund } from '../services/payment'; // Available for future use
import { BusinessMetrics } from '../services/analytics';

type ViewMode = 'queue' | 'library' | 'revenue' | 'settings';

export const DJPortalOrbital: React.FC = () => {
  const { user, logout } = useAuth();
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
  const [showQRCode, setShowQRCode] = useState(false);
  const [mySets, setMySets] = useState<any[]>([]);
  const [showSetSelector, setShowSetSelector] = useState(false);

  // Features 6, 10, 12 - Accept/Veto/Playing state
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showAcceptPanel, setShowAcceptPanel] = useState(false);
  const [showVetoModal, setShowVetoModal] = useState(false);
  const [showPlayingPanel, setShowPlayingPanel] = useState(false);
  const [showPlayingCelebration, setShowPlayingCelebration] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Phase 4: DJ Portal features
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);
  const { notifications, unreadCount, addNotification, markAsRead, clearNotification } = useNotifications();

  // Live Mode Visual State
  const [liveMode, setLiveMode] = useState<'idle' | 'new_request' | 'playing' | 'accepting' | 'vetoed'>('idle');
  
  // Live Mode Control - Manual toggle for when DJ is ready to accept requests
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Real-time queue subscription (rename to avoid shadowing local queue variable)
  const { queueData: liveQueueData, connectionStatus } = useQueueSubscription(
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

    // If queue grew, notify and trigger live mode visual
    if (newCount > lastQueueCountRef.current) {
      // Trigger live mode visual
      setLiveMode('new_request');
      setTimeout(() => setLiveMode('idle'), 3000);
      
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
  const { tracklist } = useTracklist(currentEventId);

  // Transform data
  const queueRequests = queueData?.orderedRequests?.map((req: any, index: number) => ({
    id: req.requestId,
    songTitle: req.songTitle,
    artistName: req.artistName,
    type: req.requestType || 'standard',
    position: index + 1,
  })) || [];

  const [tracks, setTracks] = useState<Track[]>(
    tracklist.map((t, i) => ({
      id: `track-${i}`,
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      basePrice: t.basePrice,
      isEnabled: true,
    }))
  );

  const totalRevenue = queueRequests.reduce((sum: number) => sum + 20, 0);

  // Load and apply saved playlist when set changes
  useEffect(() => {
    const loadSavedPlaylist = async () => {
      if (!currentSetId || !user?.userId) return;
      
      try {
        const client = generateClient({
          authMode: 'userPool'
        });
        
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
        
        if (set && set.playlistTracks && set.playlistTracks.length > 0) {
          console.log(`🎵 Loading saved playlist: ${set.playlistName} (${set.playlistTracks.length} songs)`);
          
          // Apply saved playlist to tracks
          setTracks(prevTracks =>
            prevTracks.map(track => ({
              ...track,
              isEnabled: set.playlistTracks.includes(track.id)
            }))
          );
          
          addNotification({
            type: 'info',
            title: '🎵 Playlist Loaded',
            message: `${set.playlistName}: ${set.playlistTracks.length} songs`,
          });
        } else {
          console.log('ℹ️ No saved playlist for this set');
        }
      } catch (error) {
        console.error('❌ Failed to load saved playlist:', error);
      }
    };
    
    loadSavedPlaylist();
  }, [currentSetId]); // Run when set changes

  // Update tracks when tracklist changes
  useEffect(() => {
    if (tracklist.length > 0) {
      setTracks(
        tracklist.map((t, i) => ({
          id: `track-${i}`,
          title: t.title,
          artist: t.artist,
          genre: t.genre,
          basePrice: t.basePrice,
          isEnabled: true,
        }))
      );
    }
  }, [tracklist]);

  // Gesture Navigation
  const handleSwipeUp = () => setCurrentView('queue');
  const handleSwipeDown = () => setCurrentView('library');
  const handleSwipeLeft = () => setCurrentView('revenue');
  const handleSwipeRight = () => setCurrentView('settings');

  // Track Management
  const handleAddTrack = (track: Omit<Track, 'id'>) => {
    const newTrack = { ...track, id: `track-${Date.now()}` };
    setTracks([...tracks, newTrack]);
  };

  const handleUpdateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(tracks.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleDeleteTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const handleToggleTrack = (id: string) => {
    setTracks(tracks.map(t => (t.id === id ? { ...t, isEnabled: !t.isEnabled } : t)));
  };

  const handleVeto = (requestId: string) => {
    console.log('Veto request:', requestId);
    const request = queueRequests.find((r: any) => r.requestId === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowVetoModal(true);
    }
  };

  // Features 6, 10, 12 - Request Management Handlers
  const handleRequestTap = (request: any) => {
    setSelectedRequest(request);
    setShowAcceptPanel(true);
  };

  const handleAccept = async () => {
    if (!selectedRequest || !currentSetId) return;
    setIsProcessing(true);
    
    try {
      // Trigger accepting visual
      setLiveMode('accepting');
      setTimeout(() => setLiveMode('idle'), 2000);
      
      await submitAcceptRequest(selectedRequest.requestId, currentSetId);
      setShowAcceptPanel(false);
      setSelectedRequest(null);
      // Queue will auto-refresh via WebSocket
      console.log('✅ Request accepted successfully');
    } catch (error) {
      console.error('❌ Accept failed:', error);
      alert('Failed to accept request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVetoConfirm = async (reason?: string) => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    
    try {
      // Trigger veto visual
      setLiveMode('vetoed');
      setTimeout(() => setLiveMode('idle'), 2000);
      
      // 1. Veto the request
      await submitVeto(selectedRequest.requestId, reason);
      
      // 2. Process refund automatically
      try {
        const refund = await submitRefund(selectedRequest.requestId, reason || 'DJ vetoed request');
        console.log('✅ Refund processed:', refund);
        
        // 3. Notify DJ of successful veto + refund
        addNotification({
          type: 'info',
          title: '✅ Request Vetoed',
          message: `Refund of R${selectedRequest.price} processed for ${selectedRequest.userName}`,
          metadata: {
            requestId: selectedRequest.requestId,
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
      
      setShowVetoModal(false);
      setSelectedRequest(null);
      console.log('✅ Request vetoed successfully');
    } catch (error) {
      console.error('❌ Veto failed:', error);
      alert('Failed to veto request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
      // Trigger playing visual
      setLiveMode('playing');
      
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
      // Reset live mode when song completes
      setLiveMode('idle');
      
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
      color: 'from-purple-500 to-pink-500',
      onClick: () => {
        setCurrentView('settings');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden animate-vinyl-spin">
        {/* Live Mode Visual Indicators */}
        {currentSetId && (
          <>
            <LiveModeIndicators
              mode={liveMode}
              requestCount={queueRequests.length}
              currentSong={currentlyPlaying ? {
                title: currentlyPlaying.songTitle,
                artist: currentlyPlaying.artistName,
              } : undefined}
            />
            
            <LiveStatusBar
              isLive={isLiveMode && connectionStatus === 'connected'}
              requestCount={queueRequests.filter((r: any) => r.status === 'PENDING').length}
              acceptedCount={queueRequests.filter((r: any) => r.status === 'ACCEPTED').length}
              playedCount={queueRequests.filter((r: any) => r.status === 'PLAYED').length}
              currentlyPlaying={currentlyPlaying?.songTitle}
            />
          </>
        )}
        
        {/* Status Arc */}
        <StatusArc
          mode={mode}
          revenue={totalRevenue}
          requestCount={queueRequests.length}
        />

        {/* Floating Action Bubble */}
        <FloatingActionBubble
          onMenuToggle={() => setIsMenuExpanded(!isMenuExpanded)}
          isExpanded={isMenuExpanded}
          menuOptions={menuOptions}
        />

        {/* Notification Bell (open notifications) */}
        <button
          onClick={() => setShowNotifications(true)}
          className="relative fixed top-2 right-14 sm:top-4 sm:right-20 z-40 p-2 sm:p-3 bg-black/50 backdrop-blur-lg rounded-full border border-white/10 hover:bg-white/5 transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Logout Button - Top Right Corner */}
        <button
          onClick={logout}
          className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40 p-2 sm:p-3 bg-black/50 backdrop-blur-lg rounded-full border border-red-500/50 hover:bg-red-500/20 transition-all group"
          title="Logout"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:text-red-300" />
        </button>

        {/* Connection Status Indicator (shows subscription state) */}
        {currentEventId && connectionStatus && (
          <div className="fixed top-12 right-2 sm:top-16 sm:right-4 z-40">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold shadow-lg ${
              connectionStatus === 'connected'
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : connectionStatus === 'connecting'
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                : connectionStatus === 'error'
                ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                : 'bg-gray-500/20 border border-gray-500/50 text-gray-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-400 animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-blue-400 animate-pulse'
                  : connectionStatus === 'error'
                  ? 'bg-yellow-400'
                  : 'bg-gray-400'
              }`} />
              <span>
                {connectionStatus === 'connected' && '🔴 Live'}
                {connectionStatus === 'connecting' && '⏳ Connecting'}
                {connectionStatus === 'error' && '⚠️ Reconnecting'}
                {connectionStatus === 'disconnected' && '🔄 Updates'}
              </span>
            </div>
          </div>
        )}

        {/* DJ Set Selector - Bottom Left Corner */}
        <div className="fixed bottom-20 sm:bottom-6 left-2 sm:left-6 z-40 max-w-[calc(100vw-1rem)] sm:max-w-none">
          <button
            onClick={() => setShowSetSelector(!showSetSelector)}
            className="px-2.5 py-2 sm:px-4 sm:py-3 bg-black/50 backdrop-blur-lg rounded-full border border-purple-500/50 hover:bg-purple-500/20 transition-all flex items-center gap-1 sm:gap-2 text-white shadow-lg"
          >
            <Music className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
              {mySets.length > 0 
                ? (mySets.find(s => s.setId === currentSetId)?.event?.venueName || 'Select Set')
                : 'My Sets'}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">({mySets.length})</span>
          </button>

          {/* DJ Set Dropdown */}
          {showSetSelector && (
            <div className="absolute bottom-full mb-2 left-0 w-[calc(100vw-1rem)] sm:w-80 max-h-[60vh] sm:max-h-[70vh] bg-black/90 backdrop-blur-lg rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-purple-500/30">
                <h3 className="text-white font-semibold text-sm sm:text-base">Your DJ Sets</h3>
                <p className="text-xs text-gray-400">
                  {mySets.length > 0 ? 'Switch between sets' : 'Create your first event'}
                </p>
              </div>
              
              {mySets.length > 0 ? (
                <div className="overflow-y-auto max-h-[calc(60vh-8rem)] sm:max-h-[calc(70vh-8rem)]">
                  {mySets
                    .sort((a: any, b: any) => new Date(b.setStartTime).getTime() - new Date(a.setStartTime).getTime())
                    .map((set: any) => {
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
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-purple-500/20 active:bg-purple-500/30 transition-all border-b border-gray-800/50 ${
                            currentSetId === set.setId ? 'bg-purple-500/30' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-xs sm:text-sm truncate">
                                {set.event?.venueName || 'Unknown Venue'}
                              </h4>
                              <p className="text-xs text-gray-400 truncate">
                                {startTime} - {endTime} • {set.status}
                              </p>
                            </div>
                            {currentSetId === set.setId && (
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Music className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-400 text-sm mb-4">No events yet</p>
                  <p className="text-gray-500 text-xs">Create your first event to start accepting requests</p>
                </div>
              )}
              
              <button
                onClick={() => {
                  setShowEventCreator(true);
                  setShowSetSelector(false);
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                + Create New Event
              </button>
              
              {/* Quick Playlist Manager Access */}
              {currentSetId && (
                <button
                  onClick={() => {
                    setShowPlaylistManager(true);
                    setShowSetSelector(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Manage Event Playlist
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="h-screen w-full">
          {/* Queue View - Circular Visualizer */}
          {currentView === 'queue' && (
            <div className="h-full flex flex-col items-center justify-center">
              {!currentSetId ? (
                // No Set - Show Create Button
                <div className="text-center max-w-md">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse-glow">
                    <span className="text-6xl">🎵</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
                  <p className="text-gray-400 mb-8">Create an event and DJ set to begin accepting requests</p>
                  
                  <button
                    onClick={() => setShowEventCreator(true)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-semibold text-lg transition-all shadow-lg"
                  >
                    Create Event + Set
                  </button>
                  <p className="text-sm text-gray-500 mt-6">Swipe down to manage your library first</p>
                </div>
              ) : queueRequests.length > 0 ? (
                // Has Event + Requests
                <div className="flex flex-col items-center gap-6">
                  <CircularQueueVisualizer
                    requests={queueRequests}
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
                      <span className="text-lg">Play Next Song</span>
                    </button>
                  )}
                </div>
              ) : (
                // Has Event, No Requests
                <div className="text-center max-w-md">
                  {/* GO LIVE / PAUSE Button - Most Prominent */}
                  {!isLiveMode ? (
                    <div className="mb-8">
                      <button
                        onClick={handleGoLive}
                        className="px-16 py-8 bg-gradient-to-r from-red-600 via-pink-600 to-red-600 hover:from-red-700 hover:via-pink-700 hover:to-red-700 text-white rounded-full font-bold text-3xl transition-all shadow-2xl animate-pulse transform hover:scale-105 flex items-center gap-4 mx-auto"
                      >
                        <span className="text-5xl">🔴</span>
                        <span>GO LIVE</span>
                      </button>
                      <p className="text-gray-400 text-sm mt-4">Start accepting song requests from users</p>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <div className="mb-4 px-6 py-3 bg-green-500/20 border-2 border-green-500 rounded-full inline-block">
                        <span className="text-green-400 font-bold text-xl flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                          YOU ARE LIVE
                        </span>
                      </div>
                      <button
                        onClick={handlePauseLive}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-full font-bold text-lg transition-all shadow-lg flex items-center gap-3 mx-auto"
                      >
                        <span className="text-2xl">⏸️</span>
                        <span>PAUSE LIVE MODE</span>
                      </button>
                      <p className="text-gray-400 text-sm mt-4">Temporarily stop accepting new requests</p>
                    </div>
                  )}
                  
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse-glow">
                    <span className="text-6xl">🎵</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isLiveMode ? 'Waiting for Requests...' : 'Event Ready'}
                  </h2>
                  <p className="text-gray-400 mb-4">
                    {isLiveMode 
                      ? 'Requests will appear here as they come in' 
                      : 'Go live when you\'re ready to accept requests'}
                  </p>
                  
                  {/* Event Info */}
                  {currentEvent && currentSetId && (
                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                      <p className="text-white font-semibold text-lg">{currentEvent.venueName}</p>
                      <p className="text-gray-400 text-sm">Set ID: {currentSetId.slice(0, 8)}...</p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowQRCode(true)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-all flex items-center gap-2"
                    >
                      <QrCode className="w-5 h-5" />
                      Show QR Code
                    </button>
                    <button
                      onClick={handleEndSet}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all"
                    >
                      End Set
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-6">Swipe down to manage your library</p>
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
                  <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">Event-Specific Playlist</h3>
                        <p className="text-gray-400 text-sm">Quickly curate songs for this event</p>
                      </div>
                      <button
                        onClick={() => setShowPlaylistManager(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Manage Playlist
                      </button>
                    </div>
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

                <p className="text-center text-gray-400 text-sm mt-8">Swipe right to access settings</p>
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <div className="h-full flex items-center justify-center px-4">
              <div className="max-w-2xl w-full bg-black/30 backdrop-blur-lg rounded-3xl border border-white/10 p-8">
                <h2 className="text-4xl font-bold text-white mb-8 text-center">Settings</h2>
                
                <div className="space-y-6">
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
                        <p className="text-purple-400 font-semibold">{user?.role}</p>
                      </div>
                                <div className="pt-3">
                                  <button
                                    onClick={() => setShowProfile(true)}
                                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-semibold transition-all"
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
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-all"
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
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500"
                          />
                        ) : (
                          <div className="text-pink-400 font-semibold text-lg">{spotlightSlots}</div>
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

                  {/* Actions */}
                  <button
                    onClick={logout}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>

                <p className="text-center text-gray-400 text-sm mt-8">Swipe left to view revenue</p>
              </div>
            </div>
          )}
        </div>

        {/* Gesture Hints - Bottom Center */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 bg-black/50 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>↑ Queue</span>
            <span>↓ Library</span>
            <span>← Revenue</span>
            <span>→ Settings</span>
          </div>
        </div>

        {/* Modals */}
        {showEventCreator && (
          <EventCreator
            onClose={() => setShowEventCreator(false)}
            onEventCreated={handleEventCreated}
          />
        )}

        {showQRCode && currentEvent && currentEventId && (
          <QRCodeDisplay
            eventId={currentEventId}
            venueName={currentEvent.venueName}
            onClose={() => setShowQRCode(false)}
          />
        )}

        {/* Event Playlist Manager Modal */}
        {showPlaylistManager && (
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
        )}

        {/* Features 6, 10, 12 - Request Management Modals */}
        {showAcceptPanel && selectedRequest && (
          <AcceptRequestPanel
            request={selectedRequest}
            onAccept={handleAccept}
            onSkip={() => {
              setShowAcceptPanel(false);
              setShowVetoModal(true);
            }}
            onClose={() => {
              setShowAcceptPanel(false);
              setSelectedRequest(null);
            }}
            isProcessing={isProcessing}
          />
        )}

        {showVetoModal && selectedRequest && (
          <VetoConfirmation
            request={selectedRequest}
            onConfirm={handleVetoConfirm}
            onCancel={() => {
              setShowVetoModal(false);
              setSelectedRequest(null);
            }}
            isProcessing={isProcessing}
          />
        )}

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
    </GestureHandler>
  );
};
