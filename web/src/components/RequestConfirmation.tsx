import React, { useState } from 'react';
import { Music, Clock, Heart, MessageSquare, Zap } from 'lucide-react';
import { HoldToConfirm } from './AdvancedFeatures';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  albumArt?: string;
}

interface RequestConfirmationProps {
  song: Song;
  basePrice: number;
  queuePosition?: number;
  estimatedWaitMinutes?: number;
  spotlightSlotsAvailable?: number;
  onConfirm: (requestData: RequestData) => void;
  onCancel: () => void;
}

export interface RequestData {
  songId: string;
  requestType: 'standard' | 'spotlight' | 'group';
  dedication?: string;
  shoutout?: string;
  totalPrice: number;
}

export const RequestConfirmation: React.FC<RequestConfirmationProps> = ({
  song,
  basePrice,
  queuePosition = 0,
  estimatedWaitMinutes = 15,
  spotlightSlotsAvailable = 0,
  onConfirm,
  onCancel,
}) => {
  const [requestType, setRequestType] = useState<'standard' | 'spotlight' | 'group'>('standard');
  const [dedication, setDedication] = useState('');
  const [shoutout, setShoutout] = useState('');
  const [showDedication, setShowDedication] = useState(false);
  const [showShoutout, setShowShoutout] = useState(false);

  const DEDICATION_PRICE = 10;
  const SHOUTOUT_PRICE = 15;
  const SPOTLIGHT_MULTIPLIER = 2.5;

  const calculateTotal = () => {
    let total = basePrice;
    
    if (requestType === 'spotlight') {
      total *= SPOTLIGHT_MULTIPLIER;
    }
    
    if (showDedication && dedication.trim()) {
      total += DEDICATION_PRICE;
    }
    
    if (showShoutout && shoutout.trim()) {
      total += SHOUTOUT_PRICE;
    }
    
    return total;
  };

  const handleConfirm = () => {
    const requestData: RequestData = {
      songId: song.id,
      requestType,
      dedication: showDedication && dedication.trim() ? dedication : undefined,
      shoutout: showShoutout && shoutout.trim() ? shoutout : undefined,
      totalPrice: calculateTotal(),
    };
    
    onConfirm(requestData);
  };

  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Confirm Request</h1>
        </div>

        {/* Song Details */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            {song.albumArt ? (
              <img src={song.albumArt} alt={song.title} className="w-20 h-20 rounded-lg" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{song.title}</h2>
              <p className="text-gray-400">{song.artist}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {song.genre}
              </span>
            </div>
          </div>

          {/* Queue Info */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Estimated Wait</span>
              </div>
              <p className="text-xl font-bold text-white">~{estimatedWaitMinutes} min</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Music className="w-4 h-4" />
                <span className="text-sm">Queue Position</span>
              </div>
              <p className="text-xl font-bold text-white">#{queuePosition}</p>
            </div>
          </div>
        </div>

        {/* Request Type Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Request Type</h3>
          <div className="space-y-3">
            {/* Standard Request */}
            <button
              onClick={() => setRequestType('standard')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                requestType === 'standard'
                  ? 'bg-purple-500 text-white ring-2 ring-purple-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Standard Request</p>
                  <p className="text-sm opacity-80">Normal queue position</p>
                </div>
                <p className="text-xl font-bold">R{basePrice}</p>
              </div>
            </button>

            {/* Spotlight Slot */}
            {spotlightSlotsAvailable > 0 && (
              <button
                onClick={() => setRequestType('spotlight')}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  requestType === 'spotlight'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white ring-2 ring-yellow-400'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <p className="font-bold">Spotlight Slot</p>
                    </div>
                    <p className="text-sm opacity-80">Jump to front of queue</p>
                    <p className="text-xs mt-1 opacity-70">{spotlightSlotsAvailable} of 3 left this block</p>
                  </div>
                  <p className="text-xl font-bold">R{Math.round(basePrice * SPOTLIGHT_MULTIPLIER)}</p>
                </div>
              </button>
            )}

            {/* Group Request */}
            <button
              onClick={() => setRequestType('group')}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                requestType === 'group'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ring-2 ring-blue-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Group Request</p>
                  <p className="text-sm opacity-80">Split cost with friends</p>
                </div>
                <p className="text-sm font-semibold">Split →</p>
              </div>
            </button>
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Add-ons</h3>
          
          {/* Dedication */}
          <div className="mb-3">
            <label className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-750 transition-all">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showDedication}
                  onChange={(e) => setShowDedication(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="font-semibold text-white">Add Dedication</span>
                  </div>
                  <p className="text-sm text-gray-400">Personal message (140 characters)</p>
                </div>
              </div>
              <span className="text-white font-bold">+R{DEDICATION_PRICE}</span>
            </label>
            {showDedication && (
              <textarea
                value={dedication}
                onChange={(e) => setDedication(e.target.value.slice(0, 140))}
                placeholder="Write your dedication..."
                className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            )}
            {showDedication && (
              <p className="text-xs text-gray-500 mt-1 text-right">{dedication.length}/140</p>
            )}
          </div>

          {/* Shoutout */}
          <div>
            <label className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-750 transition-all">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showShoutout}
                  onChange={(e) => setShowShoutout(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-white">Add Shout-out</span>
                  </div>
                  <p className="text-sm text-gray-400">Public announcement (60 characters)</p>
                </div>
              </div>
              <span className="text-white font-bold">+R{SHOUTOUT_PRICE}</span>
            </label>
            {showShoutout && (
              <input
                type="text"
                value={shoutout}
                onChange={(e) => setShoutout(e.target.value.slice(0, 60))}
                placeholder="Your shout-out..."
                className="w-full mt-2 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
            {showShoutout && (
              <p className="text-xs text-gray-500 mt-1 text-right">{shoutout.length}/60</p>
            )}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Price Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>Base price ({requestType})</span>
              <span>R{requestType === 'spotlight' ? Math.round(basePrice * SPOTLIGHT_MULTIPLIER) : basePrice}</span>
            </div>
            {showDedication && dedication.trim() && (
              <div className="flex justify-between text-gray-300">
                <span>Dedication</span>
                <span>+R{DEDICATION_PRICE}</span>
              </div>
            )}
            {showShoutout && shoutout.trim() && (
              <div className="flex justify-between text-gray-300">
                <span>Shout-out</span>
                <span>+R{SHOUTOUT_PRICE}</span>
              </div>
            )}
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between text-white text-xl font-bold">
                <span>Total</span>
                <span>R{totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <HoldToConfirm
          label="Hold to Confirm Request"
          variant="success"
          onConfirm={handleConfirm}
          duration={2000}
        />
      </div>
    </div>
  );
};
