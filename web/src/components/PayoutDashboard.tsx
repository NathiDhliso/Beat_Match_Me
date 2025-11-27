/**
 * Performer Payout Dashboard
 * Shows earnings, breakdown, and payout requests for DJs/Performers
 */

import React, { useState } from 'react';
import { TrendingUp, Download, Info, CheckCircle, Clock, AlertCircle, Wallet } from 'lucide-react';
import { calculatePaymentBreakdown, canRequestPayout, getPayoutTimeline, getCommissionExplanation } from '../services/paymentSplit';

interface PayoutDashboardProps {
  currentBalance: number;
  totalEarnings: number;
  platformFeesTotal: number;
  transactionCount: number;
  pendingPayouts: number;
  lastPayoutDate?: Date;
  onRequestPayout: () => void;
}

export const PayoutDashboard: React.FC<PayoutDashboardProps> = ({
  currentBalance,
  totalEarnings,
  platformFeesTotal,
  transactionCount,
  pendingPayouts,
  lastPayoutDate,
  onRequestPayout,
}) => {
  const [showCommissionInfo, setShowCommissionInfo] = useState(false);
  const canPayout = canRequestPayout(currentBalance);
  const minimumPayout = 100;
  const commissionInfo = getCommissionExplanation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Earnings</h2>
        <button
          onClick={() => setShowCommissionInfo(!showCommissionInfo)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <Info className="w-5 h-5" />
          <span className="text-sm">How it works</span>
        </button>
      </div>

      {/* Commission Info Modal */}
      {showCommissionInfo && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Revenue Split</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-purple-500/20">
                  <span className="text-gray-400">You earn</span>
                  <span className="text-2xl font-bold text-green-400">{commissionInfo.performerCut}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Platform fee</span>
                  <span className="text-lg font-semibold text-purple-400">{commissionInfo.platformCut}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4 mb-3">{commissionInfo.why}</p>
              <div className="space-y-2">
                {commissionInfo.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Available Balance - Primary */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Available Now</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              R{currentBalance.toFixed(2)}
            </div>
            <p className="text-green-300/70 text-sm">
              From {transactionCount} requests
            </p>
            
            {/* Payout Button */}
            <button
              onClick={onRequestPayout}
              disabled={!canPayout}
              className={`
                mt-4 w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2
                transition-all transform hover:scale-[1.02]
                ${canPayout 
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <Download className="w-5 h-5" />
              {canPayout ? 'Request Payout' : `Minimum R${minimumPayout}`}
            </button>
          </div>
        </div>

        {/* Total Lifetime Earnings */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Lifetime Earnings</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            R{totalEarnings.toFixed(2)}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Platform fees paid</span>
              <span className="text-gray-300">R{platformFeesTotal.toFixed(2)}</span>
            </div>
            {lastPayoutDate && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last payout</span>
                <span className="text-gray-300">{lastPayoutDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      {pendingPayouts > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Payout Processing</h3>
              <p className="text-gray-400 text-sm mb-3">
                R{pendingPayouts.toFixed(2)} is being transferred to your account
              </p>
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Expected in {getPayoutTimeline('processing')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Breakdown Card */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Example: R100 Request</h3>
        {(() => {
          const example = calculatePaymentBreakdown(100);
          return (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Customer pays</span>
                <span className="text-white font-medium">R{example.grossAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment processing</span>
                <span className="text-gray-400">-R{example.processingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Platform fee (30%)</span>
                <span className="text-gray-400">-R{example.platformFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-700"></div>
              <div className="flex justify-between">
                <span className="text-green-400 font-semibold">You receive</span>
                <span className="text-green-400 font-bold text-lg">R{example.netToPerformer.toFixed(2)}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Payout Info */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-400">
            <p className="mb-2">
              <span className="font-medium text-white">Minimum payout:</span> R{minimumPayout}.00
            </p>
            <p>
              Payouts are processed within 2-3 business days. You'll receive an email confirmation once the transfer is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
