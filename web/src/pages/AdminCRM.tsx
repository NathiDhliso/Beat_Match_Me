import React, { useState, useEffect, useCallback } from 'react';
import { 
  signIn, signOut, getCurrentUser, fetchUserAttributes 
} from 'aws-amplify/auth';
import { 
  Users, Music, AlertTriangle, CheckCircle, 
  Clock, TrendingUp, Search,
  Eye, Ban, RefreshCw, Download,
  UserCheck, CreditCard, ArrowUpRight, ArrowDownRight,
  Star, Shield, Wallet, LogOut, Lock
} from 'lucide-react';
import {
  fetchAdminStats,
  fetchAllUsers,
  fetchAllTransactions,
  fetchAllDisputes,
  fetchAllPayouts,
  submitUpdateUserStatus,
  submitReleaseEscrow,
  submitRefundTransaction,
  submitResolveDispute,
  submitProcessPayout
} from '../services/graphql';

type TabType = 'overview' | 'djs' | 'fans' | 'transactions' | 'disputes' | 'payouts';

interface AdminStats {
  totalDJs: number;
  activeDJs: number;
  totalFans: number;
  activeFans: number;
  totalTransactions: number;
  heldFunds: number;
  releasedToday: number;
  pendingPayouts: number;
  openDisputes: number;
  platformRevenue: number;
  platformRevenueToday: number;
}

interface UserProfile {
  userId: string;
  email: string;
  name: string;
  role: 'PERFORMER' | 'AUDIENCE';
  tier: string;
  status: string;
  totalSpent?: number;
  totalEarnings?: number;
  totalRequests: number;
  totalEvents?: number;
  rating?: number;
  createdAt: string;
  lastActiveAt: string;
  verificationStatus?: string;
}

interface Transaction {
  transactionId: string;
  requestId: string;
  userId: string;
  userName: string;
  performerId: string;
  performerName: string;
  eventId: string;
  eventName: string;
  songTitle: string;
  artistName: string;
  amount: number;
  platformFee: number;
  performerEarnings: number;
  status: string;
  paymentProvider: string;
  providerTransactionId: string;
  createdAt: string;
  releasedAt?: string;
  refundedAt?: string;
}

interface Dispute {
  disputeId: string;
  transactionId: string;
  raisedBy: string;
  raisedById: string;
  raisedByName: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

interface Payout {
  payoutId: string;
  performerId: string;
  performerName: string;
  amount: number;
  transactionCount: number;
  status: string;
  bankName: string;
  accountNumber: string;
  reference: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

interface AdminUser {
  userId: string;
  email: string;
  isAdmin: boolean;
}

const ADMIN_GROUP = 'Admins';

export const AdminCRM: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [djs, setDJs] = useState<UserProfile[]>([]);
  const [fans, setFans] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const checkAdminAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      // Get groups from the session token
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      const groups = idToken?.payload?.['cognito:groups'] as string[] || [];
      
      const isAdmin = groups.includes(ADMIN_GROUP) || attributes['custom:role'] === 'ADMIN';
      
