/**
 * Payment Access Component
 * How audiences discover and access the payment/request page
 * Options: QR Code scan, Direct link, or Event discovery
 */

import React, { useState } from 'react';
import { QrCode, Link as LinkIcon, Search, Smartphone, ArrowRight, Copy, CheckCircle } from 'lucide-react';

interface PaymentAccessProps {
  eventId: string;
  setId: string;
  djName: string;
  venueName: string;
  qrCodeUrl?: string;
  directLink?: string;
}

export const PaymentAccess: React.FC<PaymentAccessProps> = ({
  eventId,
  setId,
  djName,
  venueName,
  qrCodeUrl,
  directLink,
}) => {
  const [copied, setCopied] = useState(false);
  
  // Generate URLs
  const eventUrl = directLink || `https://beatmatchme.com/event/${eventId}/set/${setId}`;
  const qrUrl = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Share Your Request Portal
        </h2>
        <p className="text-gray-400">
          Let your audience request songs easily - three simple ways
        </p>
      </div>

      {/* Three Access Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. QR Code (Primary for venues) */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Scan QR Code</h3>
          <p className="text-gray-400 text-sm mb-4">
            Display at your booth or venue
          </p>
          
          {/* QR Code Display */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <img 
              src={qrUrl} 
              alt="Event QR Code" 
              className="w-full h-auto"
            />
          </div>
          
          <button className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
            Download QR Code
          </button>
        </div>

        {/* 2. Direct Link (For social media) */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Share Link</h3>
          <p className="text-gray-400 text-sm mb-4">
            Post on socials or send directly
          </p>
          
          {/* Link Display */}
          <div className="bg-gray-900/50 rounded-xl p-3 mb-4">
            <p className="text-white text-sm truncate mb-3">
              {eventUrl}
            </p>
            <button
              onClick={copyLink}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Event Discovery (App feature) */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Discover Events</h3>
          <p className="text-gray-400 text-sm mb-4">
            Find events nearby in the app
          </p>
          
          <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 text-gray-300 text-sm mb-3">
              <Smartphone className="w-5 h-5 text-green-400" />
              <span>Open BeatMatchMe App</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
              <Search className="w-5 h-5 text-green-400" />
              <span>Search "{venueName}"</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Journey */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">What Happens Next?</h3>
        <div className="space-y-4">
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">
              1
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Access Portal</h4>
              <p className="text-gray-400 text-sm">
                User scans QR or clicks link to open {djName}'s request portal
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">
              2
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Browse & Select</h4>
              <p className="text-gray-400 text-sm">
                Search for their favorite song or browse your curated playlist
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">
              3
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Quick Payment</h4>
              <p className="text-gray-400 text-sm">
                Secure, one-tap payment with clear pricing (you earn 85%)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center flex-shrink-0 text-green-400 font-bold">
              ✓
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">In Queue</h4>
              <p className="text-gray-400 text-sm">
                Request appears in your queue instantly. Accept or skip as you wish.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Trust Indicators */}
      <div className="text-center">
        <div className="inline-flex items-center gap-6 bg-gray-800/30 rounded-full px-6 py-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Live Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Instant Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Simplified Payment Button for embedding
 * Can be placed on venue displays or social media
 */
interface QuickRequestButtonProps {
  eventId: string;
  setId: string;
  djName: string;
}

export const QuickRequestButton: React.FC<QuickRequestButtonProps> = ({
  eventId,
  setId,
  djName,
}) => {
  const eventUrl = `https://beatmatchme.com/event/${eventId}/set/${setId}`;
  
  return (
    <a
      href={eventUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
    >
      <span className="text-2xl">🎵</span>
      <div className="text-left">
        <div className="text-xs opacity-80">Request a song for</div>
        <div className="text-lg">{djName}</div>
      </div>
      <ArrowRight className="w-5 h-5" />
    </a>
  );
};
