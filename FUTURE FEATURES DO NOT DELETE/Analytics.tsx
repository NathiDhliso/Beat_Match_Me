import React from 'react';

/**
 * Phase 8: Analytics & Insights
 * Charts, graphs, revenue tracking, audience insights
 */

export interface AnalyticsData {
  totalRequests: number;
  totalRevenue: number;
  averageWaitTime: number;
  peakHour: string;
  topGenres: Array<{ genre: string; count: number; percentage: number }>;
  requestsByHour: Array<{ hour: string; count: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

/**
 * Stats Card Component
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`bg-gray-800 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
      
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
};

/**
 * Genre Distribution Pie Chart
 */
interface GenreChartProps {
  genres: Array<{ genre: string; count: number; percentage: number }>;
  className?: string;
}

export const GenreChart: React.FC<GenreChartProps> = ({
  genres,
  className = '',
}) => {
  const colors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-accent-500',
    'bg-gold-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className={`bg-gray-800 rounded-2xl p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Top Genres</h3>
      
      <div className="space-y-4">
        {genres.map((item, index) => (
          <div key={item.genre}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <span className="text-white font-medium">{item.genre}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">{item.count} requests</span>
                <span className="text-white font-semibold">{item.percentage}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Request Rate Line Chart
 */
interface RequestRateChartProps {
  data: Array<{ hour: string; count: number }>;
  className?: string;
}

export const RequestRateChart: React.FC<RequestRateChartProps> = ({
  data,
  className = '',
}) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className={`bg-gray-800 rounded-2xl p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Request Rate Over Time</h3>
      
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxCount}</span>
          <span>{Math.floor(maxCount * 0.75)}</span>
          <span>{Math.floor(maxCount * 0.5)}</span>
          <span>{Math.floor(maxCount * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-14 h-full flex items-end gap-2">
          {data.map((item, index) => {
            const height = (item.count / maxCount) * 100;
            return (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-full bg-gradient-to-t from-primary-500 to-secondary-500 rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.count} requests
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{item.hour}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Revenue Tracker Component
 */
interface RevenueTrackerProps {
  currentRevenue: number;
  milestones: number[];
  breakdown: {
    totalCharged: number;
    refunds: number;
    netEarnings: number;
    platformFee: number;
  };
  className?: string;
}

export const RevenueTracker: React.FC<RevenueTrackerProps> = ({
  currentRevenue,
  milestones,
  breakdown,
  className = '',
}) => {
  const nextMilestone = milestones.find(m => m > currentRevenue) || milestones[milestones.length - 1];
  const progress = (currentRevenue / nextMilestone) * 100;

  return (
    <div className={`bg-gray-800 rounded-2xl p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Revenue Tracker</h3>
      
      {/* Current Revenue */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gold-500">R{currentRevenue.toFixed(2)}</span>
          <span className="text-gray-400">tonight</span>
        </div>
        
        {/* Progress to next milestone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Next milestone</span>
            <span className="text-white font-semibold">R{nextMilestone}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            R{(nextMilestone - currentRevenue).toFixed(2)} to go
          </p>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Milestones</p>
        <div className="flex gap-2">
          {milestones.map(milestone => (
            <div
              key={milestone}
              className={`
                flex-1 h-2 rounded-full
                ${currentRevenue >= milestone ? 'bg-gold-500' : 'bg-gray-700'}
                transition-colors duration-500
              `}
              title={`R${milestone}`}
            />
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Charged</span>
          <span className="text-white font-semibold">R{breakdown.totalCharged.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Refunds</span>
          <span className="text-red-400">-R{breakdown.refunds.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Platform Fee (15%)</span>
          <span className="text-gray-400">-R{breakdown.platformFee.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-base pt-2 border-t border-gray-700">
          <span className="text-white font-semibold">Net Earnings</span>
          <span className="text-green-500 font-bold">R{breakdown.netEarnings.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Audience Insights Component
 */
interface AudienceInsightsProps {
  totalAttendees: number;
  newUsers: number;
  returningUsers: number;
  averageRequestsPerUser: number;
  topTiers: Array<{ tier: string; count: number; percentage: number }>;
  className?: string;
}

export const AudienceInsights: React.FC<AudienceInsightsProps> = ({
  totalAttendees,
  newUsers,
  returningUsers,
  averageRequestsPerUser,
  topTiers,
  className = '',
}) => {
  return (
    <div className={`bg-gray-800 rounded-2xl p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Audience Insights</h3>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-400 text-sm mb-1">Total Attendees</p>
          <p className="text-2xl font-bold text-white">{totalAttendees}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Avg Requests/User</p>
          <p className="text-2xl font-bold text-white">{averageRequestsPerUser.toFixed(1)}</p>
        </div>
      </div>

      {/* New vs Returning */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">User Type</p>
        <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
          <div
            className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
            style={{ width: `${(newUsers / totalAttendees) * 100}%` }}
          >
            {newUsers > 0 && `${newUsers} New`}
          </div>
          <div
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
            style={{ width: `${(returningUsers / totalAttendees) * 100}%` }}
          >
            {returningUsers > 0 && `${returningUsers} Returning`}
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div>
        <p className="text-sm text-gray-400 mb-3">Tier Distribution</p>
        <div className="space-y-2">
          {topTiers.map(item => (
            <div key={item.tier} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${item.tier === 'platinum' ? 'bg-gray-300 text-gray-900' :
                    item.tier === 'gold' ? 'bg-gold-500 text-white' :
                    item.tier === 'silver' ? 'bg-gray-400 text-gray-900' :
                    'bg-orange-700 text-white'}
                `}>
                  {item.tier.charAt(0).toUpperCase()}
                </span>
                <span className="text-white capitalize">{item.tier}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{item.count}</span>
                <span className="text-white font-semibold w-12 text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Performance Metrics Component
 */
interface PerformanceMetricsProps {
  averageWaitTime: number;
  requestAcceptanceRate: number;
  vetoRate: number;
  upvoteEngagement: number;
  className?: string;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  averageWaitTime,
  requestAcceptanceRate,
  vetoRate,
  upvoteEngagement,
  className = '',
}) => {
  const metrics = [
    {
      label: 'Avg Wait Time',
      value: `${averageWaitTime} min`,
      score: averageWaitTime < 20 ? 'good' : averageWaitTime < 30 ? 'ok' : 'poor',
      icon: '⏱️',
    },
    {
      label: 'Acceptance Rate',
      value: `${requestAcceptanceRate}%`,
      score: requestAcceptanceRate > 90 ? 'good' : requestAcceptanceRate > 75 ? 'ok' : 'poor',
      icon: '✅',
    },
    {
      label: 'Veto Rate',
      value: `${vetoRate}%`,
      score: vetoRate < 10 ? 'good' : vetoRate < 20 ? 'ok' : 'poor',
      icon: '❌',
    },
    {
      label: 'Upvote Engagement',
      value: `${upvoteEngagement}%`,
      score: upvoteEngagement > 50 ? 'good' : upvoteEngagement > 30 ? 'ok' : 'poor',
      icon: '❤️',
    },
  ];

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-500';
      case 'ok': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-2xl p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map(metric => (
          <div key={metric.label} className="bg-gray-750 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <span className={`text-xl font-bold ${getScoreColor(metric.score)}`}>
                {metric.value}
              </span>
            </div>
            <p className="text-sm text-gray-400">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Analytics Dashboard Component
 */
interface AnalyticsDashboardProps {
  data: AnalyticsData;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Requests"
          value={data.totalRequests}
          icon="🎵"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Revenue"
          value={`R${data.totalRevenue.toFixed(2)}`}
          icon="💰"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Avg Wait Time"
          value={`${data.averageWaitTime} min`}
          icon="⏱️"
          subtitle={`Peak hour: ${data.peakHour}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GenreChart genres={data.topGenres} />
        <RequestRateChart data={data.requestsByHour} />
      </div>
    </div>
  );
};
