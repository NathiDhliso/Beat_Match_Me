/**
 * DJ Portal - Orbital Interface
 * Revolutionary gesture-first design with floating controls
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../hooks/useEvent';
import { useQueue } from '../hooks/useQueue';
import { useTracklist } from '../hooks/useTracklist';
import {
  FloatingActionBubble,
  StatusArc,
  CircularQueueVisualizer,
  GestureHandler,
} from '../components/OrbitalInterface';
import { DJLibrary } from '../components/DJLibrary';
import type { Track } from '../components/DJLibrary';
import { LogOut, Music, DollarSign, Settings, Search, QrCode } from 'lucide-react';
import { EventCreator, QRCodeDisplay } from '../components';

type ViewMode = 'queue' | 'library' | 'revenue' | 'settings';

export const DJPortalOrbital: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('queue');
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  
  // Settings state
  const [basePrice, setBasePrice] = useState(20);
  const [requestsPerHour, setRequestsPerHour] = useState(20);
  const [spotlightSlots, setSpotlightSlots] = useState(1);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  // Event management state
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Fetch real data
  const { event: currentEvent } = useEvent(currentEventId);
  const { queue: queueData } = useQueue(currentEventId || '');
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

  const totalRevenue = queueRequests.reduce((sum: number, req: any) => sum + 20, 0);

  useEffect(() => {
    const savedEventId = localStorage.getItem('djCurrentEventId');
    if (savedEventId) {
      setCurrentEventId(savedEventId);
    }
  }, []);

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
    // TODO: Implement veto with GraphQL mutation
  };

  const handleEventCreated = (eventId: string) => {
    setCurrentEventId(eventId);
    localStorage.setItem('djCurrentEventId', eventId);
  };

  const handleEndEvent = () => {
    if (confirm('Are you sure you want to end this event?')) {
      localStorage.removeItem('djCurrentEventId');
      setCurrentEventId(null);
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

        {/* Logout Button - Top Right Corner */}
        <button
          onClick={logout}
          className="fixed top-4 right-20 z-40 p-3 bg-black/50 backdrop-blur-lg rounded-full border border-red-500/50 hover:bg-red-500/20 transition-all group"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
        </button>

        {/* Main Content Area */}
        <div className="h-screen w-full">
          {/* Queue View - Circular Visualizer */}
          {currentView === 'queue' && (
            <div className="h-full flex flex-col items-center justify-center">
              {!currentEventId ? (
                // No Event - Show Create Button
                <div className="text-center max-w-md">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse-glow">
                    <span className="text-6xl">🎵</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
                  <p className="text-gray-400 mb-8">Create an event to begin accepting requests</p>
                  
                  <button
                    onClick={() => setShowEventCreator(true)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-semibold text-lg transition-all shadow-lg"
                  >
                    Create Event
                  </button>
                  <p className="text-sm text-gray-500 mt-6">Swipe down to manage your library first</p>
                </div>
              ) : queueRequests.length > 0 ? (
                // Has Event + Requests
                <CircularQueueVisualizer
                  requests={queueRequests}
                  onVeto={handleVeto}
                />
              ) : (
                // Has Event, No Requests
                <div className="text-center max-w-md">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse-glow">
                    <span className="text-6xl">🎵</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Event Active!</h2>
                  <p className="text-gray-400 mb-4">Requests will appear here as they come in</p>
                  
                  {/* Event Info */}
                  {currentEvent && (
                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                      <p className="text-white font-semibold text-lg">{currentEvent.venueName}</p>
                      <p className="text-gray-400 text-sm">Event ID: {currentEventId.slice(0, 8)}...</p>
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
                      onClick={handleEndEvent}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all"
                    >
                      End Event
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-6">Swipe down to manage your library</p>
                </div>
              )}
            </div>
          )}

          {/* Library View */}
          {currentView === 'library' && (
            <div className="h-full pt-20 pb-32 px-4">
              <div className="max-w-6xl mx-auto h-full bg-black/30 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden">
                <DJLibrary
                  tracks={tracks}
                  onAddTrack={handleAddTrack}
                  onUpdateTrack={handleUpdateTrack}
                  onDeleteTrack={handleDeleteTrack}
                  onToggleTrack={handleToggleTrack}
                />
              </div>
              <p className="text-center text-gray-400 text-sm mt-4">Swipe up to view queue</p>
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
      </div>
    </GestureHandler>
  );
};
