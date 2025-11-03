import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Droplets, Heart, Zap, Users, Sparkles } from 'lucide-react';

// ============================================================================
// CONTEXTUAL THEME SHIFTS
// ============================================================================

export type EventType = 'wedding' | 'club' | 'festival' | 'corporate' | 'birthday';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  shadowIntensity: string;
  animationSpeed: string;
}

const themeConfigs: Record<EventType, ThemeConfig> = {
  wedding: {
    primaryColor: 'from-rose-100 to-pink-100',
    secondaryColor: 'from-amber-50 to-rose-50',
    accentColor: 'text-rose-600',
    fontFamily: 'font-serif',
    borderRadius: 'rounded-2xl',
    shadowIntensity: 'shadow-lg',
    animationSpeed: 'duration-700',
  },
  club: {
    primaryColor: 'from-purple-600 to-pink-600',
    secondaryColor: 'from-cyan-500 to-purple-500',
    accentColor: 'text-cyan-400',
    fontFamily: 'font-sans',
    borderRadius: 'rounded-none',
    shadowIntensity: 'shadow-2xl',
    animationSpeed: 'duration-300',
  },
  festival: {
    primaryColor: 'from-yellow-400 via-pink-500 to-purple-600',
    secondaryColor: 'from-green-400 via-blue-500 to-purple-600',
    accentColor: 'text-yellow-300',
    fontFamily: 'font-bold',
    borderRadius: 'rounded-3xl',
    shadowIntensity: 'shadow-2xl',
    animationSpeed: 'duration-500',
  },
  corporate: {
    primaryColor: 'from-slate-700 to-slate-900',
    secondaryColor: 'from-blue-600 to-slate-700',
    accentColor: 'text-blue-400',
    fontFamily: 'font-sans',
    borderRadius: 'rounded-lg',
    shadowIntensity: 'shadow-md',
    animationSpeed: 'duration-500',
  },
  birthday: {
    primaryColor: 'from-pink-400 to-purple-500',
    secondaryColor: 'from-yellow-300 to-pink-400',
    accentColor: 'text-yellow-400',
    fontFamily: 'font-sans',
    borderRadius: 'rounded-2xl',
    shadowIntensity: 'shadow-xl',
    animationSpeed: 'duration-400',
  },
};

interface ContextualThemeProviderProps {
  eventType: EventType;
  children: React.ReactNode;
}

export const ContextualThemeProvider: React.FC<ContextualThemeProviderProps> = ({ eventType, children }) => {
  const theme = themeConfigs[eventType];
  
  return (
    <div 
      className={`${theme.fontFamily} transition-all ${theme.animationSpeed}`}
      style={{
        '--primary-gradient': theme.primaryColor,
        '--secondary-gradient': theme.secondaryColor,
        '--accent-color': theme.accentColor,
        '--border-radius': theme.borderRadius,
        '--shadow-intensity': theme.shadowIntensity,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

interface EventTypeIndicatorProps {
  eventType: EventType;
  venueName: string;
}

export const EventTypeIndicator: React.FC<EventTypeIndicatorProps> = ({ eventType, venueName }) => {
  const theme = themeConfigs[eventType];
  
  const eventLabels: Record<EventType, string> = {
    wedding: '💍 Wedding Celebration',
    club: '🎧 Club Night',
    festival: '🎪 Festival Vibes',
    corporate: '💼 Corporate Event',
    birthday: '🎂 Birthday Party',
  };
  
  return (
    <div className={`bg-gradient-to-r ${theme.primaryColor} ${theme.borderRadius} p-4 ${theme.shadowIntensity} mb-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${theme.accentColor} font-semibold`}>{eventLabels[eventType]}</p>
          <p className={`text-lg ${theme.fontFamily} font-bold text-gray-800`}>{venueName}</p>
        </div>
        <Sparkles className={`w-8 h-8 ${theme.accentColor}`} />
      </div>
    </div>
  );
};

// ============================================================================
// WEATHER INTEGRATION
// ============================================================================

export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'cloudy' | 'storm';

interface WeatherIntegrationProps {
  condition: WeatherCondition;
  intensity?: number; // 0-100
}

export const WeatherIntegration: React.FC<WeatherIntegrationProps> = ({ condition }) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  useEffect(() => {
    if (condition === 'rain' || condition === 'storm') {
      const interval = setInterval(() => {
        const newRipple = {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        };
        setRipples(prev => [...prev.slice(-10), newRipple]);
      }, condition === 'storm' ? 200 : 500);
      
      return () => clearInterval(interval);
    }
  }, [condition]);
  
  if (condition === 'clear') return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Rain/Storm Ripples */}
      {(condition === 'rain' || condition === 'storm') && ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute animate-ping"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            animationDuration: '2s',
          }}
        />
      ))}
      
      {/* Weather Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b"
        style={{
          background: condition === 'rain' 
            ? 'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), transparent)'
            : condition === 'storm'
            ? 'linear-gradient(to bottom, rgba(30, 58, 138, 0.2), transparent)'
            : condition === 'snow'
            ? 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent)'
            : 'linear-gradient(to bottom, rgba(156, 163, 175, 0.1), transparent)',
        }}
      />
      
      {/* Weather Icon Indicator */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
        {condition === 'rain' && <CloudRain className="w-5 h-5 text-blue-500" />}
        {condition === 'storm' && <Zap className="w-5 h-5 text-indigo-600" />}
        {condition === 'cloudy' && <Cloud className="w-5 h-5 text-gray-500" />}
        {condition === 'snow' && <Droplets className="w-5 h-5 text-blue-200" />}
      </div>
    </div>
  );
};

