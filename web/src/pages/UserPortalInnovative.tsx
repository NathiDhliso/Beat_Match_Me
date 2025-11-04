/**
 * User Portal - Innovative Event Companion
 * Revolutionary audience experience with gesture-first design
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../hooks/useEvent';
import { useQueue } from '../hooks/useQueue';
import { useTracklist } from '../hooks/useTracklist';
import {
  EventDiscovery,
  AlbumArtGrid,
  MassiveRequestButton,
  LockedInAnimation,
  EnergyBeam,
  NowPlayingCelebration,
} from '../components/AudienceInterface';
import { LogOut, User, Star, ArrowLeft } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  basePrice: number;
  albumArt?: string;
}

type ViewState = 'discovery' | 'browsing' | 'requesting' | 'waiting' | 'playing';

export const UserPortalInnovative: React.FC = () => {
  const { user, logout } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('discovery');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showLockedIn, setShowLockedIn] = useState(false);
  const [myRequestPosition, setMyRequestPosition] = useState<number | null>(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Fetch real data
  const { event: currentEvent } = useEvent(currentEventId);
  const { queue } = useQueue(currentEventId || '');
  const { tracklist, loading: tracklistLoading } = useTracklist(currentEventId);

  // Fetch active events from backend
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);
        console.log('🔍 Fetching active events from backend...');
        
        const { generateClient } = await import('aws-amplify/api');
        const client = generateClient();
        
        const response: any = await client.graphql({
          query: `
            query ListActiveEvents {
              listActiveEvents {
                eventId
                venueName
                startTime
                status
                performerId
              }
            }
          `
        });
        
        console.log('✅ Events fetched:', response.data.listActiveEvents);
        
        // Handle array response (deployed schema returns [Event!]! not EventConnection)
        const events = response.data.listActiveEvents || [];
        
        setEvents(events);
      } catch (error: any) {
        console.error('❌ Failed to fetch events:', error);
        console.error('Error details:', {
          message: error.message,
          errors: error.errors,
          name: error.name,
          statusCode: error.$metadata?.httpStatusCode
        });
        
        // Log the actual GraphQL errors
        if (error.errors && error.errors.length > 0) {
          console.error('GraphQL Errors:');
          error.errors.forEach((err: any, index: number) => {
            console.error(`  Error ${index + 1}:`, {
              message: err.message,
              errorType: err.errorType,
              path: err.path,
              locations: err.locations
            });
          });
        }
        
        // Set user-friendly error message
        let errorMessage = 'Failed to load events. ';
        
        if (error.errors && error.errors.length > 0) {
          const firstError = error.errors[0];
          if (firstError.message?.includes('Not Authorized') || firstError.errorType === 'Unauthorized') {
            errorMessage = 'Authentication error. Please sign out and sign back in.';
          } else if (firstError.message?.includes('Cannot return null')) {
            errorMessage = 'Backend API not configured. The listActiveEvents resolver is missing.';
          } else {
            errorMessage = `GraphQL Error: ${firstError.message}`;
          }
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          errorMessage = 'Authentication error. Please sign out and sign back in.';
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

  useEffect(() => {
    const savedEventId = localStorage.getItem('currentEventId');
    if (savedEventId) {
      setCurrentEventId(savedEventId);
      setViewState('browsing');
    }
  }, []);

  // Reset to discovery if event fails to load
  useEffect(() => {
    if (currentEventId && !currentEvent && !tracklistLoading) {
      // Event doesn't exist, clear saved ID and go back to discovery
      localStorage.removeItem('currentEventId');
      setCurrentEventId(null);
      setViewState('discovery');
    }
  }, [currentEvent, currentEventId, tracklistLoading]);

  // Check if user's song is playing
  useEffect(() => {
    if (queue?.orderedRequests && myRequestPosition === 1) {
      setShowNowPlaying(true);
      setViewState('playing');
    }
  }, [queue, myRequestPosition]);

  const handleSelectEvent = (eventId: string) => {
    setCurrentEventId(eventId);
    localStorage.setItem('currentEventId', eventId);
    setViewState('browsing');
  };

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setViewState('requesting');
  };

  const handleConfirmRequest = async () => {
    // TODO: Submit request to backend
    try {
      // await submitRequest(currentEventId, selectedSong.id);
      setShowLockedIn(true);
      
      setTimeout(() => {
        setShowLockedIn(false);
        setViewState('waiting');
        // TODO: Get real position from backend
        setMyRequestPosition(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit request:', error);
    }
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">{user?.tier || 'BRONZE'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 h-screen">
        {/* Event Discovery */}
        {viewState === 'discovery' && (
          <>
            {eventsLoading ? (
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading events...</p>
                </div>
              </div>
            ) : eventsError ? (
              <div className="flex items-center justify-center h-screen p-4">
                <div className="max-w-md w-full bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-center">
                  <div className="text-red-400 text-5xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-red-400 mb-3">Unable to Load Events</h3>
                  <p className="text-gray-300 mb-4">{eventsError}</p>
                  <div className="bg-black/30 rounded-lg p-4 text-left text-sm text-gray-400">
                    <p className="font-semibold mb-2">Technical Details:</p>
                    <p>The backend AppSync API needs configuration:</p>
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      <li>Query: listActiveEvents</li>
                      <li>Resolver: Query.listActiveEvents.vtl</li>
                      <li>Data source: DynamoDB Events table</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <EventDiscovery
                events={events}
                onSelectEvent={handleSelectEvent}
              />
            )}
          </>
        )}

        {/* Browsing Library */}
        {viewState === 'browsing' && (
          <div className="h-full pb-32">
            {currentEvent && (
              <div className="bg-black/50 backdrop-blur-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('currentEventId');
                      setCurrentEventId(null);
                      setViewState('discovery');
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentEvent.venueName}</h2>
                    <p className="text-purple-300">Browse and request songs</p>
                  </div>
                </div>
              </div>
            )}

            {tracklistLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-white text-xl">Loading songs...</div>
              </div>
            ) : songs.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-400 text-xl mb-2">No songs available</p>
                  <p className="text-gray-500 text-sm">The DJ hasn't added any songs yet</p>
                </div>
              </div>
            ) : (
              <>
                <AlbumArtGrid
                  songs={songs}
                  onSelectSong={handleSelectSong}
                />

                <MassiveRequestButton
                  onPress={() => {
                    if (selectedSong) {
                      setViewState('requesting');
                    }
                  }}
                  disabled={!selectedSong}
                  price={selectedSong?.basePrice || 20}
                />
              </>
            )}
          </div>
        )}

        {/* Request Confirmation */}
        {viewState === 'requesting' && selectedSong && (
          <div className="h-full flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-black/80 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Confirm Request</h2>

              {/* Song Details */}
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">🎵</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white truncate">{selectedSong.title}</h3>
                    <p className="text-purple-200 truncate">{selectedSong.artist}</p>
                    <p className="text-sm text-purple-300 mt-1">{selectedSong.genre}</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="bg-white/5 rounded-2xl p-4 mb-6 text-center">
                <p className="text-gray-400 text-sm mb-1">Total Price</p>
                <p className="text-4xl font-bold text-yellow-400">R{selectedSong.basePrice}</p>
              </div>

              {/* Fair Play Promise */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <p className="text-green-400 text-sm text-center">
                  ✓ Fair-Play Promise: Full refund if DJ vetos
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelRequest}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRequest}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-semibold transition-all shadow-lg"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
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
      </div>
    </div>
  );
};
