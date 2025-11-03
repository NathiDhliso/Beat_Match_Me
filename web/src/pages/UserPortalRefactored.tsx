import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Music, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '../components/DarkModeTheme';

/**
 * REFACTORED USER PORTAL
 * Uses centralized CSS variables from theme.css
 * Clean, maintainable, easy to update
 */

export const UserPortalRefactored: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="gradient-bg min-h-screen">
      {/* Header - Uses CSS variables */}
      <header className="header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Music className="w-8 h-8 icon-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary gradient-title bg-clip-text text-transparent">
                BeatMatchMe
              </h1>
              <p className="text-sm text-secondary">Welcome, {user?.name}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Badge */}
            <div className="badge flex items-center gap-2">
              <User className="w-4 h-4 icon-primary" />
              <span className="text-sm font-semibold">{user?.tier}</span>
            </div>

            {/* Logout Button */}
            <button onClick={handleLogout} className="btn flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Status Card */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">The Blue Room</h2>
          <p className="text-secondary">DJ: DJ Awesome</p>
          <button className="btn mt-4 bg-green-500 hover:bg-green-600 text-white border-green-600">
            Now Playing!
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Your Song Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-secondary font-semibold">Your Song</span>
              <span className="text-primary font-bold text-lg">~4 min</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-tertiary">Position:</span>
              <span className="text-primary font-semibold">3 of 12</span>
            </div>
            <div className="mt-3 h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full gradient-platinum" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Trendsetter Score Card */}
          <div className="card gradient-card">
            <div className="text-center">
              <div className="text-tertiary text-sm mb-1">Trendsetter Score</div>
              <div className="text-4xl font-bold text-primary mb-1">#15</div>
              <div className="text-sm text-secondary">Rank</div>
              <div className="mt-3 text-2xl font-bold text-accent">94%</div>
              <div className="text-xs text-tertiary">Percentile</div>
            </div>
          </div>

          {/* Karma Points Card */}
          <div className="card">
            <div className="text-center">
              <div className="text-tertiary text-sm mb-1">Karma Points</div>
              <div className="text-4xl font-bold text-primary mb-1">150</div>
              <div className="text-sm text-secondary">100 to next tier</div>
              <div className="mt-3 h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-blue-500" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Peak Hype Card */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔥</span>
            <div>
              <h3 className="text-lg font-bold text-primary">Peak Hype</h3>
              <p className="text-sm text-secondary">Tonight's Collective Vibe</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">23</div>
              <div className="text-xs text-tertiary">Active</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">47</div>
              <div className="text-xs text-tertiary">Requests</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">🏠</div>
              <div className="text-xs text-tertiary">Top Genre</div>
            </div>
          </div>

          <p className="text-sm text-secondary mt-4 text-center">
            You and 22 others are building tonight's soundtrack
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="btn flex-1">
            Discover
          </button>
          <button className="btn flex-1">
            Make Request
          </button>
          <button className="btn flex-1">
            Social
          </button>
        </div>
      </div>
    </div>
  );
};
