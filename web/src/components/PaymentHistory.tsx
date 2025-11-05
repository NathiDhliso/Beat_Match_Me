/**
 * Payment History Component
 * Unified payment/revenue history for both DJ (earnings) and Fan (spending)
 */

import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Search, Download, Filter, Calendar, Music, User } from 'lucide-react';

interface Transaction {
  transactionId: string;
  type: 'CHARGE' | 'REFUND' | 'PAYOUT';
  amount: number;
  songTitle?: string;
  artistName?: string;
  userName?: string;
  djName?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: number;
  platformFee?: number;
  performerEarnings?: number;
}

interface PaymentHistoryProps {
  transactions: Transaction[];
  mode: 'dj' | 'fan'; // DJ sees earnings, Fan sees spending
  totalEarnings?: number; // For DJ
  totalSpent?: number; // For Fan
  loading?: boolean;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  transactions,
  mode,
  totalEarnings,
  totalSpent,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'CHARGE' | 'REFUND' | 'PAYOUT'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = searchQuery === '' || 
          t.songTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.djName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return b.createdAt - a.createdAt; // Newest first
        } else {
          return b.amount - a.amount; // Highest first
        }
      });
  }, [transactions, searchQuery, filterType, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = filteredTransactions.filter(t => t.status === 'COMPLETED');
    const totalAmount = completed.reduce((sum, t) => sum + (mode === 'dj' ? (t.performerEarnings || 0) : t.amount), 0);
    const totalPlatformFees = completed.reduce((sum, t) => sum + (t.platformFee || 0), 0);
    
    return {
      count: completed.length,
      totalAmount,
      totalPlatformFees,
      averageAmount: completed.length > 0 ? totalAmount / completed.length : 0,
    };
  }, [filteredTransactions, mode]);

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ['Date', 'Type', 'Song', 'Amount', 'Status', mode === 'dj' ? 'Your Earnings' : 'Total Paid'].join(','),
      ...filteredTransactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.type,
        t.songTitle || 'N/A',
        `R${t.amount.toFixed(2)}`,
        t.status,
        mode === 'dj' ? `R${(t.performerEarnings || 0).toFixed(2)}` : `R${t.amount.toFixed(2)}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            {mode === 'dj' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{mode === 'dj' ? 'Total Earnings' : 'Total Spent'}</span>
          </div>
          <p className="text-3xl font-bold text-white">
            R{(mode === 'dj' ? (totalEarnings || stats.totalAmount) : (totalSpent || stats.totalAmount)).toFixed(2)}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Music className="w-4 h-4" />
            <span>Total Transactions</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.count}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            <span>Average Amount</span>
          </div>
          <p className="text-3xl font-bold text-white">R{stats.averageAmount.toFixed(2)}</p>
        </div>

        {mode === 'dj' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Platform Fees</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">R{stats.totalPlatformFees.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by song or name..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="all" className="bg-gray-900">All Types</option>
              <option value="CHARGE" className="bg-gray-900">Charges</option>
              <option value="REFUND" className="bg-gray-900">Refunds</option>
              {mode === 'dj' && <option value="PAYOUT" className="bg-gray-900">Payouts</option>}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="date" className="bg-gray-900">Sort by Date</option>
              <option value="amount" className="bg-gray-900">Sort by Amount</option>
            </select>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">No transactions found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.transactionId}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        transaction.type === 'CHARGE' ? 'bg-green-500/20 text-green-400' :
                        transaction.type === 'REFUND' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {transaction.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        transaction.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                        transaction.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    
                    {transaction.songTitle && (
                      <h3 className="text-white font-semibold truncate">
                        {transaction.songTitle}
                      </h3>
                    )}
                    {transaction.artistName && (
                      <p className="text-gray-400 text-sm truncate">{transaction.artistName}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 text-gray-500 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                      {mode === 'dj' && transaction.userName && (
                        <>
                          <span>•</span>
                          <User className="w-3 h-3" />
                          <span>{transaction.userName}</span>
                        </>
                      )}
                      {mode === 'fan' && transaction.djName && (
                        <>
                          <span>•</span>
                          <User className="w-3 h-3" />
                          <span>{transaction.djName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {transaction.type === 'REFUND' && '-'}
                      R{(mode === 'dj' && transaction.performerEarnings 
                        ? transaction.performerEarnings 
                        : transaction.amount
                      ).toFixed(2)}
                    </p>
                    {mode === 'dj' && transaction.platformFee && transaction.type === 'CHARGE' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Fee: R{transaction.platformFee.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
