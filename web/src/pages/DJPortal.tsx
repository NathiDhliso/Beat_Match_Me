import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { QueueCard } from '../components/QueueCard';
import { AnalyticsDashboard } from '../components/Analytics';
import { NotificationCenter } from '../components/Notifications';
import { ThemeToggle } from '../components/DarkModeTheme';
import { Music, Calendar, DollarSign, Users, Settings, LogOut } from 'lucide-react';

interface Event {
  eventId: string;
  venueName: string;
  startTime: number;
  endTime: number;
  status: string;
  totalRevenue: number;
  totalRequests: number;
}

interface QueueRequest {
  requestId: string;
  songTitle: string;
  artistName: string;
  genre?: string;
  status: string;
  requestType: 'standard' | 'spotlight' | 'dedication';
  price: number;
  queuePosition?: number;
  userName: string;
  userTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  userImage?: string;
  dedication?: string;
  submittedAt: number;
}

export const DJPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'events' | 'analytics'>('queue');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [queue, setQueue] = useState<QueueRequest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // In production, fetch from GraphQL API
    const mockEvent: Event = {
      eventId: '1',
      venueName: 'The Blue Room',
      startTime: Date.now(),
      endTime: Date.now() + 4 * 60 * 60 * 1000,
      status: 'ACTIVE',
      totalRevenue: 1250,
      totalRequests: 45,
    };

    const mockQueue: QueueRequest[] = [
      {
        requestId: '1',
        songTitle: 'Blinding Lights',
        artistName: 'The Weeknd',
        genre: 'Pop',
        status: 'PENDING',
        requestType: 'spotlight',
        price: 50,
        queuePosition: 1,
        userName: 'Sarah M.',
        userTier: 'GOLD',
        submittedAt: Date.now() - 5 * 60 * 1000,
      },
      {
        requestId: '2',
        songTitle: 'Levitating',
        artistName: 'Dua Lipa',
        genre: 'Dance',
        status: 'PENDING',
        requestType: 'standard',
        price: 20,
        queuePosition: 2,
        userName: 'Mike R.',
        userTier: 'SILVER',
        submittedAt: Date.now() - 3 * 60 * 1000,
      },
    ];

    setCurrentEvent(mockEvent);
    setQueue(mockQueue);
    setEvents([mockEvent]);
  }, []);

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting request:', requestId);
    // In production: call GraphQL mutation
    setQueue((prev) => prev.filter((r) => r.requestId !== requestId));
  };

  const handleVetoRequest = (requestId: string) => {
    console.log('Vetoing request:', requestId);
    // In production: call GraphQL mutation
    setQueue((prev) => prev.filter((r) => r.requestId !== requestId));
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="gradient-bg min-h-screen">
      {/* Header */}
      <header className="header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Music className="w-8 h-8 icon-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary gradient-title bg-clip-text text-transparent">DJ Portal</h1>
              <p className="text-sm text-secondary">Welcome, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <NotificationCenter 
              notifications={[]} 
              onMarkAsRead={() => {}}
              onMarkAllAsRead={() => {}}
              onClearAll={() => {}}
            />
            <button
              onClick={handleLogout}
              className="btn flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Status Bar */}
        {currentEvent && (
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">{currentEvent.venueName}</h2>
                <p className="text-secondary">
                  Status: <span className="text-green-400 font-semibold">{currentEvent.status}</span>
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-green-400 text-2xl font-bold">
                    <DollarSign className="w-6 h-6" />
                    R{currentEvent.totalRevenue}
                  </div>
                  <p className="text-sm text-tertiary">Total Revenue</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-blue-400 text-2xl font-bold">
                    <Users className="w-6 h-6" />
                    {currentEvent.totalRequests}
                  </div>
                  <p className="text-sm text-gray-400">Total Requests</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Current Queue</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Reorder Queue
                </button>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {queue.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 text-center border border-white/10">
                <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No requests in queue</p>
                <p className="text-gray-500 text-sm mt-2">Requests will appear here as they come in</p>
              </div>
            ) : (
              queue.map((request) => (
                <QueueCard
                  key={request.requestId}
                  songTitle={request.songTitle}
                  artistName={request.artistName}
                  userName={request.userName}
                  userTier={request.userTier.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'platinum'}
                  requestType={request.requestType}
                  status={request.status as any}
                  price={request.price}
                  queuePosition={request.queuePosition}
                  dedication={request.dedication}
                  onAccept={() => handleAcceptRequest(request.requestId)}
                  onVeto={() => handleVetoRequest(request.requestId)}
                  isPerformerView={true}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">My Events</h3>
              <button
                onClick={() => setShowCreateEvent(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Create Event
              </button>
            </div>

            {events.map((event) => (
              <div
                key={event.eventId}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">{event.venueName}</h4>
                    <p className="text-gray-300">
                      {new Date(event.startTime).toLocaleDateString()} •{' '}
                      {new Date(event.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">R{event.totalRevenue}</div>
                    <p className="text-sm text-gray-400">{event.totalRequests} requests</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <AnalyticsDashboard />
          </div>
        )}
      </div>
    </div>
  );
};
