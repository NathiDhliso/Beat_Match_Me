# Feature 17: Upvote Existing Requests (Audience)

## Overview
Allow audience members to upvote existing requests in the queue to help DJs prioritize popular songs.

## User Journey

### Discovering Requests to Upvote

1. Audience member is browsing queue or waiting for their request
2. User sees list of pending requests in queue
3. Each request shows upvote button (heart icon)

### Upvoting a Request

4. User taps heart on a request they also want to hear
5. Heart animates with pulse effect
6. Upvote count increments immediately (optimistic update)
7. Backend mutation `upvoteRequest` executes

### DJ Perspective

8. DJ sees upvote count update in real-time
9. Highly upvoted requests shown with flame icon 🔥
10. DJ may prioritize popular requests when reordering

## Technical Requirements

### Backend
- `upvoteRequest` mutation
- Upvote count tracking per request
- Real-time subscription for upvote updates
- Prevent duplicate upvotes from same user
- Track which users upvoted which requests

### Frontend
- Optimistic UI updates
- Heart animation component
- Upvote count display
- Real-time sync via subscriptions
- Disabled state for already-upvoted requests

### Business Logic
- One upvote per user per request
- Upvote count visible to all users
- DJ gets notification for highly upvoted requests (e.g., >5 upvotes)
- Consider upvotes in queue reordering algorithm

## UI Components Needed
- Heart icon button
- Pulse animation
- Upvote counter badge
- Flame icon for popular requests (>threshold)
- Visual feedback for user's own upvotes

## Analytics Considerations
- Track upvote patterns
- Identify trending songs
- Measure user engagement
- DJ performance metric (% of highly upvoted requests played)

## Status
📋 **PLANNED** - Future Feature