// ============================================================================
// TIP POOL SYSTEM (Pay-It-Forward)
// ============================================================================

interface TipPoolProps {
  currentBalance: number;
  totalContributions: number;
  beneficiaries: number;
  onContribute: (amount: number) => void;
}

export const TipPoolSystem: React.FC<TipPoolProps> = ({ 
  currentBalance, 
  totalContributions, 
  beneficiaries,
  onContribute 
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const quickAmounts = [5, 10, 20, 50];
  
  const handleContribute = () => {
    onContribute(selectedAmount);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-500 rounded-full p-3">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Community Tip Pool</h3>
          <p className="text-sm text-gray-600">Help others enjoy the music</p>
        </div>
      </div>
      
      {/* Pool Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/70 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">R{currentBalance}</p>
          <p className="text-xs text-gray-600">Available</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{beneficiaries}</p>
          <p className="text-xs text-gray-600">Helped</p>
        </div>
        <div className="bg-white/70 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">R{totalContributions}</p>
          <p className="text-xs text-gray-600">Total Given</p>
        </div>
      </div>
      
      {/* Contribution Interface */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Quick Contribute</p>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  selectedAmount === amount
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-green-100'
                }`}
              >
                R{amount}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleContribute}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Contribute R{selectedAmount} to Pool
        </button>
        
        {showSuccess && (
          <div className="bg-green-500 text-white p-3 rounded-lg text-center animate-bounce">
            <p className="font-semibold">🎉 Thank you for spreading the joy!</p>
            <p className="text-sm">Your kindness will help someone's night</p>
          </div>
        )}
      </div>
      
      {/* Impact Message */}
      <div className="mt-4 bg-white/50 rounded-lg p-3">
        <p className="text-xs text-gray-600 text-center italic">
          "Your contribution helps music lovers who can't afford requests enjoy the night too"
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// VIBE SAVER ACTION (Boost Underappreciated Songs)
// ============================================================================

interface VibeSaverProps {
  song: {
    title: string;
    artist: string;
    currentBoost: number;
    targetBoost: number;
    contributors: number;
  };
  onBoost: (amount: number) => void;
}

export const VibeSaverAction: React.FC<VibeSaverProps> = ({ song, onBoost }) => {
  const [boostAmount, setBoostAmount] = useState(5);
  const [showAnimation, setShowAnimation] = useState(false);
  
  const progress = (song.currentBoost / song.targetBoost) * 100;
  const remaining = song.targetBoost - song.currentBoost;
  
  const handleBoost = () => {
    onBoost(boostAmount);
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 2000);
  };
  
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Animated Background */}
      {showAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-30 animate-pulse" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-500 rounded-full p-3 animate-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Vibe Saver</h3>
            <p className="text-sm text-gray-600">Rescue this hidden gem!</p>
          </div>
        </div>
        
        {/* Song Info */}
        <div className="bg-white/70 rounded-xl p-4 mb-4">
          <p className="font-bold text-lg text-gray-800">{song.title}</p>
          <p className="text-sm text-gray-600">{song.artist}</p>
          <div className="mt-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-gray-600">{song.contributors} people want to hear this</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700 font-semibold">Boost Progress</span>
            <span className="text-orange-600 font-bold">R{remaining} to go!</span>
          </div>
          <div className="h-4 bg-white/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">
            R{song.currentBoost} / R{song.targetBoost} raised
          </p>
        </div>
        
        {/* Boost Options */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 20].map(amount => (
              <button
                key={amount}
                onClick={() => setBoostAmount(amount)}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  boostAmount === amount
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-orange-100'
                }`}
              >
                R{amount}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleBoost}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Boost with R{boostAmount}
          </button>
        </div>
        
        {showAnimation && (
          <div className="mt-3 bg-orange-500 text-white p-3 rounded-lg text-center animate-bounce">
            <p className="font-semibold">⚡ Vibe Saved!</p>
            <p className="text-sm">You're a hero of good music</p>
          </div>
        )}
        
        {/* Gamification */}
        <div className="mt-4 bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-600 text-center">
            🏆 <span className="font-semibold">Vibe Saver Badge</span> unlocked at 5 rescues!
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UI STABILITY FEATURES
// ============================================================================

interface GestureGuardrailsProps {
  position: 'left' | 'right' | 'top' | 'bottom';
  isActive: boolean;
}

export const GestureGuardrails: React.FC<GestureGuardrailsProps> = ({ position, isActive }) => {
  if (!isActive) return null;
  
  const positionClasses = {
    left: 'left-0 top-0 bottom-0 w-1',
    right: 'right-0 top-0 bottom-0 w-1',
    top: 'top-0 left-0 right-0 h-1',
    bottom: 'bottom-0 left-0 right-0 h-1',
  };
  
  return (
    <div 
      className={`fixed ${positionClasses[position]} bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse pointer-events-none z-50`}
      style={{
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
      }}
    />
  );
};

interface HoldToConfirmProps {
  onConfirm: () => void;
  duration?: number; // milliseconds
  label: string;
  variant?: 'danger' | 'success' | 'warning';
}

export const HoldToConfirm: React.FC<HoldToConfirmProps> = ({ 
  onConfirm, 
  duration = 2000, 
  label,
  variant = 'danger' 
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      const increment = 100 / (duration / 50);
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + increment;
          if (newProgress >= 100) {
            clearInterval(interval);
            onConfirm();
            setIsHolding(false);
            return 0;
          }
          return newProgress;
        });
      }, 50);
    } else {
      setProgress(0);
    }
    
    return () => clearInterval(interval);
  }, [isHolding, duration, onConfirm]);
  
  const variantColors = {
    danger: 'from-red-500 to-red-700',
    success: 'from-green-500 to-green-700',
    warning: 'from-yellow-500 to-orange-600',
  };
  
  return (
    <button
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
      onTouchStart={() => setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
      className={`relative bg-gradient-to-r ${variantColors[variant]} text-white py-4 px-6 rounded-xl font-bold shadow-lg overflow-hidden transition-all hover:scale-105`}
    >
      {/* Progress Circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            transform="rotate(-90 50 50)"
            className="transition-all duration-50"
          />
        </svg>
      </div>
      
      {/* Label */}
      <span className="relative z-10">
        {isHolding ? `Hold... ${Math.round(progress)}%` : label}
      </span>
    </button>
  );
};

