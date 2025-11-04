/**
 * Tier Modal - Shows tier benefits and encourages upgrades
 * Aligned with value proposition: Revenue & Transparency
 */

import React from 'react';
import { X, Crown, Star, Award, Zap, TrendingUp, Shield } from 'lucide-react';

interface TierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

interface TierInfo {
  name: string;
  color: string;
  icon: React.ReactNode;
  benefits: string[];
  price: string;
  gradient: string;
  textColor: string;
  borderColor: string;
}

const TIERS: Record<string, TierInfo> = {
  BRONZE: {
    name: 'Bronze',
    color: 'from-amber-700 to-amber-900',
    icon: <Award className="w-8 h-8" />,
    benefits: [
      'Make song requests',
      'Standard queue position',
      'Basic request history',
      'Fair-play promise protection',
    ],
    price: 'Free',
    gradient: 'bg-gradient-to-br from-amber-700 to-amber-900',
    textColor: 'text-amber-700 dark:text-amber-500',
    borderColor: 'border-amber-700 dark:border-amber-500',
  },
  SILVER: {
    name: 'Silver',
    color: 'from-gray-400 to-gray-600',
    icon: <Star className="w-8 h-8" />,
    benefits: [
      'All Bronze benefits',
      'Priority request processing',
      '10% discount on spotlight slots',
      'Request history & favorites',
      'Early access to new features',
    ],
    price: 'R99/month',
    gradient: 'bg-gradient-to-br from-gray-400 to-gray-600',
    textColor: 'text-gray-500 dark:text-gray-400',
    borderColor: 'border-gray-500 dark:border-gray-400',
  },
  GOLD: {
    name: 'Gold',
    color: 'from-yellow-400 to-yellow-600',
    icon: <Crown className="w-8 h-8" />,
    benefits: [
      'All Silver benefits',
      'Higher queue priority',
      '20% discount on spotlight slots',
      'Unlimited request history',
      'VIP badge on requests',
      'Skip the line 2x per event',
    ],
    price: 'R199/month',
    gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    textColor: 'text-yellow-600 dark:text-yellow-500',
    borderColor: 'border-yellow-600 dark:border-yellow-500',
  },
  PLATINUM: {
    name: 'Platinum',
    color: 'from-slate-300 to-slate-500',
    icon: <Zap className="w-8 h-8" />,
    benefits: [
      'All Gold benefits',
      'Highest queue priority',
      '30% discount on spotlight slots',
      'Guaranteed play (1 per event)',
      'Platinum VIP badge',
      'Direct message to DJ',
      'Exclusive events access',
    ],
    price: 'R399/month',
    gradient: 'bg-gradient-to-br from-slate-300 to-slate-500',
    textColor: 'text-slate-400 dark:text-slate-300',
    borderColor: 'border-slate-400 dark:border-slate-300',
  },
};

export const TierModal: React.FC<TierModalProps> = ({ isOpen, onClose, currentTier }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-primary">Membership Tiers</h2>
            <p className="text-secondary mt-1">Unlock more benefits as you upgrade</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-tertiary" />
          </button>
        </div>

        {/* Tiers Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(TIERS).map(([tierKey, tier]) => {
            const isCurrent = tierKey === currentTier;
            const tierIndex = Object.keys(TIERS).indexOf(tierKey);
            const currentIndex = Object.keys(TIERS).indexOf(currentTier);
            const isUpgrade = tierIndex > currentIndex;

            return (
              <div
                key={tierKey}
                className={`relative rounded-xl p-6 border-2 transition-all ${
                  isCurrent
                    ? `${tier.borderColor} bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900`
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50'
                } ${isUpgrade ? 'hover:scale-105 cursor-pointer' : ''}`}
              >
                {/* Current Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    Current
                  </div>
                )}

                {/* Tier Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${tier.gradient} p-3 rounded-lg text-white`}>
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${tier.textColor}`}>{tier.name}</h3>
                    <p className="text-lg font-semibold text-primary">{tier.price}</p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  {tier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-secondary text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                {isUpgrade && (
                  <button
                    className={`mt-6 w-full ${tier.gradient} text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Upgrade to {tier.name}
                  </button>
                )}

                {isCurrent && (
                  <div className="mt-6 w-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold py-3 rounded-lg text-center">
                    Your Current Tier
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-start gap-3 text-sm text-secondary">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-primary">Fair-Play Promise:</strong> All tiers include our money-back guarantee. 
              If the DJ vetoes your request, you get an instant automatic refund. Higher tiers get priority, 
              but everyone gets fairness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
