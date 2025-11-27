import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { Check, Lock, Mail, Eye, EyeOff, Loader2, Headphones, Music } from 'lucide-react';
import { useTheme, useThemeClasses } from '../context/ThemeContext';

type AuthMode = 'login' | 'signup' | 'confirm' | 'role-select';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, confirmSignup, error } = useAuth();
  const { currentTheme } = useTheme();
  const themeClasses = useThemeClasses();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0b]">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, -20px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, 20px); }
        }
        .login-title {
          background: linear-gradient(135deg, #fff 0%, #a855f7 40%, #ec4899 70%, #f97316 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% auto;
          animation: gradientMove 6s ease infinite;
        }
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px]"
          style={{ animation: 'float 12s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[120px]"
          style={{ animation: 'float-reverse 10s ease-in-out infinite' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/[0.06] p-6 sm:p-8 w-full max-w-[420px] relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold login-title">BeatMatchMe</h1>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/50 backdrop-blur-sm">
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
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                style={{
                  '--tw-ring-color': currentTheme.primary,
                } as React.CSSProperties}
                placeholder="Email address"
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                style={{
                  '--tw-ring-color': currentTheme.primary,
                } as React.CSSProperties}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${themeClasses.gradientPrimary} text-white font-semibold py-3 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-2 mt-1`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-400 hover:text-white transition-colors py-2"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setMode('role-select')}
                className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors py-2"
              >
                Create account
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
            {/* MASSIVE DJ Icon Button */}
            <button
              onClick={() => {
                setSelectedRole('PERFORMER');
                setMode('signup');
              }}
              className={`w-full ${themeClasses.gradientPrimary} hover:opacity-90 text-white py-12 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl flex flex-col items-center justify-center overflow-hidden group`}
            >
              <div className="relative w-40 h-40 mb-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <img
                  src="/assets/dj_role.png"
                  alt="DJ Role"
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                />
              </div>
              <div className="text-3xl font-bold tracking-wider">DJ</div>
            </button>

            {/* MASSIVE Fan Icon Button */}
            <button
              onClick={() => {
                setSelectedRole('AUDIENCE');
                setMode('signup');
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-12 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl flex flex-col items-center justify-center overflow-hidden group"
            >
              <div className="relative w-40 h-40 mb-2 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <img
                  src="/assets/fan_role.png"
                  alt="Fan Role"
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                />
              </div>
              <div className="text-3xl font-bold tracking-wider">Fan</div>
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
            <div className="bg-white/5 rounded-xl p-2 mb-3 text-center flex items-center justify-center gap-2">
              {selectedRole === 'PERFORMER' ? <Headphones className="w-4 h-4 text-white" /> : <Music className="w-4 h-4 text-white" />}
              <span className="text-white text-sm">{selectedRole === 'PERFORMER' ? 'DJ' : 'Fan'}</span>
            </div>

            {/* Name Field */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
              style={{
                '--tw-ring-color': currentTheme.primary,
              } as React.CSSProperties}
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
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{
                  '--tw-ring-color': currentTheme.primary,
                } as React.CSSProperties}
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
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    '--tw-ring-color': currentTheme.primary,
                  } as React.CSSProperties}
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
              className={`w-full ${themeClasses.gradientPrimary} text-white font-bold py-4 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-lg mt-4`}
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
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-3 mb-3 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-blue-200" />
              <p className="text-blue-200 text-sm text-center">Check your email</p>
            </div>

            {/* Verification Code Input */}
            <input
              type="text"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
              style={{
                '--tw-ring-color': currentTheme.primary,
              } as React.CSSProperties}
              placeholder="· · · · · ·"
              required
              maxLength={6}
            />

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${themeClasses.gradientPrimary} text-white font-bold py-4 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-lg mt-4`}
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
    </div>
  );
};