// ============================================================================
// VISUAL STATUS MARKERS
// ============================================================================

export type UserTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface ProfileAuraRingProps {
  tier: UserTier;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const ProfileAuraRing: React.FC<ProfileAuraRingProps> = ({ tier, size = 'md', children }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  
  const tierColors = {
    bronze: 'from-amber-600 via-orange-500 to-amber-700',
    silver: 'from-gray-300 via-gray-100 to-gray-400',
    gold: 'from-yellow-400 via-yellow-200 to-yellow-600',
    platinum: 'from-purple-400 via-pink-300 to-blue-400',
  };
  
  const tierGlow = {
    bronze: 'shadow-[0_0_20px_rgba(217,119,6,0.6)]',
    silver: 'shadow-[0_0_20px_rgba(209,213,219,0.6)]',
    gold: 'shadow-[0_0_25px_rgba(250,204,21,0.8)]',
    platinum: 'shadow-[0_0_30px_rgba(192,132,252,0.9)]',
  };
  
  return (
    <div className="relative inline-block">
      {/* Outer Glow Ring */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${tierColors[tier]} rounded-full ${tierGlow[tier]} animate-pulse`} />
      
      {/* Inner Ring */}
      <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${tierColors[tier]} p-1`}>
        <div className="w-full h-full rounded-full bg-white p-0.5">
          {children}
        </div>
      </div>
      
      {/* Tier Badge */}
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
        <div className={`bg-gradient-to-r ${tierColors[tier]} rounded-full px-2 py-0.5`}>
          <span className="text-xs font-bold text-white uppercase">{tier}</span>
        </div>
      </div>
    </div>
  );
};

interface RequestTrailEffectProps {
  tier: UserTier;
  isActive: boolean;
}

export const RequestTrailEffect: React.FC<RequestTrailEffectProps> = ({ tier, isActive }) => {
  const [trails, setTrails] = useState<Array<{ id: number; x: number }>>([]);
  
  useEffect(() => {
    if (isActive && (tier === 'gold' || tier === 'platinum')) {
      const interval = setInterval(() => {
        setTrails(prev => [
          ...prev.slice(-5),
          { id: Date.now(), x: Math.random() * 100 }
        ]);
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [isActive, tier]);
  
  if (!isActive || (tier !== 'gold' && tier !== 'platinum')) return null;
  
  const tierColors = {
    gold: 'bg-yellow-400',
    platinum: 'bg-purple-400',
  };
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {trails.map(trail => (
        <div
          key={trail.id}
          className={`absolute h-1 ${tierColors[tier]} opacity-70 animate-ping`}
          style={{
            left: `${trail.x}%`,
            top: '50%',
            width: '30px',
            borderRadius: '50%',
          }}
        />
      ))}
    </div>
  );
};

interface VIPRequestEntranceProps {
  tier: UserTier;
  songTitle: string;
  onComplete: () => void;
}

export const VIPRequestEntrance: React.FC<VIPRequestEntranceProps> = ({ tier, songTitle, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  if (!isVisible || tier !== 'platinum') return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 rounded-3xl p-8 shadow-2xl max-w-md mx-4 animate-scaleIn">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block bg-white rounded-full p-4 animate-bounce">
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">VIP Request Incoming!</h2>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
            <p className="text-xl font-bold text-white">{songTitle}</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <p className="text-white font-semibold">Platinum Member Request</p>
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
        </div>
      </div>
    </div>
  );
};
