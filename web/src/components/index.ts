/**
 * BeatMatchMe Component Library
 * Core Components Only
 */

// Core Value Prop Features
export { TracklistManager } from './TracklistManager';
export { RequestCapManager, SoldOutBanner } from './RequestCapManager';
export { SpotlightSlots, SpotlightSettings } from './SpotlightSlots';
export { EventSelection } from './EventSelection';
export { TierModal } from './TierModal';
export { RoleToggle } from './RoleToggle';
export { FloatingActionBubble, StatusArc, CircularQueueVisualizer, GestureHandler } from './OrbitalInterface';
export { DJLibrary } from './DJLibrary';
export type { Track } from './DJLibrary';
export { EventDiscovery, AlbumArtGrid, MassiveRequestButton, LockedInAnimation, EnergyBeam, NowPlayingCelebration } from './AudienceInterface';

// DJ Discovery & Profile Management (Phase 1B Critical UX Fixes)
export { DJCard, DJList, DJSearch, DJAvailabilityNotification } from './DJDiscovery';
export type { DJProfile, SearchFilters } from './DJDiscovery';
export { TierComparison, UserProfileScreen, DJProfileScreen, TIER_DATA } from './ProfileManagement';
export type { TierInfo, UserProfileData, DJProfileData } from './ProfileManagement';

// Discovery Workflow (Phase 1A - P0 CRITICAL)
export { QRCodeGenerator, GeolocationDiscovery, QRCodeScanner } from './DiscoveryWorkflow';
export type { EventWithLocation } from './DiscoveryWorkflow';

// Social Login / OAuth (Phase 1 - P1)
export { SocialLoginButtons, SocialLoginButtonsCompact } from './SocialLoginButtons';

// Event Management (DJ-User Integration)
export { EventCreator } from './EventCreator';
export { QRCodeDisplay } from './QRCodeDisplay';

// Music Database Integration
export { SongSearchModal } from './SongSearchModal';

// REMOVED: Non-value-prop features
// - Exploratory Features (Feeling Lucky, Genre Roulette) - Not in value prop
// - Constellation Navigation - Not in value prop
// - Social Features (Friends, Activity Feed) - Not in value prop

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

// REMOVED: Old components from cleanup
// - RequestHistory, SongSelection, RequestConfirmation, GroupRequest, RequestTracking, QueueViews
// These were part of the old UI that has been replaced

// Payment
export { PaymentModal, PaymentSuccessModal } from './PaymentModal';
export type { PaymentData } from './PaymentModal';

// REMOVED: Educational features - Not in value prop
// - Genre education, DJ tips, etc. - Not core to request system

// Utilities
export * from '../utils/gradients';
export * from '../utils/haptics';
