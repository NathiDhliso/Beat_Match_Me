# Feature 13: View Analytics and Revenue (DJ)

## Overview
Provide DJs with comprehensive analytics and revenue tracking during and after their sets, including real-time earnings, request statistics, and exportable reports.

## User Journey

### Accessing Analytics

1. DJ swipes left or taps "Revenue" in radial menu
2. Revenue dashboard displays with three main stat cards:

### Main Stat Cards

#### Card 1: Total Earnings
- Large animated number showing session revenue
- Tumbling animation on updates
- Trend indicator (↑12% vs last period)
- Breakdown:
  - Total Charged
  - Refunds
  - Platform Fee
  - **Net Earnings**

#### Card 2: Requests Filled
- Count of completed requests
- Percentage of queue capacity used
- Average wait time

#### Card 3: Avg per Request
- Calculated from total revenue / request count
- Comparison to base price
- Indicator if above/below average

### Additional Analytics

3. DJ scrolls to see more metrics:
   - **Request rate over time** (line chart)
   - **Top genres requested** (pie chart)
   - **Revenue by hour** (bar chart)
   - **User tier distribution** (donut chart)
   - **Veto rate percentage** (gauge)

### Revenue Milestones

4. Progress bar showing next revenue goal
5. Milestone badges for R100, R500, R1000, R2000
6. Celebration animation when milestone reached
7. Haptic feedback on achievement

### Exporting Data

8. DJ taps "Export" button
9. Options appear:
   - Download CSV
   - Email report
   - Share summary
10. DJ selects export format
11. Report generated with:
    - All requests and revenue
    - Analytics summary
    - Event details
12. File downloads or email sent

## Technical Requirements

### Backend Data Aggregation
```graphql
type RevenueAnalytics {
  totalEarnings: Float!
  totalCharged: Float!
  totalRefunds: Float!
  platformFee: Float!
  netEarnings: Float!
  requestsFilled: Int!
  requestsVetoed: Int!
  averagePerRequest: Float!
  averageWaitTime: Int!
  queueCapacityUsed: Float!
  vetoRate: Float!
  trendPercentage: Float!
}

type RequestStatistics {
  requestRateOverTime: [TimeSeriesDataPoint!]!
  topGenres: [GenreStatistic!]!
  revenueByHour: [HourlyRevenue!]!
  userTierDistribution: [TierDistribution!]!
}

type TimeSeriesDataPoint {
  timestamp: AWSDateTime!
  value: Float!
}

type GenreStatistic {
  genre: String!
  count: Int!
  percentage: Float!
}

type HourlyRevenue {
  hour: Int!
  revenue: Float!
  requestCount: Int!
}

type TierDistribution {
  tier: UserTier!
  count: Int!
  percentage: Float!
  revenue: Float!
}

query getAnalytics($djSetId: ID!) {
  getAnalytics(djSetId: $djSetId) {
    revenue: RevenueAnalytics!
    statistics: RequestStatistics!
    milestones: [Milestone!]!
  }
}
```

### Real-time Updates
- WebSocket/subscription for live revenue updates
- Optimistic UI updates on request completion
- Debounced chart updates (every 5 seconds)
- Smooth number transitions/animations

### Export Functionality
```graphql
mutation exportAnalytics(
  $djSetId: ID!
  $format: ExportFormat!
  $deliveryMethod: DeliveryMethod!
  $email: String
) {
  exportAnalytics(
    djSetId: $djSetId
    format: $format
    deliveryMethod: $deliveryMethod
    email: $email
  ) {
    downloadUrl
    expiresAt
    emailSent
  }
}

enum ExportFormat {
  CSV
  PDF
  JSON
}

enum DeliveryMethod {
  DOWNLOAD
  EMAIL
  SHARE
}
```

### Data Calculations

#### Platform Fee
```
platformFee = totalCharged × 0.15  // 15% platform fee
```

#### Net Earnings
```
netEarnings = totalCharged - totalRefunds - platformFee
```

#### Veto Rate
```
vetoRate = (requestsVetoed / (requestsFilled + requestsVetoed)) × 100
```

#### Trend Percentage
```
trendPercentage = ((currentRevenue - previousRevenue) / previousRevenue) × 100
```

#### Queue Capacity Used
```
queueCapacityUsed = (requestsFilled / estimatedCapacity) × 100
// estimatedCapacity based on event duration and average song length
```

### Milestones System
```typescript
const MILESTONES = [
  { amount: 100, badge: '💯', title: 'First Hundred' },
  { amount: 500, badge: '🔥', title: 'Half K' },
  { amount: 1000, badge: '💰', title: 'One Thousand' },
  { amount: 2000, badge: '🚀', title: 'Two K Club' },
  { amount: 5000, badge: '⭐', title: 'Five Star' },
  { amount: 10000, badge: '👑', title: 'King of Requests' }
];
```

## UI Components Needed

### Charts
- Line chart (request rate over time)
- Pie/donut chart (genre distribution)
- Bar chart (hourly revenue)
- Gauge chart (veto rate)
- Progress bars (milestones)

### Animations
- Number tumbling effect for revenue
- Celebration confetti for milestones
- Smooth chart transitions
- Pulse effect on real-time updates
- Haptic feedback on achievements

### Export Modal
- Format selection (CSV/PDF/JSON)
- Delivery method selection
- Email input field (if applicable)
- Preview option
- Loading state during generation

### Revenue Breakdown
- Expandable sections
- Tooltip explanations
- Color-coded positive/negative
- Trend arrows

## Analytics Insights

### DJ Performance Metrics
- Revenue per hour
- Acceptance rate (1 - veto rate)
- Average request value
- Peak earning hours
- Genre preference alignment

### Audience Engagement
- Request frequency
- Tier distribution
- Repeat requesters
- Upvote patterns
- Group request participation

### Revenue Optimization Tips
- Best performing genres
- Optimal pricing recommendations
- Peak activity times
- Tier upgrade opportunities

## Privacy & Security
- Only DJ can view their own analytics
- Aggregate data (no individual user PII in exports)
- Secure download links with expiration
- Email reports sent to verified DJ email only
- Data retention policy (90 days for detailed, 1 year for summary)

## Performance Considerations
- Cache frequently accessed analytics
- Pre-aggregate hourly data
- Lazy load charts (render on scroll)
- Debounce real-time updates
- Pagination for large datasets in exports

## Status
📋 **PLANNED** - Future Feature
