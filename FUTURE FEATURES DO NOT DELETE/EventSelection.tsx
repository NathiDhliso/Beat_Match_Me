/**
 * Event Selection Component
 * Allows users to join events via QR code, GPS, or search
 * CORE VALUE PROP: Simple, professional event joining
 */

import React, { useState } from 'react';
import { QrCode, Search, MapPin, Calendar, Music, ChevronRight } from 'lucide-react';

interface Event {
  eventId: string;
  venueName: string;
  performerName?: string;
  startTime: number;
  status: string;
  distance?: number;
}

interface EventSelectionProps {
  onEventSelected: (eventId: string) => void;
  className?: string;
}

export const EventSelection: React.FC<EventSelectionProps> = ({
  onEventSelected,
  className = '',
}) => {
  const [activeMethod, setActiveMethod] = useState<'qr' | 'search' | 'nearby' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleQRScan = () => {
    setActiveMethod('qr');
    setIsScanning(true);
    
    // TODO: Implement actual QR scanner
    // For now, simulate QR scan
    setTimeout(() => {
      const mockEventId = 'event-123';
      onEventSelected(mockEventId);
      setIsScanning(false);
    }, 2000);
  };

  const handleNearbySearch = async () => {
    setActiveMethod('nearby');
    
    // TODO: Implement GPS-based search
    // For now, show mock nearby events
    const mockEvents: Event[] = [
      {
        eventId: 'event-1',
        venueName: 'The Blue Room',
        performerName: 'DJ Awesome',
        startTime: Date.now(),
        status: 'ACTIVE',
        distance: 0.5,
      },
      {
        eventId: 'event-2',
        venueName: 'Club Vibes',
        performerName: 'DJ Pulse',
        startTime: Date.now() + 3600000,
        status: 'UPCOMING',
        distance: 1.2,
      },
    ];
    setNearbyEvents(mockEvents);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // TODO: Implement actual search API
    // For now, show mock results
    const mockResults: Event[] = [
      {
        eventId: 'event-3',
        venueName: 'Downtown Lounge',
        performerName: 'DJ Smooth',
        startTime: Date.now(),
        status: 'ACTIVE',
      },
    ];
    setSearchResults(mockResults.filter(e => 
      e.venueName.toLowerCase().includes(query.toLowerCase()) ||
      e.performerName?.toLowerCase().includes(query.toLowerCase())
    ));
  };

  if (activeMethod === null) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 ${className}`}>
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join an Event</h1>
            <p className="text-gray-300">Choose how you'd like to connect</p>
          </div>

          <div className="space-y-4">
            {/* QR Code Scan */}
            <button
              onClick={handleQRScan}
              className="w-full bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 rounded-xl p-6 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">Scan QR Code</h3>
                  <p className="text-sm text-gray-300">Fastest way to join</p>
                </div>
                <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
              </div>
            </button>

            {/* Nearby Events */}
            <button
              onClick={handleNearbySearch}
              className="w-full bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 rounded-xl p-6 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">Nearby Events</h3>
                  <p className="text-sm text-gray-300">Find events around you</p>
                </div>
                <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
              </div>
            </button>

            {/* Search Events */}
            <button
              onClick={() => setActiveMethod('search')}
              className="w-full bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 rounded-xl p-6 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">Search Events</h3>
                  <p className="text-sm text-gray-300">Find by venue or DJ</p>
                </div>
                <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <div className="w-64 h-64 bg-white/10 backdrop-blur-lg rounded-2xl border-4 border-white/30 flex items-center justify-center mb-6 mx-auto">
            <QrCode className="w-32 h-32 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Scanning QR Code...</h2>
          <p className="text-gray-300">Point your camera at the event QR code</p>
          <button
            onClick={() => {
              setIsScanning(false);
              setActiveMethod(null);
            }}
            className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (activeMethod === 'search') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 ${className}`}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setActiveMethod(null)}
            className="text-white mb-6 hover:underline"
          >
            ← Back
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Search Events</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by venue or DJ name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-3">
            {searchResults.map((event) => (
              <EventCard key={event.eventId} event={event} onSelect={() => onEventSelected(event.eventId)} />
            ))}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeMethod === 'nearby') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 ${className}`}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setActiveMethod(null)}
            className="text-white mb-6 hover:underline"
          >
            ← Back
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Nearby Events</h2>
            <p className="text-gray-300">Events within 5km of your location</p>
          </div>

          <div className="space-y-3">
            {nearbyEvents.map((event) => (
              <EventCard key={event.eventId} event={event} onSelect={() => onEventSelected(event.eventId)} />
            ))}
            {nearbyEvents.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No nearby events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const EventCard: React.FC<{ event: Event; onSelect: () => void }> = ({ event, onSelect }) => {
  const isActive = event.status === 'ACTIVE';
  
  return (
    <button
      onClick={onSelect}
      className="w-full bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{event.venueName}</h3>
          {event.performerName && (
            <p className="text-sm text-gray-300 mb-2">DJ: {event.performerName}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(event.startTime).toLocaleTimeString()}
            </span>
            {event.distance !== undefined && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.distance}km away
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isActive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
          }`}>
            {isActive ? 'Live Now' : 'Upcoming'}
          </span>
          <ChevronRight className="w-5 h-5 text-white/50" />
        </div>
      </div>
    </button>
  );
};
