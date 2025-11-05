import React, { useState } from 'react';
import { X, MapPin, Calendar } from 'lucide-react';
import { submitCreateEvent, submitDJSet } from '../services/graphql';

interface EventCreatorProps {
  onClose: () => void;
  onEventCreated: (eventId: string, setId?: string) => void;
}

export const EventCreator: React.FC<EventCreatorProps> = ({ onClose, onEventCreated }) => {
  // Event fields
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueProvince, setVenueProvince] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventDuration, setEventDuration] = useState(6); // hours
  
  // DJ Set fields - defaults align with event
  const [djSetDuration, setDjSetDuration] = useState(2); // hours
  const [basePrice, setBasePrice] = useState(50);
  const [requestCapPerHour, setRequestCapPerHour] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCreate = async () => {
    if (!venueName || !eventStartTime) return;

    setLoading(true);
    try {
      // Step 1: Create Event
      const eventStartTimestamp = new Date(eventStartTime).getTime();
      const eventEndTimestamp = eventStartTimestamp + (eventDuration * 60 * 60 * 1000);

      // Build venue location object if city is provided
      const venueLocation = venueCity ? {
        address: venueAddress || venueName,
        city: venueCity,
        province: venueProvince || 'Unknown'
      } : null;

      console.log('🚀 Creating event in backend:', {
        venueName,
        venueLocation,
        startTime: eventStartTimestamp,
        endTime: eventEndTimestamp,
        status: 'ACTIVE'
      });

      const eventResult = await submitCreateEvent({
        venueName,
        venueLocation,
        startTime: eventStartTimestamp,
        endTime: eventEndTimestamp,
        status: 'ACTIVE'
      });

      console.log('✅ Event created successfully:', eventResult);
      
      if (!eventResult || !eventResult.eventId) {
        throw new Error('No eventId returned from backend');
      }

      // Step 2: Create DJ Set (starts same time as event)
      const setStartTimestamp = eventStartTimestamp; // Auto-align with event
      const setEndTimestamp = setStartTimestamp + (djSetDuration * 60 * 60 * 1000);

      console.log('🎵 Creating DJ set in backend:', {
        eventId: eventResult.eventId,
        setStartTime: setStartTimestamp,
        setEndTime: setEndTimestamp,
        basePrice,
        requestCapPerHour
      });

      const setResult = await submitDJSet({
        eventId: eventResult.eventId,
        setStartTime: setStartTimestamp,
        setEndTime: setEndTimestamp,
        basePrice,
        requestCapPerHour
      });

      console.log('✅ DJ Set created successfully:', setResult);

      if (setResult && setResult.setId) {
        onEventCreated(eventResult.eventId, setResult.setId);
        onClose();
      } else {
        throw new Error('No setId returned from backend');
      }
    } catch (error: any) {
      console.error('❌ Failed to create event/set:', error);
      console.error('Error details:', {
        message: error.message,
        errors: error.errors,
        data: error.data
      });
      
      // Extract detailed error message
      let errorMessage = 'Backend error';
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        console.error('GraphQL Error:', firstError);
        errorMessage = firstError.message || firstError.errorType || 'Unknown GraphQL error';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error to user - NO FALLBACK
      alert(`Failed to create event/set:\n\n${errorMessage}\n\nPlease check:\n1. You are logged in as a PERFORMER\n2. Your session is valid\n3. Backend resolvers are deployed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">🎉 New Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        {/* Minimal Form */}
        <div className="space-y-4">
          {/* Venue Name - Icon only, no label */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Venue name"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Venue Location - Collapsible */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-300">📍 Venue Location</span>
              <span className="text-xs text-gray-400">(Optional but recommended)</span>
            </div>
            
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Street address"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              />
              <input
                type="text"
                value={venueProvince}
                onChange={(e) => setVenueProvince(e.target.value)}
                placeholder="Province"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Event Start Time - Icon only, no label */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="datetime-local"
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Duration Sliders - Compact inline */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-300">🎪 Event</span>
                <span className="text-sm font-bold text-white">{eventDuration}h</span>
              </div>
              <input
                type="range"
                value={eventDuration}
                onChange={(e) => setEventDuration(Number(e.target.value))}
                min="2"
                max="12"
                step="1"
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-300">🎧 Your Set</span>
                <span className="text-sm font-bold text-white">{djSetDuration}h</span>
              </div>
              <input
                type="range"
                value={djSetDuration}
                onChange={(e) => setDjSetDuration(Number(e.target.value))}
                min="0.5"
                max="8"
                step="0.5"
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Advanced Settings - Collapsible */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-300 text-sm"
          >
            <span>💰 Pricing & Limits</span>
            <span className="text-xs opacity-50">
              {showAdvanced ? '▼' : '▶'}
            </span>
          </button>

          {showAdvanced && (
            <div className="space-y-3 bg-white/5 rounded-xl p-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Base Price</span>
                  <span className="text-sm font-bold text-white">R{basePrice}</span>
                </div>
                <input
                  type="range"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  min="20"
                  max="200"
                  step="10"
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Requests/Hour</span>
                  <span className="text-sm font-bold text-white">{requestCapPerHour}</span>
                </div>
                <input
                  type="range"
                  value={requestCapPerHour}
                  onChange={(e) => setRequestCapPerHour(Number(e.target.value))}
                  min="5"
                  max="30"
                  step="5"
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!venueName || !eventStartTime || loading}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-all shadow-lg shadow-purple-500/50"
          >
            {loading ? '⏳ Creating...' : '🚀 Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
