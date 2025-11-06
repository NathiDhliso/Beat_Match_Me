/**
 * Analytics Card Component
 * Phase 9: Analytics Mini-Dashboard
 * Compact analytics display for DJ Portal showing key metrics
 */

import React from 'react';
import { TrendingUp, Music, DollarSign } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsCardProps {
  requestsToday: number;
  revenue: number;
  topSong?: {
    title: string;
    artist: string;
    requestCount: number;
  };
  compact?: boolean;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  requestsToday,
  revenue,
  topSong,
  compact = false,
}) => {
  const { currentTheme } = useTheme();

  if (compact) {
    return (
      <div
        className="rounded-xl p-4 border"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.primary}15, ${currentTheme.accent}15)`,
          borderColor: `${currentTheme.primary}30`,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Requests Today */}
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.primary}33` }}
            >
              <Music className="w-5 h-5" style={{ color: currentTheme.accent }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{requestsToday}</p>
              <p className="text-xs text-gray-400">Requests</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgb(34 197 94 / 0.2)' }}
            >
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">R{revenue.toFixed(0)}</p>
              <p className="text-xs text-gray-400">Revenue</p>
            </div>
          </div>

          {/* Top Song (if available) */}
          {topSong && (
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgb(234 179 8 / 0.2)' }}
              >
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{topSong.title}</p>
                <p className="text-xs text-gray-400 truncate">
                  {topSong.requestCount}x requests
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full card version
  return (
    <div
      className="rounded-2xl p-6 border-2"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.primary}10, ${currentTheme.accent}10)`,
        borderColor: `${currentTheme.primary}40`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Today's Stats</h3>
        <div
          className="px-3 py-1 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: `${currentTheme.primary}33`,
            color: currentTheme.accent,
          }}
        >
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Requests Today */}
        <div
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: `${currentTheme.primary}08`,
            borderColor: `${currentTheme.primary}20`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentTheme.primary}33` }}
            >
              <Music className="w-6 h-6" style={{ color: currentTheme.accent }} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Requests</p>
              <p className="text-3xl font-bold text-white">{requestsToday}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Songs requested today</p>
        </div>

        {/* Revenue */}
        <div
          className="rounded-xl p-4 border bg-green-500/5"
          style={{ borderColor: 'rgb(34 197 94 / 0.2)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgb(34 197 94 / 0.2)' }}
            >
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Revenue</p>
              <p className="text-3xl font-bold text-green-400">R{revenue.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Total earnings today</p>
        </div>

        {/* Top Song */}
        {topSong ? (
          <div
            className="rounded-xl p-4 border bg-yellow-500/5"
            style={{ borderColor: 'rgb(234 179 8 / 0.2)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgb(234 179 8 / 0.2)' }}
              >
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-400">Top Request</p>
                <p className="text-lg font-bold text-white truncate">{topSong.title}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {topSong.artist} • {topSong.requestCount} requests
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl p-4 border bg-gray-500/5"
            style={{ borderColor: 'rgb(107 114 128 / 0.2)' }}
          >
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">No requests yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
