import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { UniversalHelp, HelpBadge } from '../components/UniversalHelp';
import { Check, Lock, Mail, Sparkles } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'confirm' | 'role-select';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, confirmSignup, error } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name, selectedRole);
      setMode('confirm');
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmSignup(email, confirmCode);
      setMode('login');
      alert('Account confirmed! Please login.');
    } catch (err) {
      console.error('Confirmation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative z-10">
        {/* Logo & Badge Only */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">BeatMatchMe</h1>
          
          {/* Minimal Refund Badge */}
          <div className="flex justify-center">
            <HelpBadge title="100% Refund Guarantee" icon="💰">
              <p className="font-semibold text-green-300 mb-2">You're Protected:</p>
              <p>✓ DJ vetoes your song</p>
              <p>✓ Technical issues</p>
              <p>✓ Event cancelled</p>
              <p className="mt-2 text-gray-400">💳 Refund in 3-5 days</p>
            </HelpBadge>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <p className="text-white text-xl font-bold">Welcome!</p>
              </div>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email - Icon Only */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Email"
                required
              />
            </div>
            
            {/* Password - Icon Only */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Password"
                required
              />
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-lg mt-4"
            >
              {loading ? '...' : 'Login'}
            </button>
            
            {/* Minimal Links */}
            <div className="flex justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Forgot?
              </button>
              <button
                type="button"
                onClick={() => setMode('role-select')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sign up
              </button>
            </div>
          </form>
        )}

        {/* Social Login - Icons Only */}
        {mode === 'login' && (
          <div className="mt-4">
            <SocialLoginButtons />
          </div>
        )}

        {mode === 'role-select' && (
          <div className="space-y-3">
            {/* MASSIVE DJ Emoji Button */}
            <button
              onClick={() => {
                setSelectedRole('PERFORMER');
                setMode('signup');
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-16 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <div className="text-8xl mb-2">🎧</div>
              <div className="text-3xl font-bold">DJ</div>
            </button>
            
            {/* MASSIVE Fan Emoji Button */}
            <button
              onClick={() => {
                setSelectedRole('AUDIENCE');
                setMode('signup');
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-16 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <div className="text-8xl mb-2">🎵</div>
              <div className="text-3xl font-bold">Fan</div>
            </button>
            
            {/* Minimal back link */}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-gray-400 text-xs hover:text-white transition-colors pt-2"
            >
              Back
            </button>
          </div>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3">
            {/* Role Badge - Minimal */}
            <div className="bg-white/5 rounded-xl p-2 mb-3 text-center">
              <span className="text-white text-sm">{selectedRole === 'PERFORMER' ? '🎧 DJ' : '🎵 Fan'}</span>
            </div>
            
            {/* Name Field */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="Full Name"
              required
            />
            
            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Email"
                required
              />
            </div>
            
            {/* Password Field with Strength Bar Only */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Password (8+ chars)"
                  required
                  minLength={8}
                />
              </div>
              {/* Strength Bar Only - No Text */}
              {password && (
                <div className="mt-1.5">
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength}%`,
                        background: passwordStrength < 50 ? '#ef4444' : passwordStrength < 75 ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-lg mt-4"
            >
              {loading ? '...' : 'Sign Up'}
            </button>
            
            {/* Back Link */}
            <button
              type="button"
              onClick={() => setMode('role-select')}
              className="w-full text-gray-400 text-xs hover:text-white transition-colors pt-1"
            >
              Back
            </button>
          </form>
        )}

        {mode === 'confirm' && (
          <form onSubmit={handleConfirm} className="space-y-3">
            {/* Simple Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-3 mb-3">
              <p className="text-blue-200 text-sm text-center">📧 Check your email</p>
            </div>
            
            {/* Verification Code Input */}
            <input
              type="text"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="· · · · · ·"
              required
              maxLength={6}
            />
            
            {/* Confirm Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-lg mt-4"
            >
              {loading ? '...' : 'Confirm'}
            </button>
            
            {/* Back Link */}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-gray-400 text-xs hover:text-white transition-colors pt-1"
            >
              Back
            </button>
          </form>
        )}
      </div>

      {/* Universal Help Button */}
      <UniversalHelp mode="both" />
    </div>
  );
};
