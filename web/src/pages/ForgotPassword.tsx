import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Check } from 'lucide-react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

type ForgotPasswordStep = 'request' | 'reset';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotPasswordStep>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword({ username: email });
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
          <p className="text-gray-300">You can now login with your new password</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 animate-scale-in">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400">
            {step === 'request'
              ? 'Enter your email to receive a reset code'
              : 'Enter the code sent to your email'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                placeholder="123456"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Check your email for the code</p>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]"
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => handleRequestReset({ preventDefault: () => {} } as any)}
              className="w-full text-gray-300 text-sm hover:text-white transition-colors"
            >
              Didn't receive code? Resend
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
