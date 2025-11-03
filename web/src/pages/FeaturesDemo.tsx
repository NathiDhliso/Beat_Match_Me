import React, { useState } from 'react';
import {
  ContextualThemeProvider,
  EventTypeIndicator,
  WeatherIntegration,
  TipPoolSystem,
  VibeSaverAction,
  GestureGuardrails,
  HoldToConfirm,
  ProfileAuraRing,
  RequestTrailEffect,
  VIPRequestEntrance,
} from '../components/AdvancedFeatures';
import type { EventType, WeatherCondition, UserTier } from '../components/AdvancedFeatures';
import {
  DidYouKnowCard,
  GenreDeepDive,
  DJTips,
  EventStoryMode,
  VenueConsistencyProfile,
} from '../components/EducationalFeatures';
import type { EventContribution } from '../components/EducationalFeatures';
import { Sparkles, Settings } from 'lucide-react';

export const FeaturesDemo: React.FC = () => {
  // Theme & Weather
  const [eventType, setEventType] = useState<EventType>('club');
  const [weather, setWeather] = useState<WeatherCondition>('clear');
  const [userTier, setUserTier] = useState<UserTier>('gold');
  
  // UI State
  const [showGesture, setShowGesture] = useState(false);
  const [showVIPEntrance, setShowVIPEntrance] = useState(false);
  const [showTrailEffect, setShowTrailEffect] = useState(false);
  
  // Tip Pool State
  const [tipPoolBalance, setTipPoolBalance] = useState(250);
  const [tipPoolContributions, setTipPoolContributions] = useState(1500);
  const [tipPoolBeneficiaries] = useState(45);
  
  // Vibe Saver State
  const [vibeSaverSong] = useState({
    title: 'Midnight City',
    artist: 'M83',
    currentBoost: 35,
    targetBoost: 50,
    contributors: 12,
  });
  
  // Mock Data
  const mockContributions: EventContribution[] = [
    {
      id: '1',
      userId: 'u1',
      userName: 'Sarah Johnson',
      type: 'request',
      songTitle: 'Blinding Lights',
      songArtist: 'The Weeknd',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      impact: 85,
    },
    {
      id: '2',
      userId: 'u2',
      userName: 'Mike Chen',
      type: 'upvote',
      songTitle: 'Levitating',
      songArtist: 'Dua Lipa',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      impact: 65,
    },
    {
      id: '3',
      userId: 'u3',
      userName: 'Emma Davis',
      type: 'dedication',
      songTitle: 'Perfect',
      songArtist: 'Ed Sheeran',
      message: 'For my amazing partner on our anniversary!',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      impact: 95,
    },
    {
      id: '4',
      userId: 'u4',
      userName: 'Alex Rodriguez',
      type: 'tip',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      impact: 50,
    },
  ];

  return (
    <ContextualThemeProvider eventType={eventType}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <WeatherIntegration condition={weather} />
        
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">BeatMatchMe Features Demo</h1>
                  <p className="text-gray-600">Phase 16 - Final 25% Complete</p>
                </div>
              </div>
              <Settings className="w-6 h-6 text-gray-400" />
            </div>
            
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="wedding">Wedding</option>
                  <option value="club">Club</option>
                  <option value="festival">Festival</option>
                  <option value="corporate">Corporate</option>
                  <option value="birthday">Birthday</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weather</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value as WeatherCondition)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="clear">Clear</option>
                  <option value="rain">Rain</option>
                  <option value="storm">Storm</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="snow">Snow</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">User Tier</label>
                <select
                  value={userTier}
                  onChange={(e) => setUserTier(e.target.value as UserTier)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Event Type Indicator */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contextual Theme Shifts</h2>
            <EventTypeIndicator eventType={eventType} venueName="The Grand Ballroom" />
          </section>
          
          {/* Profile Aura Ring */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Visual Status Markers</h2>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-6 mb-6">
                <ProfileAuraRing tier={userTier} size="lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl">
                    JD
                  </div>
                </ProfileAuraRing>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">John Doe</h3>
                  <p className="text-gray-600">Current Tier: <span className="font-semibold capitalize">{userTier}</span></p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowTrailEffect(!showTrailEffect)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                >
                  {showTrailEffect ? 'Hide' : 'Show'} Request Trail Effect
                </button>
                
                <button
                  onClick={() => setShowVIPEntrance(true)}
                  className="ml-4 px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  Trigger VIP Entrance
                </button>
              </div>
              
              <div className="relative mt-6 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <RequestTrailEffect tier={userTier} isActive={showTrailEffect} />
                <p className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Request Queue Visualization
                </p>
              </div>
            </div>
          </section>
          
          {/* Tip Pool & Vibe Saver */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Community Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TipPoolSystem
                currentBalance={tipPoolBalance}
                totalContributions={tipPoolContributions}
                beneficiaries={tipPoolBeneficiaries}
                onContribute={(amount) => {
                  setTipPoolBalance(prev => prev + amount);
                  setTipPoolContributions(prev => prev + amount);
                }}
              />
              
              <VibeSaverAction
                song={vibeSaverSong}
                onBoost={(amount) => {
                  console.log(`Boosted with R${amount}`);
                }}
              />
            </div>
          </section>
          
          {/* UI Stability Features */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">UI Stability Features</h2>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gesture Guardrails (Swipe from edges)
                  </label>
                  <button
                    onClick={() => setShowGesture(!showGesture)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    {showGesture ? 'Hide' : 'Show'} Guardrails
                  </button>
                  <GestureGuardrails position="left" isActive={showGesture} />
                  <GestureGuardrails position="right" isActive={showGesture} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hold-to-Confirm (Critical Actions)
                  </label>
                  <div className="flex gap-4">
                    <HoldToConfirm
                      label="Delete Request"
                      variant="danger"
                      onConfirm={() => alert('Request deleted!')}
                    />
                    <HoldToConfirm
                      label="Confirm Payment"
                      variant="success"
                      onConfirm={() => alert('Payment confirmed!')}
                      duration={1500}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Educational Features */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Educational Moments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DidYouKnowCard
                song={{
                  title: 'Bohemian Rhapsody',
                  artist: 'Queen',
                  year: 1975,
                  fact: 'This epic rock opera took 3 weeks to record and features over 180 vocal overdubs!',
                  trivia: 'Freddie Mercury refused to explain what the song was about, saying everyone should interpret it their own way.',
                }}
              />
              
              <VenueConsistencyProfile
                venueName="The Blue Room"
                topGenres={[
                  { genre: 'Electronic', percentage: 45 },
                  { genre: 'Hip Hop', percentage: 30 },
                  { genre: 'Pop', percentage: 25 },
                ]}
                successfulSongs={[
                  { title: 'One More Time', artist: 'Daft Punk', playCount: 23 },
                  { title: 'Levels', artist: 'Avicii', playCount: 19 },
                  { title: 'Titanium', artist: 'David Guetta', playCount: 17 },
                ]}
                bestTimes={[
                  { timeRange: '9PM-11PM', vibe: 'Warm-up Vibes' },
                  { timeRange: '11PM-1AM', vibe: 'Peak Energy' },
                  { timeRange: '1AM-3AM', vibe: 'Deep House' },
                ]}
                recommendations={[
                  'Electronic music performs 45% better here',
                  'Peak energy hits around midnight',
                  'Crowd loves classic house remixes',
                ]}
              />
            </div>
          </section>
          
          {/* Genre Deep-Dive */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Genre Deep-Dive</h2>
            <GenreDeepDive
              genre="Electronic Dance Music"
              description="EDM is a broad range of percussive electronic music genres made largely for nightclubs, raves, and festivals. It's characterized by strong beats, synthesizers, and is designed to be mixed by DJs."
              keyArtists={['Daft Punk', 'Calvin Harris', 'Avicii', 'Deadmau5', 'Skrillex', 'Martin Garrix']}
              characteristics={['Strong 4/4 beat', 'Synthesizers', 'Build-ups & drops', 'High energy', 'Repetitive hooks']}
              popularSongs={[
                { title: 'Levels', artist: 'Avicii' },
                { title: 'Animals', artist: 'Martin Garrix' },
                { title: 'Titanium', artist: 'David Guetta ft. Sia' },
                { title: 'Wake Me Up', artist: 'Avicii' },
              ]}
            />
          </section>
          
          {/* DJ Tips */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">DJ Insights</h2>
            <DJTips
              insights={[
                {
                  type: 'transition',
                  title: 'Perfect Transition Opportunity',
                  description: 'Your crowd loves transitions between Pop and Electronic. Try mixing Dua Lipa into Calvin Harris.',
                  impact: 'high',
                },
                {
                  type: 'crowd',
                  title: 'Crowd Energy Pattern',
                  description: 'Energy peaks around 11:30 PM. Save your biggest tracks for that window.',
                  impact: 'high',
                },
                {
                  type: 'timing',
                  title: 'Request Timing',
                  description: 'Requests spike 30 minutes after doors open. Prepare your opening set accordingly.',
                  impact: 'medium',
                },
                {
                  type: 'genre',
                  title: 'Genre Balance',
                  description: 'You\'re playing 60% Electronic. Consider mixing in more Hip Hop for variety.',
                  impact: 'medium',
                },
              ]}
            />
          </section>
          
          {/* Event Story Mode */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Story Mode</h2>
            <EventStoryMode
              eventName="Saturday Night at The Blue Room"
              contributions={mockContributions}
              totalEnergy={78}
              peakMoment={{
                time: new Date(Date.now() - 1000 * 60 * 30),
                description: 'The dance floor erupted when "Blinding Lights" dropped!',
              }}
            />
          </section>
        </div>
        
        {/* VIP Entrance Modal */}
        {showVIPEntrance && (
          <VIPRequestEntrance
            tier="platinum"
            songTitle="Starboy - The Weeknd"
            onComplete={() => setShowVIPEntrance(false)}
          />
        )}
      </div>
    </ContextualThemeProvider>
  );
};

export default FeaturesDemo;
