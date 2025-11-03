import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusIndicator } from '../components/StatusIndicators';
import { FriendList, ActivityFeed } from '../components/SocialFeatures';
import { FeelingLucky, GenreRoulette } from '../components/ExploratoryFeatures';
import { 
  PredictiveWaitTime, 
  RequestImpactMeter, 
  TrendsetterScore, 
  KarmaPoints,
  CollectiveEnergy,
  AutoQueueFallback,
  RequestInsurance
} from '../components/PsychologicalEngagement';
import { 
  PeripheralNotifications, 
  CircularQueueTracker, 
  EventEnergyWaveform,
  BrightnessOverlay
} from '../components/PeripheralNotifications';
import { QrCode, Search, Music, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '../components/DarkModeTheme';

interface Event {
  eventId: string;
  venueName: string;
  performerName: string;
  status: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  basePrice: number;
}

export const UserPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'discover' | 'request' | 'social'>('discover');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [requestType, setRequestType] = useState<'standard' | 'spotlight' | 'dedication'>('standard');
  
  // Psychological engagement state
  const [queuePosition, setQueuePosition] = useState(3);
  const [totalInQueue, setTotalInQueue] = useState(12);
  const [upvotes, setUpvotes] = useState(5);
  const [isUpvoteAnimating, setIsUpvoteAnimating] = useState(false);
  const [karmaPoints, setKarmaPoints] = useState(150);
  const [showVetoFallback, setShowVetoFallback] = useState(false);
  const [vetoedSong, setVetoedSong] = useState<Song | null>(null);
  const [peripheralNotifications, setPeripheralNotifications] = useState<any[]>([]);
  const [queueProgress, setQueueProgress] = useState(25);
  const [eventActivity, setEventActivity] = useState([30, 45, 60, 75, 85, 70, 55, 40, 50, 65]);

  // Mock data
  const mockSongs: Song[] = [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', basePrice: 20 },
    { id: '2', title: 'Levitating', artist: 'Dua Lipa', genre: 'Dance', basePrice: 20 },
    { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', genre: 'Pop', basePrice: 20 },
    { id: '4', title: 'Good 4 U', artist: 'Olivia Rodrigo', genre: 'Pop Rock', basePrice: 20 },
  ];

  const mockGenres = ['Pop', 'Dance', 'Pop Rock', 'Hip Hop', 'R&B', 'Electronic'];

  useEffect(() => {
    // Mock current event
    setCurrentEvent({
      eventId: '1',
      venueName: 'The Blue Room',
      performerName: 'DJ Awesome',
      status: 'ACTIVE',
    });

    // Simulate queue progress updates
    const progressInterval = setInterval(() => {
      setQueueProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
      
      setQueuePosition(prev => Math.max(1, prev - 1));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(progressInterval);
  }, []);

  const handleUpvote = () => {
    setUpvotes(prev => prev + 1);
    setIsUpvoteAnimating(true);
    setKarmaPoints(prev => prev + 10);
    setTimeout(() => setIsUpvoteAnimating(false), 1500);
    
    // Add peripheral notification
    const notification = {
      id: Date.now().toString(),
      type: 'upvoted' as const,
      edge: 'right' as const,
      duration: 3000,
    };
    setPeripheralNotifications(prev => [...prev, notification]);
  };

  const handleAddToBackup = async () => {
    // Simulate adding to backup list
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowVetoFallback(false);
    alert('Song added to your backup list!');
  };

  const getCurrentHour = () => {
    return new Date().getHours();
  };

  const handleJoinEvent = (method: 'qr' | 'search' | 'gps') => {
    console.log('Joining event via:', method);
    // In production: scan QR, search, or use GPS
  };

  const handleRequestSong = () => {
    if (!selectedSong) return;
    console.log('Requesting song:', selectedSong, 'Type:', requestType);
    // In production: call GraphQL mutation and process payment
    alert(`Request submitted for ${selectedSong.title}!`);
    setSelectedSong(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getRequestPrice = () => {
    if (!selectedSong) return 0;
    const multiplier = requestType === 'spotlight' ? 2.5 : requestType === 'dedication' ? 1.5 : 1;
    return selectedSong.basePrice * multiplier;
  };

  return (
    <>
      <BrightnessOverlay />
      <PeripheralNotifications 
        notifications={peripheralNotifications}
        onNotificationComplete={(id) => {
          setPeripheralNotifications(prev => prev.filter(n => n.id !== id));
        }}
      />
      <CircularQueueTracker progress={queueProgress} />
      <EventEnergyWaveform activityData={eventActivity} />
      
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50 dark:from-black dark:via-gray-900 dark:to-gray-950 relative transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/60 backdrop-blur-lg border-b border-amber-200 dark:border-gray-800 shadow-lg shadow-amber-500/10 dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Music className="w-8 h-8 text-amber-600 dark:text-gray-400" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-white dark:to-white bg-clip-text text-transparent">BeatMatchMe</h1>
              <p className="text-sm text-amber-700 dark:text-gray-400">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-100 to-yellow-100 dark:bg-gray-800/50 rounded-lg border border-amber-300 dark:border-gray-700 shadow-md shadow-amber-500/20 dark:shadow-none">
              <User className="w-4 h-4 text-amber-700 dark:text-gray-400" />
              <span className="text-sm font-semibold text-amber-900 dark:text-gray-300">{user?.tier}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-100 to-yellow-100 dark:bg-gray-800/50 hover:from-amber-200 hover:to-yellow-200 dark:hover:bg-gray-700/50 text-amber-900 dark:text-gray-300 hover:text-amber-950 dark:hover:text-white rounded-lg transition-colors border border-amber-300 dark:border-gray-700 shadow-md shadow-amber-500/20 dark:shadow-none"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Status */}
        {!currentEvent ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-6 border border-white/20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Join an Event</h2>
            <p className="text-gray-300 mb-6">Choose how you'd like to join</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleJoinEvent('qr')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-lg transition-all"
              >
                <QrCode className="w-12 h-12 mx-auto mb-2" />
                <div>Scan QR Code</div>
              </button>
              <button
                onClick={() => handleJoinEvent('search')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6 rounded-lg transition-all"
              >
                <Search className="w-12 h-12 mx-auto mb-2" />
                <div>Search Events</div>
              </button>
              <button
                onClick={() => handleJoinEvent('gps')}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-6 rounded-lg transition-all"
              >
                <Music className="w-12 h-12 mx-auto mb-2" />
                <div>Nearby Events</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentEvent.venueName}</h2>
                <p className="text-gray-300">DJ: {currentEvent.performerName}</p>
              </div>
              <StatusIndicator status="playing" size="lg" />
            </div>
          </div>
        )}

        {currentEvent && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('discover')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'discover'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setActiveTab('request')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'request'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Make Request
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'social'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Social
              </button>
            </div>

            {/* Psychological Engagement Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <PredictiveWaitTime
                queuePosition={queuePosition}
                totalInQueue={totalInQueue}
                averageSongDuration={210}
              />
              <TrendsetterScore
                rank={15}
                totalUsers={234}
                successfulRequests={8}
              />
              <KarmaPoints
                points={karmaPoints}
                tier="silver"
                nextTierPoints={250}
              />
            </div>

            {/* Collective Energy */}
            <CollectiveEnergy
              totalRequests={47}
              activeUsers={23}
              topGenre="House"
              energyLevel="peak"
              className="mb-6"
            />

            {/* Auto-Queue Fallback (shown when song is vetoed) */}
            {showVetoFallback && vetoedSong && (
              <AutoQueueFallback
                vetoedSong={vetoedSong}
                onAddToBackup={handleAddToBackup}
                onDismiss={() => setShowVetoFallback(false)}
                className="mb-6"
              />
            )}

            {/* Tab Content */}
            {activeTab === 'discover' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FeelingLucky
                    availableSongs={mockSongs}
                    onSongSelected={(song) => {
                      setSelectedSong(song as Song);
                      setActiveTab('request');
                    }}
                  />
                  <GenreRoulette
                    genres={mockGenres}
                    onGenreSelected={(genre) => {
                      console.log('Selected genre:', genre);
                    }}
                  />
                </div>
                
                {/* Request Impact Meter Demo */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Your Recent Request</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Blinding Lights - The Weeknd</p>
                      <p className="text-sm text-gray-400">Position #3 in queue</p>
                    </div>
                    <RequestImpactMeter
                      upvotes={upvotes}
                      isAnimating={isUpvoteAnimating}
                      onUpvote={handleUpvote}
                    />
                  </div>
                  <RequestInsurance
                    requestId="req-123"
                    price={30}
                    className="mt-4"
                  />
                </div>
              </div>
            )}

            {activeTab === 'request' && (
              <div className="space-y-6">
                {/* Search */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <label className="block text-white text-sm font-medium mb-2">Search Songs</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by song or artist..."
                    />
                  </div>
                </div>

                {/* Song List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockSongs
                    .filter(
                      (song) =>
                        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((song) => (
                      <div
                        key={song.id}
                        onClick={() => setSelectedSong(song)}
                        className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border cursor-pointer transition-all ${
                          selectedSong?.id === song.id
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-white/20 hover:border-blue-500/50'
                        }`}
                      >
                        <h4 className="text-lg font-bold text-white">{song.title}</h4>
                        <p className="text-gray-300">{song.artist}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-400">{song.genre}</span>
                          <span className="text-sm text-green-400 font-semibold">R{song.basePrice}</span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Request Form */}
                {selectedSong && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">Request Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Request Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setRequestType('standard')}
                            className={`py-3 rounded-lg font-semibold transition-all ${
                              requestType === 'standard'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            Standard
                          </button>
                          <button
                            onClick={() => setRequestType('spotlight')}
                            className={`py-3 rounded-lg font-semibold transition-all ${
                              requestType === 'spotlight'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            Spotlight
                          </button>
                          <button
                            onClick={() => setRequestType('dedication')}
                            className={`py-3 rounded-lg font-semibold transition-all ${
                              requestType === 'dedication'
                                ? 'bg-pink-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            Dedication
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white">Song:</span>
                          <span className="text-white font-semibold">{selectedSong.title}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white">Artist:</span>
                          <span className="text-white font-semibold">{selectedSong.artist}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white">Price:</span>
                          <span className="text-green-400 font-bold text-xl">R{getRequestPrice()}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleRequestSong}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all"
                      >
                        Submit Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Friends</h3>
                  <FriendList
                    friends={[]}
                    onAddFriend={(id: string) => console.log('Add friend:', id)}
                    onRemoveFriend={(id: string) => console.log('Remove friend:', id)}
                    onViewProfile={(id: string) => console.log('View profile:', id)}
                  />
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Activity Feed</h3>
                  <ActivityFeed
                    activities={[]}
                    onLoadMore={() => console.log('Load more')}
                    hasMore={false}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
};