      if (isAdmin) {
        setAdminUser({
          userId: currentUser.userId,
          email: attributes.email || '',
          isAdmin: true
        });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setAdminUser(null);
        setLoginError('Access denied. You are not in the Admins group.');
      }
    } catch {
      setIsAuthenticated(false);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      // Sign out any existing user first
      try {
        await signOut();
      } catch {
        // Ignore signout errors
      }
      
      await signIn({ username: email, password });
      await checkAdminAuth();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setAdminUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setDataLoading(true);
    try {
      const [statsData, djsData, fansData, txnData, disputeData, payoutData] = await Promise.all([
        fetchAdminStats().catch(() => null),
        fetchAllUsers('PERFORMER', 50).catch(() => ({ items: [] })),
        fetchAllUsers('AUDIENCE', 50).catch(() => ({ items: [] })),
        fetchAllTransactions(undefined, 50).catch(() => ({ items: [] })),
        fetchAllDisputes(undefined, 50).catch(() => ({ items: [] })),
        fetchAllPayouts(undefined, 50).catch(() => ({ items: [] }))
      ]);

      if (statsData) setStats(statsData);
      if (djsData?.items) setDJs(djsData.items);
      if (fansData?.items) setFans(fansData.items);
      if (txnData?.items) setTransactions(txnData.items);
      if (disputeData?.items) setDisputes(disputeData.items);
      if (payoutData?.items) setPayouts(payoutData.items);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleSuspendUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await submitUpdateUserStatus(userId, 'SUSPENDED', 'Admin action');
      await loadData();
    } catch (err) {
      console.error('Failed to suspend user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await submitUpdateUserStatus(userId, 'ACTIVE');
      await loadData();
    } catch (err) {
      console.error('Failed to activate user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReleaseEscrow = async (transactionId: string) => {
    setActionLoading(transactionId);
    try {
      await submitReleaseEscrow(transactionId);
      await loadData();
    } catch (err) {
      console.error('Failed to release escrow:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundTransaction = async (transactionId: string) => {
    const reason = prompt('Enter refund reason:');
    if (!reason) return;
    
    setActionLoading(transactionId);
    try {
      await submitRefundTransaction(transactionId, reason);
      await loadData();
    } catch (err) {
      console.error('Failed to refund transaction:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveDispute = async (disputeId: string, action: 'REFUND' | 'RELEASE') => {
    const resolution = prompt('Enter resolution notes:');
    if (!resolution) return;
    
    setActionLoading(disputeId);
    try {
      await submitResolveDispute(disputeId, resolution, action);
      await loadData();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    if (!confirm('Process this payout?')) return;
    
    setActionLoading(payoutId);
    try {
      await submitProcessPayout(payoutId);
      await loadData();
    } catch (err) {
      console.error('Failed to process payout:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'VERIFIED':
      case 'COMPLETED':
      case 'RELEASED':
      case 'RESOLVED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING':
      case 'PENDING_VERIFICATION':
      case 'HELD':
      case 'PROCESSING':
      case 'INVESTIGATING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'SUSPENDED':
      case 'FLAGGED':
      case 'FAILED':
      case 'REFUNDED':
      case 'ESCALATED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'DISPUTED':
      case 'OPEN':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'bg-purple-500/20 text-purple-400';
      case 'GOLD': return 'bg-yellow-500/20 text-yellow-400';
      case 'SILVER': return 'bg-gray-400/20 text-gray-300';
      default: return 'bg-orange-500/20 text-orange-400';
    }
  };

  const formatCurrency = (amount: number) => `R${(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const formatDateTime = (date: string) => date ? new Date(date).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Access</h1>
              <p className="text-gray-400 text-sm mt-2">BeatMatchMe CRM Dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="admin@beatmatch.me"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-gray-500 text-xs mt-6">
              Admin accounts are created through AWS Cognito.
              <br />Contact system administrator for access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayStats = stats || {
    totalDJs: djs.length,
    activeDJs: djs.filter(d => d.status === 'ACTIVE').length,
    totalFans: fans.length,
    activeFans: fans.filter(f => f.status === 'ACTIVE').length,
    totalTransactions: transactions.length,
    heldFunds: transactions.filter(t => t.status === 'HELD').reduce((sum, t) => sum + t.amount, 0),
    releasedToday: 0,
    pendingPayouts: payouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
    openDisputes: disputes.filter(d => d.status !== 'RESOLVED').length,
    platformRevenue: transactions.reduce((sum, t) => sum + (t.platformFee || 0), 0),
    platformRevenueToday: 0
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">BeatMatchMe CRM</h1>
              <p className="text-sm text-gray-400">Escrow & Workflow Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500 w-64"
              />
            </div>
            <button 
              onClick={loadData}
              disabled={dataLoading}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${dataLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
              <span className="text-sm text-gray-400">{adminUser?.email}</span>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-gray-900/50 border-b border-gray-800 px-6">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'djs', label: 'DJs', icon: Music, count: djs.length },
            { id: 'fans', label: 'Fans', icon: Users, count: fans.length },
            { id: 'transactions', label: 'Transactions', icon: CreditCard, count: transactions.length },
            { id: 'disputes', label: 'Disputes', icon: AlertTriangle, count: displayStats.openDisputes },
            { id: 'payouts', label: 'Payouts', icon: Wallet }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'disputes' && displayStats.openDisputes > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {displayStats.openDisputes}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Active DJs" value={displayStats.activeDJs} subtitle={`${displayStats.totalDJs} total`} icon={Music} color="purple" />
              <StatCard title="Active Fans" value={displayStats.activeFans} subtitle={`${displayStats.totalFans} total`} icon={Users} color="blue" />
              <StatCard title="Held in Escrow" value={formatCurrency(displayStats.heldFunds)} subtitle="Awaiting release" icon={Shield} color="yellow" />
              <StatCard title="Platform Revenue" value={formatCurrency(displayStats.platformRevenue)} subtitle="30% commission" icon={TrendingUp} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Escrow Pipeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span>Funds Held</span>
                    </div>
                    <span className="font-bold text-yellow-400">{formatCurrency(displayStats.heldFunds)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-blue-400" />
                      <span>Pending Payouts</span>
                    </div>
                    <span className="font-bold text-blue-400">{formatCurrency(displayStats.pendingPayouts)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Released Today</span>
                    </div>
                    <span className="font-bold text-green-400">{formatCurrency(displayStats.releasedToday)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Recent Transactions
                </h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(txn => (
                    <div key={txn.transactionId} className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${txn.status === 'HELD' ? 'bg-yellow-400' : txn.status === 'RELEASED' ? 'bg-green-400' : 'bg-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[150px]">{txn.songTitle}</p>
                          <p className="text-xs text-gray-500">{txn.userName} → {txn.performerName}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(txn.amount)}</span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No transactions yet</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Requires Attention
                </h3>
                <div className="space-y-3">
                  {displayStats.openDisputes > 0 && (
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-red-400 font-medium">{displayStats.openDisputes} Open Disputes</span>
                        <button onClick={() => setActiveTab('disputes')} className="text-xs text-red-400 hover:underline">View →</button>
                      </div>
                    </div>
                  )}
                  {djs.filter(d => d.verificationStatus === 'PENDING').length > 0 && (
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 font-medium">{djs.filter(d => d.verificationStatus === 'PENDING').length} Pending Verifications</span>
                        <button onClick={() => setActiveTab('djs')} className="text-xs text-yellow-400 hover:underline">Review →</button>
                      </div>
                    </div>
                  )}
                  {fans.filter(f => f.status === 'FLAGGED').length > 0 && (
                    <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-400 font-medium">{fans.filter(f => f.status === 'FLAGGED').length} Flagged Users</span>
                        <button onClick={() => setActiveTab('fans')} className="text-xs text-orange-400 hover:underline">Review →</button>
                      </div>
                    </div>
                  )}
                  {displayStats.openDisputes === 0 && djs.filter(d => d.verificationStatus === 'PENDING').length === 0 && fans.filter(f => f.status === 'FLAGGED').length === 0 && (
                    <p className="text-green-400 text-sm text-center py-4">All clear! No items need attention.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'djs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">DJ Management ({djs.length})</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">DJ</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Tier</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Earnings</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Events</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Rating</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {djs.filter(dj => 
                    !searchQuery || 
                    dj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    dj.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(dj => (
                    <tr key={dj.userId} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{dj.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{dj.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(dj.tier)}`}>
                          {dj.tier || 'BRONZE'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(dj.status)}`}>
                          {dj.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(dj.totalEarnings || 0)}</td>
                      <td className="px-4 py-3">{dj.totalEvents || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{dj.rating ? dj.rating.toFixed(1) : '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedUser(dj)} className="p-1.5 hover:bg-gray-700 rounded-lg" title="View Details">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          {dj.status === 'SUSPENDED' ? (
                            <button 
                              onClick={() => handleActivateUser(dj.userId)} 
                              disabled={actionLoading === dj.userId}
                              className="p-1.5 hover:bg-green-500/20 rounded-lg" 
                              title="Activate"
                            >
                              <UserCheck className="w-4 h-4 text-green-400" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleSuspendUser(dj.userId)} 
                              disabled={actionLoading === dj.userId}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg" 
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {djs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {dataLoading ? 'Loading DJs...' : 'No DJs found'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fans' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Fan Management ({fans.length})</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Fan</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Tier</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Total Spent</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Requests</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Joined</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {fans.filter(fan => 
                    !searchQuery || 
                    fan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    fan.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(fan => (
                    <tr key={fan.userId} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{fan.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{fan.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(fan.tier)}`}>
                          {fan.tier || 'BRONZE'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(fan.status)}`}>
                          {fan.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(fan.totalSpent || 0)}</td>
                      <td className="px-4 py-3">{fan.totalRequests || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{formatDate(fan.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedUser(fan)} className="p-1.5 hover:bg-gray-700 rounded-lg" title="View Details">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          {fan.status === 'SUSPENDED' ? (
                            <button 
                              onClick={() => handleActivateUser(fan.userId)} 
                              disabled={actionLoading === fan.userId}
                              className="p-1.5 hover:bg-green-500/20 rounded-lg" 
                              title="Activate"
                            >
                              <UserCheck className="w-4 h-4 text-green-400" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleSuspendUser(fan.userId)} 
                              disabled={actionLoading === fan.userId}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg" 
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fans.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {dataLoading ? 'Loading fans...' : 'No fans found'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Transaction History ({transactions.length})</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Song</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Fan → DJ</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Fee</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map(txn => (
                    <tr key={txn.transactionId} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{txn.songTitle}</p>
                          <p className="text-sm text-gray-500">{txn.artistName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400">{txn.userName}</span>
                          <ArrowUpRight className="w-3 h-3 text-gray-500" />
                          <span className="text-purple-400">{txn.performerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(txn.amount)}</td>
                      <td className="px-4 py-3 text-gray-400">{formatCurrency(txn.platformFee)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{formatDateTime(txn.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {txn.status === 'HELD' && (
                            <>
                              <button 
                                onClick={() => handleReleaseEscrow(txn.transactionId)}
                                disabled={actionLoading === txn.transactionId}
                                className="p-1.5 hover:bg-green-500/20 rounded-lg" 
                                title="Release Funds"
                              >
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </button>
                              <button 
                                onClick={() => handleRefundTransaction(txn.transactionId)}
                                disabled={actionLoading === txn.transactionId}
                                className="p-1.5 hover:bg-red-500/20 rounded-lg" 
                                title="Refund"
                              >
                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {dataLoading ? 'Loading transactions...' : 'No transactions found'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Dispute Resolution ({disputes.length})</h2>
            </div>

            {disputes.length === 0 ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400">{dataLoading ? 'Loading disputes...' : 'No disputes to resolve'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map(dispute => (
                  <div key={dispute.disputeId} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          dispute.priority === 'URGENT' ? 'bg-red-500/20' :
                          dispute.priority === 'HIGH' ? 'bg-orange-500/20' :
                          'bg-yellow-500/20'
                        }`}>
                          <AlertTriangle className={`w-6 h-6 ${
                            dispute.priority === 'URGENT' ? 'text-red-400' :
                            dispute.priority === 'HIGH' ? 'text-orange-400' :
                            'text-yellow-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{dispute.reason?.replace(/_/g, ' ')}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                              {dispute.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            Raised by {dispute.raisedByName} ({dispute.raisedBy}) • {formatDateTime(dispute.createdAt)}
                          </p>
                        </div>
                      </div>
                      {dispute.status !== 'RESOLVED' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleResolveDispute(dispute.disputeId, 'REFUND')}
                            disabled={actionLoading === dispute.disputeId}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium"
                          >
                            Refund Fan
                          </button>
                          <button 
                            onClick={() => handleResolveDispute(dispute.disputeId, 'RELEASE')}
                            disabled={actionLoading === dispute.disputeId}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
                          >
                            Release to DJ
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-300">{dispute.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">DJ Payouts ({payouts.length})</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-400">{formatCurrency(displayStats.pendingPayouts)}</p>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Processing</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(payouts.filter(p => p.status === 'PROCESSING').reduce((s, p) => s + p.amount, 0))}</p>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(payouts.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0))}</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">DJ</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Transactions</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Bank</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {payouts.map(payout => (
                    <tr key={payout.payoutId} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium">{payout.performerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-green-400">{formatCurrency(payout.amount)}</td>
                      <td className="px-4 py-3 text-gray-400">{payout.transactionCount} txns</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm">{payout.bankName}</p>
                          <p className="text-xs text-gray-500">{payout.accountNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{formatDate(payout.createdAt)}</td>
                      <td className="px-4 py-3">
                        {payout.status === 'PENDING' && (
                          <button 
                            onClick={() => handleProcessPayout(payout.payoutId)}
                            disabled={actionLoading === payout.payoutId}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium"
                          >
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payouts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {dataLoading ? 'Loading payouts...' : 'No payouts found'}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-800 rounded-lg">
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedUser.role === 'PERFORMER' 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                    : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                }`}>
                  {selectedUser.role === 'PERFORMER' ? <Music className="w-8 h-8 text-white" /> : <Users className="w-8 h-8 text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTierColor(selectedUser.tier)}`}>
                      {selectedUser.tier}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedUser.role === 'PERFORMER' ? (
                  <>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-400">{formatCurrency(selectedUser.totalEarnings || 0)}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Total Events</p>
                      <p className="text-2xl font-bold">{selectedUser.totalEvents || 0}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Total Spent</p>
                      <p className="text-2xl font-bold text-blue-400">{formatCurrency(selectedUser.totalSpent || 0)}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-sm text-gray-400">Total Requests</p>
                      <p className="text-2xl font-bold">{selectedUser.totalRequests || 0}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
              </div>

              <div className="flex gap-3">
                {selectedUser.status === 'SUSPENDED' ? (
                  <button 
                    onClick={() => { handleActivateUser(selectedUser.userId); setSelectedUser(null); }}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                  >
                    Activate User
                  </button>
                ) : (
                  <button 
                    onClick={() => { handleSuspendUser(selectedUser.userId); setSelectedUser(null); }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
                  >
                    Suspend User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: 'purple' | 'blue' | 'green' | 'yellow' | 'red';
}> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colors = {
    purple: 'from-purple-600 to-pink-600',
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-green-600 to-emerald-600',
    yellow: 'from-yellow-600 to-orange-600',
    red: 'from-red-600 to-pink-600'
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

export default AdminCRM;
