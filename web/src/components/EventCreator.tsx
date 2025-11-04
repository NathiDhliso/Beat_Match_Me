import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import { submitCreateEvent, submitDJSet } from '../services/graphql';

interface EventCreatorProps {
  onClose: () => void;
  onEventCreated: (eventId: string, setId?: string) => void;
}

export const EventCreator: React.FC<EventCreatorProps> = ({ onClose, onEventCreated }) => {
  // Event fields
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventDuration, setEventDuration] = useState(8); // hours
  
  // DJ Set fields
  const [setStartTime, setSetStartTime] = useState('');
  const [setDuration, setSetDuration] = useState(2); // hours
  const [basePrice, setBasePrice] = useState(50);
  const [requestCapPerHour, setRequestCapPerHour] = useState(10);
  
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!venueName || !eventStartTime || !setStartTime) return;

    setLoading(true);
    try {
      // Step 1: Create Event
      const eventStartTimestamp = new Date(eventStartTime).getTime();
      const eventEndTimestamp = eventStartTimestamp + (eventDuration * 60 * 60 * 1000);

      console.log('🚀 Creating event in backend:', {
        venueName,
        startTime: eventStartTimestamp,
        endTime: eventEndTimestamp,
        status: 'ACTIVE'
      });

      const eventResult = await submitCreateEvent({
        venueName,
        startTime: eventStartTimestamp,
        endTime: eventEndTimestamp,
        status: 'ACTIVE'
      });

      console.log('✅ Event created successfully:', eventResult);
      
      if (!eventResult || !eventResult.eventId) {
        throw new Error('No eventId returned from backend');
      }

      // Step 2: Create DJ Set
      const setStartTimestamp = new Date(setStartTime).getTime();
      const setEndTimestamp = setStartTimestamp + (setDuration * 60 * 60 * 1000);

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
      <div className="max-w-lg w-full bg-gray-900 rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Create Event</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          {/* Section: Event Details */}
          <div className="bg-white/5 rounded-lg p-3 sm:p-4">
            <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Event Details</h3>
            
            {/* Venue Name */}
            <div className="mb-3">
              <label className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Venue Name *
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g., The Blue Room"
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Venue Address (Optional) */}
            <div className="mb-3">
              <label className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 block">
                Address (Optional)
              </label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="e.g., 123 Main St, Johannesburg"
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Event Start Time */}
            <div className="mb-3">
              <label className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Event Start Time *
              </label>
              <input
                type="datetime-local"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Event Duration */}
            <div>
              <label className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Event Duration (hours)
              </label>
              <input
                type="number"
                value={eventDuration}
                onChange={(e) => setEventDuration(Number(e.target.value))}
                min="1"
                max="24"
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Section: Your DJ Set */}
          <div className="bg-purple-500/10 rounded-lg p-3 sm:p-4 border border-purple-500/30">
            <h3 className="text-purple-300 font-semibold mb-3 text-sm sm:text-base">Your DJ Set</h3>
            
            {/* Set Start Time */}
            <div className="mb-3">
              <label className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Set Start Time *
              </label>
              <input
                type="datetime-local"
                value={setStartTime}
                onChange={(e) => setSetStartTime(e.target.value)}
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Set Duration */}
            <div className="mb-3">
              <label className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Set Duration (hours)
              </label>
              <input
                type="number"
                value={setDuration}
                onChange={(e) => setSetDuration(Number(e.target.value))}
                min="0.5"
                max="12"
                step="0.5"
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Base Price */}
            <div className="mb-3">
              <label className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Base Price (R)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                min="10"
                max="500"
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Request Cap Per Hour */}
            <div>
              <label className="text-gray-300 text-xs sm:text-sm mb-1.5 sm:mb-2 block">
                Requests per Hour
              </label>
              <input
                type="number"
                value={requestCapPerHour}
                onChange={(e) => setRequestCapPerHour(Number(e.target.value))}
                min="5"
                max="50"
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 sm:py-3 md:py-3.5 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm sm:text-base transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!venueName || !eventStartTime || !setStartTime || loading}
            className="flex-1 py-2 sm:py-3 md:py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm sm:text-base font-semibold transition-all"
          >
            {loading ? 'Creating...' : 'Create Event + Set'}
          </button>
        </div>
      </div>
    </div>
  );
};
