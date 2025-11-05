/**
 * User Portal - Innovative Event Companion
 * Revolutionary audience experience with gesture-first design
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../hooks/useEvent';
import { useQueue } from '../hooks/useQueue';
import { useTracklist } from '../hooks/useTracklist';
import { useNotifications } from '../context/NotificationContext';
import { useQueueSubscription } from '../hooks/useQueueSubscription';
import {
  EventDiscovery,
  AlbumArtGrid,
  MassiveRequestButton,
  LockedInAnimation,
  EnergyBeam,
  NowPlayingCelebration,
} from '../components/AudienceInterface';
import { RefundConfirmation } from '../components/RefundConfirmation';
import { RequestConfirmation } from '../components/RequestConfirmation';
import { NotificationCenter } from '../components/Notifications';
import { UserNowPlayingNotification } from '../components/LiveModeIndicators';
import { EmptyState } from '../components/EmptyState';
import { EventCardSkeleton, SongCardSkeleton, LoadingState } from '../components/LoadingSkeleton';
import { PaymentErrorModal, SuccessConfirmation } from '../components/StatusModals';
import { Settings } from '../components/Settings';
import { LogOut, User, Star, ArrowLeft, Bell, Calendar, Music, Settings as SettingsIcon } from 'lucide-react';
import { createPaymentIntent, processYocoPayment, verifyPayment, isRetryableError } from '../services/payment';
import { submitRequest, fetchUserActiveRequests, fetchDJSet } from '../services/graphql';
import { requestRateLimiter } from '../services/rateLimiter';
import { BusinessMetrics } from '../services/analytics';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  basePrice: number;
  albumArt?: string;
}

type ViewState = 'discovery' | 'lineup' | 'browsing' | 'requesting' | 'waiting' | 'playing';

export const UserPortalInnovative: React.FC = () => {
  const { user, logout } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('discovery');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);
  const [djSets, setDjSets] = useState<any[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showLockedIn, setShowLockedIn] = useState(false);
  const [myRequestPosition, setMyRequestPosition] = useState<number | null>(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showUserPlayingNotification, setShowUserPlayingNotification] = useState(false);
  const [userPlayingData, setUserPlayingData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successQueuePosition, setSuccessQueuePosition] = useState<number | null>(null);

  // Feature 6: Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState<any>(null);

  // Phase 3: Notification features
  const { notifications, unreadCount, addNotification, markAsRead, clearNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Phase 3: Real-time queue subscription
  const { queueData, connectionStatus } = useQueueSubscription(
    currentSetId || '',
    currentEventId || ''
  );

  // Notification throttle tracking (memory-only)
  const lastNotificationTime = useRef<Record<string, number>>({});

  // Helper: Throttle notifications (max 1 per type per 5 seconds)
  const shouldShowNotification = (type: string): boolean => {
    const now = Date.now();
    const lastTime = lastNotificationTime.current[type] || 0;
    const timeSinceLastNotification = now - lastTime;
    
    if (timeSinceLastNotification < 5000) {
      console.log(`Throttling notification type: ${type} (${timeSinceLastNotification}ms since last)`);
      return false;
    }
    
    lastNotificationTime.current[type] = now;
    return true;
  };

  // Handle real-time queue updates
  useEffect(() => {
    if (!queueData || !user?.userId) return;

    // Find user's request in queue
    const myRequest = queueData.orderedRequests.find(req => 
      req.requestId.includes(user.userId)
    );

    if (myRequest && myRequest.queuePosition) {
      const position = myRequest.queuePosition;
      setMyRequestPosition(position);

      // Notifications with throttling
      if (position === 1 && shouldShowNotification('now_playing')) {
        // Show user playing notification
        setUserPlayingData({
          userName: user.name || 'User',
          songTitle: myRequest.songTitle || 'Your Song',
          artistName: myRequest.artist || 'Unknown Artist',
          djName: 'DJ',
          venueName: currentEvent?.venueName || 'Event',
          timestamp: Date.now(),
        });
        setShowUserPlayingNotification(true);
        
        addNotification({
          type: 'now_playing',
          title: '🎶 Your Song is Playing NOW!',
          message: `${myRequest.songTitle || 'Your request'} is playing!`,
          metadata: {
            requestId: myRequest.requestId,
            songTitle: myRequest.songTitle,
          }
        });
      } else if (position === 2 && shouldShowNotification('coming_up')) {
        addNotification({
          type: 'coming_up',
          title: '🔜 Your Song is Next!',
          message: `${myRequest.songTitle || 'Your request'} will play soon!`,
          metadata: {
            requestId: myRequest.requestId,
            songTitle: myRequest.songTitle,
          }
        });
      } else if (position <= 5 && position > 2 && shouldShowNotification('queue_update')) {
        addNotification({
          type: 'queue_update',
          title: `📊 Position #${position}`,
          message: `${myRequest.songTitle || 'Your request'} is moving up!`,
          metadata: {
            requestId: myRequest.requestId,
            songTitle: myRequest.songTitle,
          }
        });
      }
    }
  }, [queueData, user?.userId, shouldShowNotification, addNotification]);

  // Fetch real data
  const { event: currentEvent, loading: eventLoading, error: eventError } = useEvent(currentEventId);
  const { queue } = useQueue(currentSetId);
  const { tracklist, loading: tracklistLoading } = useTracklist(currentEventId);

  // Fetch active events from backend
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [performerNames, setPerformerNames] = useState<Record<string, string>>({});
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Helper: Request user's location for distance calculation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log('📍 User location acquired:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('⚠️ Geolocation permission denied or unavailable:', error);
          // Continue without location - will show "Nearby" instead of distance
        }
      );
    }
  }, []);

  // Helper: Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Helper: Format distance string
  const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m away`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)} km away`;
    } else {
      return `${Math.round(distanceKm)} km away`;
    }
  };

  // Helper: Fetch performer name by userId
  const fetchPerformerName = async (userId: string): Promise<string> => {
    // Check cache first
    if (performerNames[userId]) {
      return performerNames[userId];
    }

    try {
      const { generateClient } = await import('aws-amplify/api');
      const client = generateClient({ authMode: 'userPool' });
      
      const response: any = await client.graphql({
        query: `
          query GetUser($userId: ID!) {
            getUser(userId: $userId) {
              userId
              name
              email
            }
          }
        `,
        variables: { userId }
      });

      const userName = response.data?.getUser?.name || 'DJ';
      
      // Update cache
      setPerformerNames(prev => ({ ...prev, [userId]: userName }));
      
      return userName;
    } catch (error) {
      console.warn(`Failed to fetch performer name for ${userId}:`, error);
      return 'DJ'; // Fallback
    }
  };

  // Helper: Fetch attendee count for an event
  const fetchAttendeeCount = async (eventId: string): Promise<number> => {
    try {
      const { generateClient } = await import('aws-amplify/api');
      const client = generateClient({ authMode: 'userPool' });
      
      const response: any = await client.graphql({
        query: `
          query GetQueue($eventId: ID!) {
            getQueue(eventId: $eventId) {
              orderedRequests {
                userName
              }
            }
          }
        `,
        variables: { eventId }
      });

      const requests = response.data?.getQueue?.orderedRequests || [];
      
      // Count unique users (attendees)
      const uniqueUsers = new Set(requests.map((r: any) => r.userName));
      return uniqueUsers.size;
    } catch (error) {
      console.warn(`Failed to fetch attendee count for event ${eventId}:`, error);
      return 0; // Fallback
    }
  };

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);
        console.log('🔍 Fetching active events from backend...');
        
        // Check authentication status before making request
        try {
          const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth');
          const currentUser = await getCurrentUser();
          const session = await fetchAuthSession();
          
          console.log('✅ User authenticated:', currentUser.userId);
          console.log('✅ Session tokens present:', {
            idToken: !!session.tokens?.idToken,
            accessToken: !!session.tokens?.accessToken,
          });
          
          if (!session.tokens?.idToken) {
            throw new Error('No authentication token available. Please sign out and sign back in.');
          }
        } catch (authError: any) {
          console.error('❌ Authentication check failed:', authError);
          throw new Error('Not authenticated. Please sign in to view events.');
        }
        
        const { generateClient } = await import('aws-amplify/api');
        const client = generateClient({
          authMode: 'userPool'
        });
        
        const response: any = await client.graphql({
          query: `
            query ListActiveEvents {
              listActiveEvents {
                items {
                  eventId
                  venueName
                  venueLocation {
                    address
                    city
                    province
                    coordinates {
                      lat
                      lng
                    }
                  }
                  startTime
                  endTime
                  status
                  createdBy
                }
              }
            }
          `
        });
        
        console.log('✅ Events fetched:', response.data.listActiveEvents);
        
        // Handle connection response (deployed schema returns { items: [], nextToken: null })
        const rawEvents = response.data.listActiveEvents?.items || [];
        
        // Transform events and fetch performer names, attendee counts, and calculate distances
        const transformedEvents = await Promise.all(
          rawEvents.map(async (event: any) => {
            // Fetch DJ name asynchronously
            const djName = event.createdBy ? await fetchPerformerName(event.createdBy) : 'DJ';
            
            // Fetch attendee count asynchronously
            const attendees = await fetchAttendeeCount(event.eventId);
            
            // Calculate distance if user location and venue location are available
            let distance = 'Nearby';
            if (userLocation && event.venueLocation?.coordinates?.lat && event.venueLocation?.coordinates?.lng) {
              const distanceKm = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                event.venueLocation.coordinates.lat,
                event.venueLocation.coordinates.lng
              );
              distance = formatDistance(distanceKm);
            } else if (event.venueLocation?.city) {
              distance = event.venueLocation.city; // Show city if no coordinates
            }
            
            return {
              id: event.eventId,
              eventId: event.eventId,
              venueName: event.venueName,
              venueLocation: event.venueLocation,
              performerId: event.createdBy,
              djName, // Now shows real performer name!
              startTime: event.startTime,
              endTime: event.endTime,
              status: event.status,
              genre: 'All Genres', // TODO: Get from event settings
              attendees, // Now shows real attendee count!
              distance, // Now shows real distance or city!
              image: null, // TODO: Get venue/DJ image
            };
          })
        );
        
        console.log('📋 Transformed events with DJ names, attendees, and distances:', transformedEvents);
        
        setEvents(transformedEvents);
      } catch (error: any) {
        console.error('❌ Failed to fetch events:', error);
        console.error('Error details:', {
          message: error.message,
          errors: error.errors,
          name: error.name,
          statusCode: error.$metadata?.httpStatusCode
        });
        
        // Log the actual GraphQL errors with full details
        if (error.errors && error.errors.length > 0) {
          console.error('GraphQL Errors:');
          error.errors.forEach((err: any, index: number) => {
            console.error(`  Error ${index + 1}:`, err.message);
          });
        }
        
        // Set user-friendly error message
        let errorMessage = 'Failed to load events. ';
        
        if (error.message?.includes('Not authenticated')) {
          errorMessage = 'Please sign in to view events.';
          setEventsError(errorMessage);
          return;
        }
        
        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          console.error('First error message:', firstError.message);
          console.error('First error type:', firstError.errorType);
          
          if (firstError.message?.includes('Not Authorized') || 
              firstError.message?.includes('Unauthorized') ||
              firstError.errorType === 'Unauthorized') {
            errorMessage = '🔐 Authentication issue detected. This usually happens when:\n\n' +
                          '1. Your session has expired\n' +
                          '2. You need to sign out and sign back in\n' +
                          '3. The authentication token is not being sent correctly\n\n' +
                          'Please try signing out and signing back in. If the problem persists, check the browser console for more details.';
          } else if (firstError.message?.includes('Cannot return null') || firstError.message?.includes('resolver')) {
            errorMessage = 'Backend API not fully configured. Using demo mode.';
            // Don't show error to user, just use empty state
            setEvents([]);
            setEventsError(null);
            return; // Exit early, don't set error
          } else if (firstError.message?.includes('FieldUndefined') || firstError.message?.includes('Validation error')) {
            errorMessage = 'Schema mismatch detected. Using demo mode.';
            // Schema needs redeployment, use empty state
            setEvents([]);
            setEventsError(null);
            return; // Exit early
          } else {
            errorMessage = `GraphQL Error: ${firstError.message}`;
          }
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          errorMessage = '🔐 Authentication error (401). Please sign out and sign back in.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        setEventsError(errorMessage);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchActiveEvents();
  }, []);

  // Fetch DJ sets when event is selected
  useEffect(() => {
    const fetchDJSets = async () => {
      if (!currentEventId) {
        setDjSets([]);
        return;
      }

      try {
        console.log('🎵 Fetching DJ sets for event:', currentEventId);
        
        const { generateClient } = await import('aws-amplify/api');
        const client = generateClient({
          authMode: 'userPool'
        });
        
        const response: any = await client.graphql({
          query: `
            query ListEventDJSets($eventId: ID!) {
              listEventDJSets(eventId: $eventId) {
                setId
                eventId
                performerId
                setStartTime
                setEndTime
                status
                isAcceptingRequests
                settings {
                  basePrice
                  requestCapPerHour
                }
              }
            }
          `,
          variables: { eventId: currentEventId }
        });
        
        const sets = response.data.listEventDJSets || [];
        console.log('✅ DJ sets fetched:', sets);
        setDjSets(sets);
        
        // If there's only one set, auto-select it
        if (sets.length === 1) {
          setCurrentSetId(sets[0].setId);
          setViewState('browsing');
        } else if (sets.length > 1) {
          setViewState('lineup');
        } else {
          // No DJ sets found - proceed to browsing with eventId as setId
          console.log('⚠️ No DJ sets found, using event as default set');
          setCurrentSetId(currentEventId);
          setViewState('browsing');
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch DJ sets:', error);
        console.warn('⚠️ DJ Sets feature not available - schema not deployed');
        
        // Check if this is a schema error
        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          if (firstError.message?.includes('Cannot query field') || firstError.message?.includes('listEventDJSets')) {
            console.warn('📋 Deployed schema is missing DJ Sets queries. For now, assuming single set and proceeding to browsing...');
            // Fallback: assume event has one default set
            setCurrentSetId(currentEventId); // Use eventId as temporary setId
            setViewState('browsing');
            return;
          }
        }
        
        setDjSets([]);
      }
    };

    fetchDJSets();
  }, [currentEventId]);

  // Reset to discovery if event fails to load
  useEffect(() => {
    // Only check if event load failed (not just still loading)
    if (!currentEventId) return; // No event selected
    if (eventLoading) return; // Still loading, wait
    
    // Check if we got an error OR if event is null after loading
    // Only redirect if we actually have an error (not just null data)
    if (eventError && !currentEvent) {
      console.log('⚠️ Event not found after loading completed, returning to discovery');
      console.log('  - eventId:', currentEventId);
      console.log('  - eventLoading:', eventLoading);
      console.log('  - eventError:', eventError);
      console.log('  - currentEvent:', currentEvent);
      
      setCurrentEventId(null);
      setCurrentSetId(null);
      setViewState('discovery');
    }
  }, [currentEvent, currentEventId, eventLoading, eventError]);

  // Check if user's song is playing
  useEffect(() => {
    if (queue?.orderedRequests && myRequestPosition === 1) {
      setShowNowPlaying(true);
      setViewState('playing');
    }
  }, [queue, myRequestPosition]);

  // Load user's active requests on mount (queue position persistence)
  useEffect(() => {
    const loadMyRequests = async () => {
      if (!user?.userId || !currentEventId) return;
      
      try {
        const activeRequests = await fetchUserActiveRequests(user.userId, currentEventId);
        
        if (activeRequests && activeRequests.length > 0) {
          const activeRequest = activeRequests[0]; // Get most recent active request
          
          setMyRequestPosition(activeRequest.queuePosition || null);
          setSelectedSong({
            id: activeRequest.songId,
            title: activeRequest.songTitle,
            artist: activeRequest.artistName,
            genre: '', // Not returned from query
            basePrice: activeRequest.price || 0,
          });
          
          // Set appropriate view state
          if (activeRequest.queuePosition === 1) {
            setViewState('playing');
          } else if (activeRequest.status === 'PENDING' || activeRequest.status === 'ACCEPTED') {
            setViewState('waiting');
          }
          
          console.log('✅ Loaded active request:', activeRequest);
        }
      } catch (error: any) {
        console.error('Failed to load active requests:', error);
        
        // Check if it's a schema error
        const isSchemaError = error.errors?.some((e: any) => 
          e.message?.includes('Cannot query field') || 
          e.message?.includes('getUserActiveRequests')
        );
        
        if (isSchemaError) {
          console.warn('⚠️ Active requests feature not available - schema not deployed');
        }
        // Don't show error to user - just continue normally
      }
    };
    
    loadMyRequests();
  }, [user?.userId, currentEventId]);

  // Feature 6: Subscribe to request status updates (for refunds)
  // TODO: Re-enable after fixing subscription infinite loop issue
  // useEffect(() => {
  //   if (!user?.userId) return;
  //   // Subscription code here
  // }, [user?.userId]);

  const handleSelectEvent = (eventId: string) => {
    setCurrentEventId(eventId);
    // viewState will be set by useEffect based on number of DJ sets
  };

  const handleSelectDJSet = (setId: string) => {
    setCurrentSetId(setId);
    setViewState('browsing');
  };

  const handleSelectSong = async (song: Song) => {
    // Rate limiting check
    if (!requestRateLimiter.tryConsume(user?.userId || 'anon')) {
      const remaining = requestRateLimiter.getResetTime(user?.userId || 'anon');
      const seconds = Math.ceil(remaining / 1000);
      addNotification({
        type: 'error',
        title: '⏱️ Too Many Requests',
        message: `Please wait ${seconds} seconds before trying again.`,
      });
      return;
    }

    // Check for duplicate requests
    const existingRequest = queue?.orderedRequests?.find(
      (req: any) => 
        req.songTitle === song.title && 
        req.artistName === song.artist &&
        req.userId === user?.userId
    );
    
    if (existingRequest) {
      addNotification({
        type: 'error',
        title: '🔁 Already Requested',
        message: 'You already requested this song!',
      });
      return;
    }
    
    // Check user's active request limit (max 3)
    const userActiveRequests = queue?.orderedRequests?.filter(
      (req: any) => req.userId === user?.userId && req.status === 'PENDING'
    ).length || 0;
    
    if (userActiveRequests >= 3) {
      addNotification({
        type: 'error',
        title: '🚫 Request Limit Reached',
        message: 'Maximum 3 active requests allowed',
      });
      return;
    }

    // Check DJ set capacity
    if (currentSetId) {
      try {
        const djSet = await fetchDJSet(currentSetId);
        
        // Check if sold out
        if (djSet.settings?.isSoldOut) {
          addNotification({
            type: 'error',
            title: '🚫 Sold Out',
            message: 'Request queue is currently full. Try again later!',
          });
          return;
        }
        
        // Check request cap (requests in last hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const requestsThisHour = queue?.orderedRequests?.filter((req: any) => {
          return req.timestamp > oneHourAgo;
        }).length || 0;
        
        if (djSet.settings?.requestCapPerHour && requestsThisHour >= djSet.settings.requestCapPerHour) {
          addNotification({
            type: 'error',
            title: '⏰ Hourly Cap Reached',
            message: 'Hourly request cap reached. Try again in a few minutes!',
          });
          return;
        }
      } catch (error) {
        console.error('Failed to check DJ set settings:', error);
        // Don't block user if check fails
      }
    }
    
    setSelectedSong(song);
    setViewState('requesting');
  };

  const handleCancelRequest = () => {
    setSelectedSong(null);
    setViewState('browsing');
  };

  const songs: Song[] = tracklist.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    genre: t.genre,
    basePrice: t.basePrice,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Top Bar - Minimal */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-xs sm:text-sm truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs text-yellow-400">{user?.tier || 'BRONZE'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 h-screen">
        {/* Event Discovery */}
        {viewState === 'discovery' && (
          <>
            {eventsLoading ? (
              <LoadingState message="Finding events near you...">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mt-8">
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                </div>
              </LoadingState>
            ) : eventsError ? (
              <EmptyState
                emoji="⚠️"
                title="Unable to Load Events"
                message={eventsError}
                action={{
                  label: "Retry",
                  onClick: () => window.location.reload()
                }}
              />
            ) : events.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Events Nearby"
                message="Check back soon or try a different location. New events are added daily!"
              />
            ) : (
              <EventDiscovery
                events={events}
                onSelectEvent={handleSelectEvent}
              />
            )}
          </>
        )}

        {/* DJ Lineup Selection */}
        {viewState === 'lineup' && (
          <div className="h-full p-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => {
                    setCurrentEventId(null);
                    setCurrentSetId(null);
                    setViewState('discovery');
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {currentEvent?.venueName || 'Event Lineup'}
                  </h2>
                  <p className="text-purple-300">Select a DJ to browse their library</p>
                </div>
              </div>

              {/* DJ Sets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {djSets
                  .sort((a, b) => new Date(a.setStartTime).getTime() - new Date(b.setStartTime).getTime())
                  .map((set) => {
                    const startTime = new Date(set.setStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endTime = new Date(set.setEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isActive = set.status === 'ACTIVE';
                    const isAccepting = set.isAcceptingRequests;

                    return (
                      <button
                        key={set.setId}
                        onClick={() => handleSelectDJSet(set.setId)}
                        disabled={!isAccepting}
                        className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all transform hover:scale-105 ${
                          isAccepting
                            ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 hover:border-purple-400 cursor-pointer'
                            : 'bg-gray-800/30 border-2 border-gray-700/50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {/* Status Badge */}
                        {isActive && (
                          <div className="absolute top-4 right-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/50">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-xs font-semibold">LIVE NOW</span>
                            </div>
                          </div>
                        )}

                        {/* Set Times */}
                        <div className="mb-4">
                          <div className="text-purple-300 text-sm mb-1">Set Time</div>
                          <div className="text-white text-2xl font-bold">
                            {startTime} - {endTime}
                          </div>
                        </div>

                        {/* DJ Info */}
                        <div className="mb-4">
                          <div className="text-gray-400 text-sm mb-1">DJ</div>
                          <div className="text-white text-lg font-semibold">
                            {set.performerId.substring(0, 8)}... {/* TODO: Fetch performer name */}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-gray-400 text-xs">Base Price</div>
                            <div className="text-yellow-400 text-lg font-bold">
                              R{set.settings?.basePrice || 50}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Requests/Hour</div>
                            <div className="text-blue-400 text-lg font-bold">
                              {set.settings?.requestCapPerHour || 10}
                            </div>
                          </div>
                        </div>

                        {/* Status Message */}
                        {!isAccepting && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-gray-400 text-sm">
                              {set.status === 'COMPLETED' ? '✓ Set completed' : '⏸ Not accepting requests'}
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* No Sets Message */}
              {djSets.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎵</div>
                  <p className="text-gray-400 text-xl mb-2">No DJ sets scheduled</p>
                  <p className="text-gray-500">Check back later for the lineup</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browsing Library */}
        {viewState === 'browsing' && (
          <div className="h-full pb-32">
            {currentEvent && (
              <div className="bg-black/50 backdrop-blur-lg p-3 sm:p-4 mb-4 sticky top-14 sm:top-16 z-40">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <button
                    onClick={() => {
                      if (djSets.length > 1) {
                        setCurrentSetId(null);
                        setViewState('lineup');
                      } else {
                        setCurrentEventId(null);
                        setCurrentSetId(null);
                        setViewState('discovery');
                      }
                    }}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{currentEvent.venueName}</h2>
                    <p className="text-purple-300 text-sm sm:text-base">
                      {selectedSong ? `Selected: ${selectedSong.title}` : 'Tap a song to request'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tracklistLoading ? (
              <LoadingState message="Loading DJ's library...">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 mt-8">
                  <SongCardSkeleton />
                  <SongCardSkeleton />
                  <SongCardSkeleton />
                  <SongCardSkeleton />
                </div>
              </LoadingState>
            ) : songs.length === 0 ? (
              <EmptyState
                icon={Music}
                title="No Songs Available"
                message="The DJ hasn't uploaded their tracklist yet. Check back soon!"
                action={{
                  label: "Back to Events",
                  onClick: () => {
                    setCurrentEventId(null);
                    setCurrentSetId(null);
                    setViewState('discovery');
                  }
                }}
              />
            ) : (
              <>
                <AlbumArtGrid
                  songs={songs}
                  onSelectSong={handleSelectSong}
                  selectedSongId={selectedSong?.id}
                />

                <MassiveRequestButton
                  onPress={() => {
                    if (selectedSong) {
                      setViewState('requesting');
                    }
                  }}
                  disabled={!selectedSong}
                  price={selectedSong?.basePrice || 20}
                  selectedSong={selectedSong?.title}
                />
              </>
            )}
          </div>
        )}

        {/* Request Confirmation - Enhanced Component */}
        {viewState === 'requesting' && selectedSong && (
          <RequestConfirmation
            song={selectedSong}
            userTier={user?.tier as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'}
            estimatedQueuePosition={myRequestPosition || 8}
            estimatedWaitTime={myRequestPosition ? `~${myRequestPosition * 3} minutes` : '~25 minutes'}
            onConfirm={async (requestData) => {
              const handleConfirmRequest = async (retryCount = 0): Promise<void> => {
                const MAX_RETRIES = 3;
                setIsProcessing(true);
                setPaymentError(null);
                
                try {
                  // Generate idempotency key to prevent double charges (will be used in production)
                  // const idempotencyKey = `${user?.userId}-${selectedSong.id}-${Date.now()}`;
                  
                  // 1. Create payment intent
                  console.log('Creating payment intent...');
                  const paymentIntent = await createPaymentIntent({
                    amount: selectedSong.basePrice,
                    songId: selectedSong.id,
                    eventId: currentEventId!,
                    userId: user?.userId,
                  });
                  
                  // 2. Process payment via Yoco
                  console.log('Processing payment...');
                  const payment = await processYocoPayment(paymentIntent);
                  
                  if (payment.status !== 'succeeded') {
                    throw new Error('Payment failed');
                  }
                  
                  // 3. Verify payment
                  console.log('Verifying payment...');
                  const verified = await verifyPayment(payment.transactionId);
                  if (!verified) {
                    throw new Error('Payment verification failed');
                  }
                  
                  // 4. Submit request to backend with payment proof
                  console.log('Submitting request to backend...');
                  
                  if (!user?.userId) {
                    throw new Error('User ID not found');
                  }
                  
                  const request = await submitRequest({
                    eventId: currentEventId!,
                    setId: currentSetId!,
                    userId: user.userId,
                    songId: selectedSong.id,
                    songTitle: selectedSong.title,
                    artistName: selectedSong.artist,
                    paymentTransactionId: payment.transactionId,
                    amount: selectedSong.basePrice,
                    dedication: requestData.dedication,
                    requestType: requestData.requestType || 'standard',
                  });
                  
                  // 5. Track successful request
                  BusinessMetrics.requestSubmitted(
                    selectedSong.title,
                    selectedSong.basePrice,
                    currentEventId!
                  );
                  BusinessMetrics.paymentProcessed(
                    selectedSong.basePrice,
                    payment.transactionId
                  );
                  
                  // 6. Show success modal with queue position
                  setSuccessQueuePosition(request.queuePosition || 1);
                  setShowSuccessModal(true);
                  setMyRequestPosition(request.queuePosition || null);
                  
                  // 7. Add notification
                  addNotification({
                    type: 'info',
                    title: '🎵 Request Submitted!',
                    message: `${selectedSong.title} added to the queue`,
                  });
                  
                } catch (error: any) {
                  console.error('Request submission failed:', error);
                  
                  // Retry logic for network errors
                  if (retryCount < MAX_RETRIES && isRetryableError(error)) {
                    console.log(`Retrying payment (${retryCount + 1}/${MAX_RETRIES})...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                    return handleConfirmRequest(retryCount + 1);
                  }
                  
                  // Show error to user
                  setPaymentError(error.message || 'Request failed. Please try again.');
                  addNotification({
                    type: 'error',
                    title: '❌ Request Failed',
                    message: error.message || 'Failed to submit your request. Please try again.',
                  });
                } finally {
                  setIsProcessing(false);
                }
              };
              
              await handleConfirmRequest();
            }}
            onCancel={handleCancelRequest}
          />
        )}

        {/* Waiting in Queue */}
        {viewState === 'waiting' && selectedSong && myRequestPosition && (
          <div className="h-full relative">
            <EnergyBeam
              position={myRequestPosition}
              totalInQueue={10}
              songTitle={selectedSong.title}
            />

            <div className="flex items-center justify-center h-full">
              <div className="text-center z-10">
                <h2 className="text-4xl font-bold text-white mb-4">Your Song is in the Queue!</h2>
                <p className="text-xl text-gray-300 mb-8">{selectedSong.title}</p>
                
                <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 inline-block">
                  <p className="text-gray-400 text-sm mb-2">Position in Queue</p>
                  <p className="text-6xl font-bold text-yellow-400">#{myRequestPosition}</p>
                </div>

                <button
                  onClick={() => setViewState('browsing')}
                  className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                  Browse More Songs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Now Playing Celebration */}
        {showNowPlaying && selectedSong && (
          <NowPlayingCelebration
            songTitle={selectedSong.title}
            artist={selectedSong.artist}
            onDismiss={() => {
              setShowNowPlaying(false);
              setViewState('browsing');
              setSelectedSong(null);
              setMyRequestPosition(null);
            }}
          />
        )}

        {/* Locked In Animation */}
        {showLockedIn && selectedSong && (
          <LockedInAnimation
            songTitle={selectedSong.title}
            onComplete={() => setShowLockedIn(false)}
          />
        )}

        {/* Feature 6: Refund Confirmation Modal */}
        {showRefundModal && refundData && (
          <RefundConfirmation
            refund={{
              requestId: refundData.requestId || '',
              songTitle: refundData.songTitle || 'Unknown Song',
              artistName: refundData.artistName || 'Unknown Artist',
              albumArt: refundData.albumArt,
              venueName: currentEvent?.venueName || 'Event',
              eventDate: currentEvent?.startTime ? new Date(currentEvent.startTime).toLocaleDateString() : 'Today',
              originalAmount: refundData.refundAmount || 0,
              refundAmount: refundData.refundAmount || 0,
              paymentMethod: 'Card',
              paymentLast4: undefined,
              vetoReason: refundData.vetoReason,
              refundReferenceId: refundData.refundTransactionId || 'N/A',
              refundedAt: Date.now(),
              estimatedDays: '3-5 business days',
            }}
            onDismiss={() => {
              setShowRefundModal(false);
              setRefundData(null);
            }}
          />
        )}

        {/* Phase 3: Notification Center Modal */}
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
                  // Handle navigation if needed
                  if (notification.metadata?.requestId) {
                    console.log('Navigate to request:', notification.metadata.requestId);
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

        {/* User Now Playing Notification - Shows when user's song is playing */}
        {showUserPlayingNotification && userPlayingData && (
          <UserNowPlayingNotification
            userName={userPlayingData.userName}
            songTitle={userPlayingData.songTitle}
            artistName={userPlayingData.artistName}
            djName={userPlayingData.djName}
            venueName={userPlayingData.venueName}
            timestamp={userPlayingData.timestamp}
            onDismiss={() => {
              setShowUserPlayingNotification(false);
              setUserPlayingData(null);
            }}
          />
        )}

        {/* Phase 3: Connection Status Indicator */}
        {currentEventId && connectionStatus && (
          <div className="fixed top-16 sm:top-20 right-4 z-40">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold shadow-lg ${
                connectionStatus === 'connected'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : connectionStatus === 'connecting'
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                  : connectionStatus === 'error'
                  ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                  : 'bg-gray-500/20 border border-gray-500/50 text-gray-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-400 animate-pulse'
                    : connectionStatus === 'connecting'
                    ? 'bg-blue-400 animate-pulse'
                    : connectionStatus === 'error'
                    ? 'bg-yellow-400'
                    : 'bg-gray-400'
                }`}
              />
              <span>
                {connectionStatus === 'connected' && '🔴 Live'}
                {connectionStatus === 'connecting' && '⏳ Connecting'}
                {connectionStatus === 'error' && '⚠️ Reconnecting'}
                {connectionStatus === 'disconnected' && '🔄 Updates'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Error Modal */}
      {paymentError && (
        <PaymentErrorModal
          error={paymentError}
          onRetry={() => {
            setPaymentError(null);
            // Re-trigger the request confirmation
            if (selectedSong) {
              setViewState('requesting');
            }
          }}
          onCancel={() => {
            setPaymentError(null);
            setViewState('browsing');
          }}
          isRetrying={isProcessing}
        />
      )}

      {/* Success Confirmation Modal */}
      {showSuccessModal && selectedSong && successQueuePosition !== null && (
        <SuccessConfirmation
          songTitle={selectedSong.title}
          artist={selectedSong.artist}
          queuePosition={successQueuePosition}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessQueuePosition(null);
            setViewState('waiting');
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          mode="fan"
        />
      )}
    </div>
  );
};
