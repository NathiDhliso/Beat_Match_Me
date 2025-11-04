import React, { useState, useEffect } from 'react';
import { QrCode, MapPin, Download, Share2, Navigation, Clock, Music } from 'lucide-react';
import QRCodeLib from 'qrcode';

// Event with location data
export interface EventWithLocation {
  eventId: string;
  djName: string;
  venueName: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  distance?: number; // in km
}

// QR Code Generator Component
interface QRCodeGeneratorProps {
  eventId: string;
  djName: string;
  venueName: string;
  onDownload?: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  eventId,
  djName,
  venueName,
  onDownload
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, [eventId]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Deep link format: beatmatchme://event/{eventId}
      const deepLink = `beatmatchme://event/${eventId}`;
      
      // Generate QR code as data URL
      const url = await QRCodeLib.toDataURL(deepLink, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `beatmatchme-${eventId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onDownload?.();
  };

  const handleShare = async () => {
    if (!qrCodeUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], `beatmatchme-${eventId}.png`, { type: 'image/png' });
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `${djName} at ${venueName}`,
          text: 'Scan to request songs!',
          files: [file]
        });
      }
    } catch (error) {
      console.error('Failed to share QR code:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <QrCode className="w-6 h-6 text-purple-400" />
        <div>
          <h3 className="text-lg font-bold text-white">Event QR Code</h3>
          <p className="text-sm text-gray-400">Post this at your DJ booth</p>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        {isGenerating ? (
          <div className="w-64 h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : qrCodeUrl ? (
          <>
            <img 
              src={qrCodeUrl} 
              alt="Event QR Code"
              className="w-64 h-64"
            />
            <div className="mt-4 text-center">
              <p className="font-bold text-gray-900">{djName}</p>
              <p className="text-sm text-gray-600">{venueName}</p>
            </div>
          </>
        ) : (
          <div className="w-64 h-64 flex items-center justify-center text-gray-400">
            Failed to generate QR code
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={!qrCodeUrl}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
        
        <button
          onClick={handleShare}
          disabled={!qrCodeUrl}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <p className="text-sm text-purple-300">
          <strong>Tip:</strong> Print this QR code and display it prominently at your DJ booth. 
          Audiences can scan it to instantly access your song library and make requests!
        </p>
      </div>
    </div>
  );
};

// Geolocation Discovery Component
interface GeolocationDiscoveryProps {
  onSelectEvent: (event: EventWithLocation) => void;
}

export const GeolocationDiscovery: React.FC<GeolocationDiscoveryProps> = ({
  onSelectEvent
}) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [events, setEvents] = useState<EventWithLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = () => {
    setLoading(true);
    setError('');
    setPermissionDenied(false);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchNearbyEvents(latitude, longitude);
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError('Location permission denied. Please enable location access to find events near you.');
        } else {
          setError('Failed to get your location. Please try again.');
        }
      }
    );
  };

  const fetchNearbyEvents = async (lat: number, lng: number) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/events/nearby?lat=${lat}&lng=${lng}&radius=1&status=ACTIVE`);
      // const data = await response.json();
      
      // Mock data for now
      const mockEvents: EventWithLocation[] = [
        {
          eventId: '1',
          djName: 'DJ Steve',
          venueName: 'Club XYZ',
          venueAddress: '123 Main St',
          latitude: lat + 0.001,
          longitude: lng + 0.001,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          status: 'ACTIVE',
          distance: 0.2
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      setError('Failed to load nearby events');
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m away`;
    }
    return `${km.toFixed(1)}km away`;
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Events Near You</h2>
        <p className="text-gray-400">Find DJs playing right now within 1km</p>
      </div>

      {/* Location Request */}
      {!location && !permissionDenied && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <MapPin className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Enable Location</h3>
          <p className="text-gray-400 mb-6">
            We need your location to show you events happening nearby
          </p>
          <button
            onClick={requestLocation}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Getting location...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Find Events Near Me
              </span>
            )}
          </button>
        </div>
      )}

      {/* Permission Denied */}
      {permissionDenied && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-sm text-gray-400 mb-4">
            To use this feature, please:
            <br />1. Click the location icon in your browser's address bar
            <br />2. Allow location access for this site
            <br />3. Refresh the page
          </p>
          <button
            onClick={requestLocation}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Error */}
      {error && !permissionDenied && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Events List */}
      {location && events.length > 0 && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Found {events.length} active {events.length === 1 ? 'event' : 'events'} near you
          </p>
          
          {events.map((event) => (
            <div
              key={event.eventId}
              onClick={() => onSelectEvent(event)}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{event.djName}</h3>
                  <p className="text-gray-400">{event.venueName}</p>
                  {event.venueAddress && (
                    <p className="text-sm text-gray-500">{event.venueAddress}</p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                    LIVE NOW
                  </span>
                  {event.distance !== undefined && (
                    <span className="flex items-center gap-1 text-purple-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      {formatDistance(event.distance)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {getTimeRemaining(event.endTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  Taking requests
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Events */}
      {location && events.length === 0 && !loading && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Events Nearby</h3>
          <p className="text-gray-400 mb-4">
            There are no active events within 1km of your location
          </p>
          <button
            onClick={() => fetchNearbyEvents(location.lat, location.lng)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

// QR Code Scanner Component (for mobile)
interface QRCodeScannerProps {
  onScan: (eventId: string) => void;
  onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan: _onScan, // TODO: Integrate actual QR scanner library
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <h2 className="text-white font-bold">Scan QR Code</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="w-64 h-64 border-4 border-purple-500 rounded-lg relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-400"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-400"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-400"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-400"></div>
        </div>
        
        {/* TODO: Integrate actual QR scanner library */}
        <div className="absolute bottom-20 text-center">
          <p className="text-white text-sm">Position QR code within frame</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 p-6">
        <p className="text-gray-400 text-sm text-center">
          Point your camera at the QR code displayed at the DJ booth
        </p>
      </div>
    </div>
  );
};
