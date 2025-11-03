/**
 * BeatMatchMe Component Library
 * Phase 15: Advanced UX & Psychological Engagement
 */

// Tier System
export { TierBadge, AnimatedTierBadge, TierProgress, calculateTier } from './TierBadge';
export type { TierType } from './TierBadge';

// Audio Visualizer
export { AudioVisualizer, EdgeGlow, ParticleBurst } from './AudioVisualizer';

// Animations
export { ConfettiAnimation, SuccessAnimation, MilestoneCelebration } from './ConfettiAnimation';

// Status Indicators
export {
  StatusIndicator,
  QueuePosition,
  CircularProgress,
  AchievementBadge,
  LoadingSpinner,
} from './StatusIndicators';
export type { RequestStatus } from './StatusIndicators';

// Queue Cards
export { QueueCard, CurrentlyPlayingCard, CompactQueueCard } from './QueueCard';
export type { RequestType } from './QueueCard';

// Exploratory Features (Phase 15.4)
export {
  FeelingLucky,
  GenreRoulette,
  ChallengeCard,
  ChallengesList,
} from './ExploratoryFeatures';
export type { Challenge } from './ExploratoryFeatures';

// Constellation Navigation (Phase 15.1)
export {
  ConstellationNav,
  CrowdMomentum,
  FriendProximity,
} from './ConstellationNav';
export type { NavItem } from './ConstellationNav';

// Social Features (Phase 6)
export {
  UpvoteButton,
  FriendList,
  SocialShare,
  FriendRequest,
  ActivityFeed,
} from './SocialFeatures';
export type { Friend, SocialShare as SocialShareType, Activity } from './SocialFeatures';

// Notifications (Phase 7)
export {
  NotificationToast,
  NotificationCenter,
  LiveUpdateIndicator,
  PushNotificationPrompt,
  ConnectionStatus,
} from './Notifications';
export type { Notification, NotificationType } from './Notifications';

// Analytics (Phase 8)
export {
  StatsCard,
  GenreChart,
  RequestRateChart,
  RevenueTracker,
  AudienceInsights,
  PerformanceMetrics,
  AnalyticsDashboard,
} from './Analytics';
export type { AnalyticsData } from './Analytics';

// Request History (Phase 9)
export {
  RequestHistory,
  BackupList,
  FavoriteSongs,
} from './RequestHistory';
export type { HistoricalRequest, BackupRequest, FavoriteSong } from './RequestHistory';

// Gamification (Phase 11)
export {
  AchievementUnlockModal,
  AchievementsGallery,
  Leaderboard,
  StreakTracker,
} from './Gamification';
export type { Achievement, AchievementTier, LeaderboardEntry } from './Gamification';

// Advanced Features (Phase 16 - Final 25%)
export {
  ContextualThemeProvider,
  EventTypeIndicator,
  WeatherIntegration,
  TipPoolSystem,
  VibeSaverAction,
  GestureGuardrails,
  HoldToConfirm,
  ProfileAuraRing,
  RequestTrailEffect,
  VIPRequestEntrance,
} from './AdvancedFeatures';
export type { EventType, WeatherCondition, UserTier } from './AdvancedFeatures';

// Song Selection & Request Flow
export { SongSelectionScreen } from './SongSelection';
export { RequestConfirmation } from './RequestConfirmation';
export type { RequestData } from './RequestConfirmation';

// Group Requests
export { GroupRequestScreen, GroupRequestLobby, JoinGroupRequestScreen } from './GroupRequest';

// Request Tracking
export { RequestTrackingView } from './RequestTracking';

// Queue Views
export { PerformerQueueView, AudienceQueueView } from './QueueViews';

// Payment
export { PaymentModal, PaymentSuccessModal } from './PaymentModal';
export type { PaymentData } from './PaymentModal';

// Educational Features (Phase 16 - Final 25%)
export {
  DidYouKnowCard,
  GenreDeepDive,
  DJTips,
  EventStoryMode,
  VenueConsistencyProfile,
} from './EducationalFeatures';
export type { EventContribution } from './EducationalFeatures';

// Utilities
export * from '../utils/gradients';
export * from '../utils/haptics';
