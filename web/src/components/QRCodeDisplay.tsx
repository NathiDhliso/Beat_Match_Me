import React, { useEffect, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  eventId: string;
  venueName: string;
  onClose: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ eventId, venueName, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        setError('');
        const deepLink = `beatmatchme://event/${eventId}`;
        console.log('Generating QR code for:', deepLink);
        
        const url = await QRCode.toDataURL(deepLink, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        console.log('QR code generated successfully');
        setQrCodeUrl(url);
      } catch (err) {
        console.error('QR code generation failed:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [eventId]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${venueName}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-3xl border border-white/10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Event QR Code</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 mb-6 min-h-[400px] flex items-center justify-center">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600 mb-2">❌ {error}</p>
              <p className="text-gray-600 text-sm">Event ID: {eventId}</p>
            </div>
          ) : qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Event QR Code" className="w-full" />
          ) : null}
        </div>

        {/* Info */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{venueName}</h3>
          <p className="text-gray-400 text-sm">Scan to join this event</p>
          <p className="text-gray-500 text-xs mt-2">Event ID: {eventId}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`beatmatchme://event/${eventId}`);
              alert('Event link copied to clipboard!');
            }}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};
