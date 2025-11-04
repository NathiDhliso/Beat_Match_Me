import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock } from 'lucide-react';
import { submitCreateEvent } from '../services/graphql';

interface EventCreatorProps {
  onClose: () => void;
  onEventCreated: (eventId: string) => void;
}

export const EventCreator: React.FC<EventCreatorProps> = ({ onClose, onEventCreated }) => {
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(4); // hours
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!venueName || !startTime) return;

    setLoading(true);
    try {
      const startTimestamp = new Date(startTime).getTime();
      const endTimestamp = startTimestamp + (duration * 60 * 60 * 1000);

      console.log('🚀 Creating event in backend:', {
        venueName,
        venueLocation: venueAddress ? { address: venueAddress } : undefined,
        startTime: startTimestamp,
        endTime: endTimestamp,
        status: 'ACTIVE'
      });

      const result = await submitCreateEvent({
        venueName,
        venueLocation: venueAddress ? { address: venueAddress } : undefined,
        startTime: startTimestamp,
        endTime: endTimestamp,
        status: 'ACTIVE'
      });

      console.log('✅ Event created successfully:', result);
      
      if (result && result.eventId) {
        onEventCreated(result.eventId);
        onClose();
      } else {
        throw new Error('No eventId returned from backend');
      }
    } catch (error: any) {
      console.error('❌ Failed to create event:', error);
      console.error('Error details:', {
        message: error.message,
        errors: error.errors,
        data: error.data
      });
      
      // Show error to user - NO FALLBACK
      alert(`Failed to create event: ${error.message || 'Backend error'}\n\nPlease check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-900 rounded-3xl border border-white/10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Venue Name */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue Name *
            </label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g., The Blue Room"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Venue Address (Optional) */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">
              Address (Optional)
            </label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g., 123 Main St, Johannesburg"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Time *
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration (hours)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              max="12"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!venueName || !startTime || loading}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
};
