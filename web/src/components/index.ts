/**
 * BeatMatchMe Component Library
 * Core Components Only - Existing Components
 */

// Error Handling - NEW
export { ErrorDisplay, InlineError, ErrorPage } from './ErrorDisplay';

// Core Value Prop Features - EXISTING COMPONENTS ONLY
export { RequestCapManager } from './RequestCapManager';
export { FloatingActionBubble, StatusArc, CircularQueueVisualizer, GestureHandler } from './OrbitalInterface';
export { DJLibrary } from './DJLibrary';
export type { Track } from './DJLibrary';
export { EventDiscovery, AlbumArtGrid, MassiveRequestButton, LockedInAnimation, EnergyBeam, NowPlayingCelebration } from './AudienceInterface';

// Profile Management - EXISTING
export { TierComparison, UserProfileScreen, DJProfileScreen, TIER_DATA } from './ProfileManagement';
export type { TierInfo, UserProfileData, DJProfileData } from './ProfileManagement';

// Social Login / OAuth - EXISTING
export { SocialLoginButtons } from './SocialLoginButtons';

// Event Management - EXISTING
export { EventCreator } from './EventCreator';
export { QRCodeDisplay } from './QRCodeDisplay';
export { EventPlaylistManager } from './EventPlaylistManager';

// Music Database Integration - EXISTING
export { SongSearchModal } from './SongSearchModal';

// Notifications - EXISTING
export {
  NotificationToast,
  NotificationCenter,
  LiveUpdateIndicator,
  PushNotificationPrompt,
  ConnectionStatus,
} from './Notifications';
export type { Notification, NotificationType } from './Notifications';

// Live Mode Indicators - NEW
export {
  LiveModeIndicators,
  LiveStatusBar,
  UserNowPlayingNotification,
  RequestStatusPill,
} from './LiveModeIndicators';

// Payment - EXISTING
export { YocoCardInput } from './YocoCardInput';

// Payment & Earnings - NEW
export { PaymentPage } from './PaymentPage';
export { PayoutDashboard } from './PayoutDashboard';
export { PaymentAccess, QuickRequestButton } from './PaymentAccess';

// Request Flow - Features 3 & 4 - EXISTING
export { RequestConfirmation } from './RequestConfirmation';
export { RefundConfirmation } from './RefundConfirmation';
export { VetoConfirmation } from './VetoConfirmation';
export { AcceptRequestPanel } from './AcceptRequestPanel';
export { MarkPlayingPanel, PlayingCelebration } from './MarkPlayingPanel';
export { NowPlayingCard } from './NowPlayingCard';

// Status & Indicators - EXISTING
export { StatusIndicator } from './StatusIndicators';
export type { RequestStatus } from './StatusIndicators';
export { TierBadge } from './TierBadge';

// Error Handling - EXISTING
export { ErrorBoundary } from './ErrorBoundary';

// Theme - EXISTING
export { useTheme, ThemeProvider, ThemeToggle, DarkModeGradients, DarkModeWrapper, SophisticatedCard, ElegantButton, DarkModeText, Divider } from './DarkModeTheme';

// FUTURE FEATURES - Components not yet implemented (commented out to prevent build errors)
// export { TierModal } from './TierModal';
// export { SpotlightSlots, SpotlightSettings } from './SpotlightSlots';
// export { DJCard, DJList, DJSearch, DJAvailabilityNotification } from './DJDiscovery';
// export { QRCodeGenerator, GeolocationDiscovery, QRCodeScanner } from './DiscoveryWorkflow';
// export { GroupRequestModal, GroupRequestCard, GroupRequestDetails } from './GroupRequestModal';
// export { UpvoteButton, UpvoteLeaderboard } from './UpvoteButton';
// export { AnalyticsDashboard, RevenueChart, RequestAnalytics, AudienceInsights, PerformanceMetrics, ExportReports } from './Analytics';

