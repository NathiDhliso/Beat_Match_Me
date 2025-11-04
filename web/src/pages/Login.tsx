import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { Shield, Check, Lock, Mail, Sparkles } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'confirm' | 'role-select';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, confirmSignup, error, clearError } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50 to-yellow-50 dark:from-black dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4 shadow-glow-cyan">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-white dark:to-white bg-clip-text text-transparent mb-2">BeatMatchMe</h1>
          <p className="text-amber-700 dark:text-blue-200">Live Music Request Platform</p>
          {/* Certainty Cue: Fair-Play Promise Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-green-500/20 border border-amber-400 dark:border-green-500/50 rounded-full shadow-sm shadow-amber-500/30 dark:shadow-none">
            <Shield className="w-4 h-4 text-amber-700 dark:text-green-400" />
            <span className="text-xs font-semibold text-amber-900 dark:text-green-300">100% Refund Guarantee</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
            <button onClick={clearError} className="text-xs underline mt-1">
              Dismiss
            </button>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-2xl animate-bounce-in">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <p className="text-white text-xl font-bold">Welcome Back!</p>
              </div>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="w-full text-blue-200 text-sm hover:text-white transition-colors"
            >
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={() => setMode('role-select')}
              className="w-full text-blue-200 text-sm hover:text-white transition-colors"
            >
              Don't have an account? Sign up
            </button>
          </form>
        )}

        {mode === 'login' && (
          <div className="mt-6">
            <SocialLoginButtons />
          </div>
        )}

        {mode === 'role-select' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Choose Your Role</h2>
            <button
              onClick={() => {
                setSelectedRole('PERFORMER');
                setMode('signup');
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-6 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              <div className="text-2xl mb-2">🎧</div>
              <div className="text-lg">I'm a Performer</div>
              <div className="text-sm opacity-80">DJ, Band, or Artist</div>
            </button>
            <button
              onClick={() => {
                setSelectedRole('AUDIENCE');
                setMode('signup');
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-6 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
            >
              <div className="text-2xl mb-2">🎵</div>
              <div className="text-lg">I'm Here to Request</div>
              <div className="text-sm opacity-80">Music Lover & Fan</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-blue-200 text-sm hover:text-white transition-colors mt-4"
            >
              Already have an account? Login
            </button>
            
            {/* Social Signup Options */}
            <div className="mt-6">
              <SocialLoginButtons />
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]">
              <p className="text-white text-sm">
                Signing up as: <span className="font-bold">{selectedRole}</span>
              </p>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Password Strength</span>
                    <span className="text-xs font-semibold" style={{
                      color: passwordStrength < 50 ? '#ef4444' : passwordStrength < 75 ? '#f59e0b' : '#10b981'
                    }}>
                      {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
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
              <p className="text-xs text-blue-200 mt-1">Must include uppercase, lowercase, and numbers</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => setMode('role-select')}
              className="w-full text-blue-200 text-sm hover:text-white transition-colors"
            >
              Back to role selection
            </button>
          </form>
        )}

        {mode === 'confirm' && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="bg-blue-500/20 border border-blue-500 text-blue-100 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">Check your email for a verification code</p>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                placeholder="123456"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Confirm Account'}
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-blue-200 text-sm hover:text-white transition-colors"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
