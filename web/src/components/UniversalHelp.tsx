/**
 * Universal Help System
 * Floating help button (?) with quick visual guides
 */

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpContent {
  djQuickStart: string[];
  fanQuickStart: string[];
  refundPolicy: string[];
}

const HELP_CONTENT: HelpContent = {
  djQuickStart: [
    '🎧 DJ QUICK START',
    '- Create event',
    '- Add songs',
    '- Go LIVE 🔴',
    '- Accept requests ✅',
    '- Play songs ▶️',
  ],
  fanQuickStart: [
    '🎵 REQUEST A SONG',
    '- Find event nearby',
    '- Pick your song',
    '- Pay with card 💳',
    '- Wait your turn',
    '- Song plays! 🎉',
  ],
  refundPolicy: [
    '💰 100% REFUND IF:',
    '- DJ vetoes your song',
    '- Technical issues',
    '- Event cancelled',
    '',
    '⏱️ Money back in 3-5 days',
    '🇿🇦 Secure Yoco payments',
  ],
};

type HelpMode = 'dj' | 'fan' | 'both';

interface UniversalHelpProps {
  mode?: HelpMode;
  className?: string;
}

export const UniversalHelp: React.FC<UniversalHelpProps> = ({ 
  mode = 'both',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quickstart' | 'refund'>('quickstart');

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center ${className}`}
        aria-label="Help"
        style={{
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(147, 51, 234, 0.3)',
        }}
      >
        <HelpCircle className="w-7 h-7" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-gray-700 animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Quick Help</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close help"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 bg-gray-800/50">
              <button
                onClick={() => setActiveTab('quickstart')}
                className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                  activeTab === 'quickstart'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🚀 Quick Start
              </button>
              <button
                onClick={() => setActiveTab('refund')}
                className={`flex-1 py-3 px-4 font-semibold transition-colors ${
                  activeTab === 'refund'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                💰 Refund Policy
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'quickstart' && (
                <div className="space-y-6">
                  {/* DJ Guide */}
                  {(mode === 'dj' || mode === 'both') && (
                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-5 border border-purple-500/30">
                      {HELP_CONTENT.djQuickStart.map((line, index) => (
                        <p
                          key={index}
                          className={`${
                            index === 0
                              ? 'text-lg font-bold text-purple-300 mb-3'
                              : 'text-white mb-2'
                          }`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Fan Guide */}
                  {(mode === 'fan' || mode === 'both') && (
                    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-5 border border-blue-500/30">
                      {HELP_CONTENT.fanQuickStart.map((line, index) => (
                        <p
                          key={index}
                          className={`${
                            index === 0
                              ? 'text-lg font-bold text-blue-300 mb-3'
                              : 'text-white mb-2'
                          }`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'refund' && (
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-5 border border-green-500/30">
                  {HELP_CONTENT.refundPolicy.map((line, index) => (
                    <p
                      key={index}
                      className={`${
                        index === 0
                          ? 'text-lg font-bold text-green-300 mb-3'
                          : line === ''
                          ? 'mb-3'
                          : 'text-white mb-2'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-800/50 p-4 text-center border-t border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all"
              >
                Got it! 👍
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Inline Help Badge (for Login/Signup)
 * Small badge with popup
 */
interface HelpBadgeProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export const HelpBadge: React.FC<HelpBadgeProps> = ({ 
  title, 
  icon = '?',
  children, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Badge Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-full shadow-sm hover:scale-105 transition-all group"
        aria-label={`Help: ${title}`}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold text-green-300">{title}</span>
        <HelpCircle className="w-3 h-3 text-green-400 group-hover:animate-pulse" />
      </button>

      {/* Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup Content */}
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-4 animate-scale-in">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-bold text-green-300">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="text-xs text-white space-y-2">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
