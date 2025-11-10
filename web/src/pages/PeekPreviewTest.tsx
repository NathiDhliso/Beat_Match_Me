import React from 'react';
import { GestureHandler } from '../components/OrbitalInterface';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Simple Peek Preview Test Page
 * Demonstrates the swipe gesture animations
 * 
 * Usage:
 * - Swipe LEFT to peek at "Previous Page"
 * - Swipe RIGHT to peek at "Next Page"  
 * - Swipe UP to peek at "Top Section"
 * - Swipe DOWN to peek at "Bottom Section"
 */
export function PeekPreviewTest() {
  const [currentPage, setCurrentPage] = React.useState('Home');
  const [swipeCount, setSwipeCount] = React.useState(0);

  const handleSwipeLeft = () => {
    setCurrentPage('Previous Page');
    setSwipeCount(c => c + 1);
  };

  const handleSwipeRight = () => {
    setCurrentPage('Next Page');
    setSwipeCount(c => c + 1);
  };

  const handleSwipeUp = () => {
    setCurrentPage('Top Section');
    setSwipeCount(c => c + 1);
  };

  const handleSwipeDown = () => {
    setCurrentPage('Bottom Section');
    setSwipeCount(c => c + 1);
  };

  return (
    <GestureHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onSwipeUp={handleSwipeUp}
      onSwipeDown={handleSwipeDown}
      peekContent={{
        left: (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <ArrowLeft className="w-32 h-32 text-white animate-bounce" />
            <h2 className="text-white text-5xl font-black">← Previous Page</h2>
            <p className="text-white/80 text-2xl">Swipe left to navigate</p>
          </div>
        ),
        right: (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <ArrowRight className="w-32 h-32 text-white animate-bounce" />
            <h2 className="text-white text-5xl font-black">Next Page →</h2>
            <p className="text-white/80 text-2xl">Swipe right to navigate</p>
          </div>
        ),
        up: (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <ArrowUp className="w-32 h-32 text-white animate-bounce" />
            <h2 className="text-white text-5xl font-black">↑ Top Section</h2>
            <p className="text-white/80 text-2xl">Swipe up to navigate</p>
          </div>
        ),
        down: (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <ArrowDown className="w-32 h-32 text-white animate-bounce" />
            <h2 className="text-white text-5xl font-black">Bottom Section ↓</h2>
            <p className="text-white/80 text-2xl">Swipe down to navigate</p>
          </div>
        ),
      }}
    >
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white mb-4">
            🎵 Peek Preview Test
          </h1>
          <p className="text-2xl text-white/80">
            Try swiping in any direction!
          </p>
        </div>

        {/* Current Page Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 mb-12 border-4 border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="text-white/60 text-xl mb-2">Current Page:</div>
            <div className="text-white text-5xl font-black mb-6">{currentPage}</div>
            <div className="text-white/60 text-xl">
              Total Swipes: <span className="text-white font-bold">{swipeCount}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl">
          <div className="bg-blue-500/20 backdrop-blur-md rounded-2xl p-6 text-center border-2 border-blue-400/40">
            <ArrowLeft className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <div className="text-white font-bold text-lg">Swipe Left</div>
            <div className="text-white/60 text-sm mt-2">Previous</div>
          </div>

          <div className="bg-pink-500/20 backdrop-blur-md rounded-2xl p-6 text-center border-2 border-pink-400/40">
            <ArrowRight className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            <div className="text-white font-bold text-lg">Swipe Right</div>
            <div className="text-white/60 text-sm mt-2">Next</div>
          </div>

          <div className="bg-green-500/20 backdrop-blur-md rounded-2xl p-6 text-center border-2 border-green-400/40">
            <ArrowUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <div className="text-white font-bold text-lg">Swipe Up</div>
            <div className="text-white/60 text-sm mt-2">Top</div>
          </div>

          <div className="bg-yellow-500/20 backdrop-blur-md rounded-2xl p-6 text-center border-2 border-yellow-400/40">
            <ArrowDown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <div className="text-white font-bold text-lg">Swipe Down</div>
            <div className="text-white/60 text-sm mt-2">Bottom</div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 text-center max-w-2xl">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-white text-2xl font-bold mb-3">💡 Tips</h3>
            <ul className="text-white/80 text-left space-y-2">
              <li>• <strong>Peek Preview:</strong> Drag slowly to see the next page sliding in</li>
              <li>• <strong>Quick Swipe:</strong> Swipe fast to navigate immediately</li>
              <li>• <strong>Threshold:</strong> Swipe at least 100px to trigger navigation</li>
              <li>• <strong>Visual Feedback:</strong> Watch for the colorful gradient and progress %</li>
            </ul>
          </div>
        </div>

        {/* Debug Console Helper */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              // @ts-expect-error - debugLogger is added to window at runtime
              if (window.debugLogger) {
                // @ts-expect-error - debugLogger is added to window at runtime
                window.debugLogger.setLevel('info');
                alert('✅ Debug logging enabled! Check console for swipe events.');
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg"
          >
            🔍 Enable Debug Logs
          </button>
          <p className="text-white/60 text-sm mt-3">
            Open browser console to see detailed swipe tracking
          </p>
        </div>
      </div>
    </GestureHandler>
  );
}
