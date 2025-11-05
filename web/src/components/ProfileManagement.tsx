import React, { useState } from 'react';
import { User, Camera, Music, DollarSign, Check, X, Edit2, Save } from 'lucide-react';

// Tier Information
export interface TierInfo {
  name: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  price: number;
  benefits: string[];
  color: string;
  icon: string;
}

export const TIER_DATA: Record<string, TierInfo> = {
  BRONZE: {
    name: 'BRONZE',
    price: 0,
    color: 'from-orange-700 to-orange-900',
    icon: '🥉',
    benefits: [
      'Basic request functionality',
      'Standard queue position',
      'Email notifications',
      'Request history (30 days)'
    ]
  },
  SILVER: {
    name: 'SILVER',
    price: 49,
    color: 'from-gray-400 to-gray-600',
    icon: '🥈',
    benefits: [
      'All Bronze benefits',
      'Priority queue placement',
      'Push notifications',
      'Request history (90 days)',
      'Early access to new features'
    ]
  },
  GOLD: {
    name: 'GOLD',
    price: 99,
    color: 'from-yellow-400 to-yellow-600',
    icon: '🥇',
    benefits: [
      'All Silver benefits',
      'VIP queue position',
      'Unlimited request history',
      'Dedicated support',
      'Custom profile badge',
      '10% discount on all requests'
    ]
  },
  PLATINUM: {
    name: 'PLATINUM',
    price: 199,
    color: 'from-purple-400 to-pink-600',
    icon: '💎',
    benefits: [
      'All Gold benefits',
      'Ultra-priority queue',
      'Personal DJ concierge',
      'Exclusive events access',
      'Custom profile themes',
      '20% discount on all requests',
      'Request guarantee (no veto)'
    ]
  }
};

// Tier Comparison Component
interface TierComparisonProps {
  currentTier: string;
  onUpgrade: (tier: string) => void;
}

export const TierComparison: React.FC<TierComparisonProps> = ({ currentTier, onUpgrade }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Tier Comparison</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(TIER_DATA).map((tier) => {
          const isCurrent = tier.name === currentTier;
          const isUpgrade = TIER_DATA[currentTier].price < tier.price;
          
          return (
            <div
              key={tier.name}
              className={`relative rounded-lg p-6 border-2 ${
                isCurrent 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              {/* Current Badge */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                  CURRENT
                </div>
              )}

              {/* Tier Icon & Name */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{tier.icon}</div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <div className="text-2xl font-bold text-white mt-2">
                  {tier.price === 0 ? 'FREE' : `R${tier.price}/mo`}
                </div>
              </div>

              {/* Benefits */}
              <ul className="space-y-2 mb-6">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {!isCurrent && isUpgrade && (
                <button
                  onClick={() => onUpgrade(tier.name)}
                  className={`w-full py-2 bg-gradient-to-r ${tier.color} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                >
                  Upgrade to {tier.name}
                </button>
              )}
              
              {isCurrent && (
                <div className="w-full py-2 bg-gray-700 text-gray-400 rounded-lg font-semibold text-center">
                  Your Current Tier
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// User Profile Screen
export interface UserProfileData {
  userId: string;
  name: string;
  email: string;
  photo?: string;
  tier: string;
  preferences?: {
    genres?: string[];
    notifications?: boolean;
  };
  stats?: {
    totalRequests: number;
    songsPlayed: number;
    totalSpent: number;
  };
}

interface UserProfileScreenProps {
  profile: UserProfileData;
  onUpdateProfile: (updates: Partial<UserProfileData>) => void;
  onUpgradeTier: (tier: string) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onUpgradeTier
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [showTierComparison, setShowTierComparison] = useState(false);

  const handleSave = () => {
    onUpdateProfile({ name: editedName });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="relative">
              {profile.photo ? (
                <img 
                  src={profile.photo} 
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(profile.name);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
                  <p className="text-gray-400 mb-3">{profile.email}</p>
                  
                  {/* Tier Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${TIER_DATA[profile.tier].color} rounded-full`}>
                    <span className="text-lg">{TIER_DATA[profile.tier].icon}</span>
                    <span className="text-white font-semibold">{profile.tier}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {profile.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{profile.stats.totalRequests}</div>
                  <div className="text-sm text-gray-400">Total Requests</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Check className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{profile.stats.songsPlayed}</div>
                  <div className="text-sm text-gray-400">Songs Played</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-white">R{profile.stats.totalSpent}</div>
                  <div className="text-sm text-gray-400">Total Spent</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tier Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Your Tier</h3>
            <button
              onClick={() => setShowTierComparison(!showTierComparison)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showTierComparison ? 'Hide' : 'Compare Tiers'}
            </button>
          </div>

          {showTierComparison && (
            <TierComparison
              currentTier={profile.tier}
              onUpgrade={onUpgradeTier}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// DJ Profile Screen (simplified version - similar structure)
export interface DJProfileData {
  userId: string;
  name: string;
  email: string;
  photo?: string;
  tier: string;
  bio?: string;
  genres: string[];
  basePrice: number;
  preferences?: {
    genres?: string[];
    notifications?: boolean;
  };
  stats?: {
    totalEvents: number;
    totalRevenue: number;
    averageRating: number;
  };
}

interface DJProfileScreenProps {
  profile: DJProfileData;
  onUpdateProfile: (updates: Partial<DJProfileData>) => void;
  onUpgradeTier: (tier: string) => void;
}

export const DJProfileScreen: React.FC<DJProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  // onUpgradeTier
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData] = useState({
    name: profile.name,
    bio: profile.bio || '',
    basePrice: profile.basePrice
  });

  const handleSave = () => {
    onUpdateProfile(editedData);
    setIsEditing(false);
  };
  
  // Suppress unused variable warning for handleSave
  void handleSave;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Similar structure to UserProfileScreen but with DJ-specific fields */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">DJ Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile editing similar to UserProfileScreen but with bio, genres, base price */}
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400">DJ Profile management coming soon...</p>
        </div>
      </div>
    </div>
  );
};
