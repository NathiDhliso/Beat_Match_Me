
# BeatMatchMe - Complete Development Task Specification

## Project Overview

BeatMatchMe is a live event music request platform connecting performers (DJs/bands) with audiences through real-time queue management, South African payment integration, and psychologically-optimized UX. This document serves as a comprehensive task checklist for AI-assisted development.

## PHASE 0: PROJECT SETUP & ARCHITECTURE

### Task 0.1: Development Environment Setup

-   [x] Initialize React project with Vite for web application
    
-   [x] Set up React Native with Expo for iOS and Android
    
-   [x] Configure TailwindCSS for web styling
    
-   [x] Install NativeWind for React Native styling consistency
    
-   [x] Set up TypeScript configuration for type safety
    
-   [x] Configure ESLint and Prettier for code quality
    
-   [x] Initialize Git repository with proper .gitignore
    

### Task 0.2: AWS Infrastructure Foundation

-   [x] Create AWS account and configure IAM roles
    
-   [ ] Set up AWS Amplify project for hosting and CI/CD
    
-   [x] Configure Amazon Cognito User Pools for authentication
    
    -   [x] Create user pool with email/password authentication
        
    -   [x] Set up user groups: "performers" and "audience"
        
    -   [ ] Configure MFA as optional for performers
        
-   [x] Initialize AWS AppSync GraphQL API
    
    -   [x] Enable real-time subscriptions
        
    -   [x] Configure API keys and authorization modes
        
-   [x] Set up DynamoDB tables (see Task 0.3)
    
-   [x] Configure S3 bucket for asset storage
    
    -   [x] Enable versioning
        
    -   [x] Set up lifecycle policies
        
    -   [x] Configure CORS for web access
        
-   [ ] Set up CloudFront distribution
    
    -   [ ] Point to S3 bucket
        
    -   [ ] Configure custom domain (future)
        
<<<<<<< HEAD
    -   [ ] Enable gzip compression        
=======
    -   [ ] Enable gzip compression
        
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

### Task 0.3: Database Schema Implementation (DynamoDB)

#### Users Table

-   [x] Create DynamoDB table: `beatmatchme-users`
    
-   [x] Primary Key: `userId` (String)
    
<<<<<<< HEAD
-   [x] Attributes:    
=======
-   [x] Attributes:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
{
  userId: string;
  email: string;
  name: string;
  role: "performer" | "audience";
  profileImage?: string; // S3 URL
  tier: "bronze" | "silver" | "gold" | "platinum";
  phone?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number;
  stats: {
    totalRequests: number;
    successfulRequests: number;
    eventsAttended: number;
    genresExplored: string[];
  };
  preferences: {
    notificationsEnabled: boolean;
    hapticFeedback: boolean;
    reducedMotion: boolean;
  };
}
```

-   [x] Global Secondary Index: `email-index` (for login lookup)
    
-   [x] Enable encryption at rest
    
<<<<<<< HEAD
-   [x] Set up on-demand billing mode    
=======
-   [x] Set up on-demand billing mode
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

#### Events Table

-   [x] Create DynamoDB table: `beatmatchme-events`
    
-   [x] Primary Key: `eventId` (String)
    
<<<<<<< HEAD
-   [x] Attributes:    
=======
-   [x] Attributes:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
{
  eventId: string;
  performerId: string;
  venueName: string;
  venueLocation: {
    address: string;
    city: string;
    province: string;
    coordinates?: { lat: number; lng: number };
  };
  startTime: number; // Unix timestamp
  endTime: number;
  status: "scheduled" | "active" | "completed" | "cancelled";
  settings: {
    basePrice: number; // South African Rand (ZAR)
    requestCapPerHour: number;
    spotlightSlotsPerBlock: number;
    allowDedications: boolean;
    allowGroupRequests: boolean;
  };
  theme?: string;
  qrCode?: string; // S3 URL to QR code image
  createdAt: number;
  totalRevenue: number;
  totalRequests: number;
}
```

-   [x] GSI: `performerId-startTime-index` (query performer's events)
    
<<<<<<< HEAD
-   [x] GSI: `status-startTime-index` (find active/upcoming events)    
=======
-   [x] GSI: `status-startTime-index` (find active/upcoming events)
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

#### Requests Table

-   [x] Create DynamoDB table: `beatmatchme-requests`
    
-   [x] Primary Key: `requestId` (String)
    
<<<<<<< HEAD
-   [x] Attributes:    
=======
-   [x] Attributes:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
{
  requestId: string;
  eventId: string;
  userId: string;
  songTitle: string;
  artistName: string;
  genre?: string;
  status: "pending" | "approved" | "playing" | "completed" | "vetoed";
  requestType: "standard" | "spotlight" | "group";
  price: number; // ZAR
  queuePosition?: number;
  dedication?: string;
  shoutout?: string;
  submittedAt: number;
  playedAt?: number;
  vetoedAt?: number;
  transactionId: string;
  groupRequestId?: string; // If part of group request
  upvotes: number;
}
```

-   [x] GSI: `eventId-submittedAt-index` (query requests for event)
    
-   [x] GSI: `userId-submittedAt-index` (query user's request history)
    
<<<<<<< HEAD
-   [x] GSI: `eventId-status-index` (filter requests by status)    
=======
-   [x] GSI: `eventId-status-index` (filter requests by status)
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

#### Queues Table

-   [x] Create DynamoDB table: `beatmatchme-queues`
    
-   [x] Primary Key: `eventId` (String)
    
<<<<<<< HEAD
-   [x] Attributes:    
=======
-   [x] Attributes:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
{
  eventId: string;
  orderedRequestIds: string[]; // Array of requestIds in order
  lastUpdated: number;
  currentlyPlaying?: string; // requestId
}
```

<<<<<<< HEAD
-   [x] Enable DynamoDB Streams for real-time updates    
=======
-   [x] Enable DynamoDB Streams for real-time updates
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

#### Transactions Table

-   [x] Create DynamoDB table: `beatmatchme-transactions`
    
-   [x] Primary Key: `transactionId` (String)
    
<<<<<<< HEAD
-   [x] Attributes:    
=======
-   [x] Attributes:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
{
  transactionId: string;
  userId: string;
  eventId: string;
  requestId: string;
  amount: number; // ZAR
  type: "charge" | "refund";
  status: "pending" | "completed" | "failed";
  paymentProvider: "yoco" | "payfast" | "ozow";
  providerTransactionId: string;
  createdAt: number;
  completedAt?: number;
}
```

-   [x] GSI: `userId-createdAt-index` (user transaction history)
    
<<<<<<< HEAD
-   [x] GSI: `eventId-createdAt-index` (event revenue tracking)    
=======
-   [x] GSI: `eventId-createdAt-index` (event revenue tracking)
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

#### Achievements Table

-   [x] Create DynamoDB table: `beatmatchme-achievements`
    
-   [x] Primary Key: `userId` (String)
    
<<<<<<< HEAD
-   [x] Attributes:    
=======
-   [x] Attributes:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
{
  userId: string;
  badges: Array<{
    badgeId: string;
    name: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
    unlockedAt: number;
  }>;
  score: number;
  milestones: {
    firstRequest: number; // timestamp
    firstGroupRequest?: number;
    first10Requests?: number;
    first50Requests?: number;
  };
}
```

#### GroupRequests Table

-   [x] Create DynamoDB table: `beatmatchme-group-requests`
    
-   [x] Primary Key: `groupRequestId` (String)
    
<<<<<<< HEAD
-   [x] Attributes:    
=======
-   [x] Attributes:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
{
  groupRequestId: string;
  eventId: string;
  initiatorUserId: string;
  songTitle: string;
  artistName: string;
  targetAmount: number; // ZAR
  currentAmount: number;
  contributors: Array<{
    userId: string;
    amount: number;
    contributedAt: number;
  }>;
  status: "funding" | "funded" | "expired" | "completed";
  expiresAt: number; // 15 minutes from creation
  createdAt: number;
  requestId?: string; // Once funded and submitted
}
```

-   [x] GSI: `eventId-status-index` (find active group requests)
    
<<<<<<< HEAD
-   [x] TTL on `expiresAt` for automatic cleanup    
=======
-   [x] TTL on `expiresAt` for automatic cleanup
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

## PHASE 1: AUTHENTICATION & USER MANAGEMENT

### Task 1.1: Authentication Flow Implementation

-   \[ \] Create login screen with email/password inputs (web + mobile)
    
-   \[ \] Implement Cognito sign-up with email verification
    
-   \[ \] Build role selection screen: "I'm a Performer" vs "I'm Here to Request"
    
-   \[ \] Set Cognito user attribute for role on registration
    
-   \[ \] Add user to appropriate Cognito group (performers/audience)
    
-   \[ \] Implement social login (Google, Apple Sign-In)
    
    -   \[ \] Configure OAuth providers in Cognito
        
    -   \[ \] Add social login buttons to UI
        
-   \[ \] Create "Forgot Password" flow with email reset
    
-   \[ \] Build password strength validator
    
-   \[ \] Implement session management with token refresh
    

### Task 1.2: User Profile Management

-   \[ \] Create profile setup screen
    
    -   \[ \] Name input
        
    -   \[ \] Profile photo upload to S3
        
    -   \[ \] Phone number (optional, for SMS notifications)
        
-   \[ \] Build profile editing screen
    
    -   \[ \] Update name, photo, phone
        
    -   \[ \] Change password functionality
        
    -   \[ \] Delete account option (with confirmation)
        
-   \[ \] Implement profile image upload
    
    -   \[ \] Resize images to 512x512 before upload
        
    -   \[ \] Generate thumbnail (128x128)
        
    -   \[ \] Store in S3 with proper permissions
        
    -   \[ \] Update `profileImage` URL in Users table
        
-   \[ \] Create user stats display component
    
    -   \[ \] Total requests
        
    -   \[ \] Events attended
        
    -   \[ \] Current tier badge
        
    -   \[ \] Achievements earned
        

### Task 1.3: User Tier System

-   [ ] Implement tier calculation logic (Lambda function)
    
    -   [ ] Bronze: 1-5 successful requests
        
    -   [ ] Silver: 6-15 successful requests
        
    -   [ ] Gold: 16-50 successful requests
        
    -   [ ] Platinum: Top 1% of users (venue-specific)
        
-   [x] Create tier badge UI components
    
    -   [x] Bronze: `#cd7f32` circular badge
        
    -   [x] Silver: `#c0c0c0` circular badge
        
    -   [x] Gold: `#ffd700` circular badge with subtle glow
        
    -   [x] Platinum: `#e5e4e2` animated shimmer effect
        
-   [ ] Set up DynamoDB Stream trigger to update tiers on request completion
    
<<<<<<< HEAD
-   \[ \] Display tier badge on user profile and in queues    
=======
-   [x] Display tier badge on user profile and in queues
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

## PHASE 2: SOUTH AFRICAN PAYMENT INTEGRATION

### Task 2.1: Payment Provider Selection & Setup

#### PRIMARY: Yoco (Recommended for SA)

-   \[ \] Create Yoco merchant account
    
-   \[ \] Obtain Yoco API keys (test and production)
    
-   \[ \] Store API keys in AWS Secrets Manager
    
-   \[ \] Install Yoco SDK/libraries for payment processing
    

#### ALTERNATIVE: PayFast

-   \[ \] Set up PayFast merchant account as backup
    
-   \[ \] Configure PayFast integration
    
-   \[ \] Store credentials in Secrets Manager
    

#### FUTURE: Ozow (Instant EFT)

-   \[ \] Research Ozow integration requirements
    
-   \[ \] Document for Phase 2 expansion
    

### Task 2.2: Payment Processing Lambda Functions

#### Lambda: processPayment

-   \[ \] Create Lambda function: `processPayment`
    
-   \[ \] Input:
    

```
{
  userId: string;
  eventId: string;
  requestId: string;
  amount: number; // ZAR cents
  paymentMethod: "card" | "eft";
}
```

-   \[ \] Implementation steps:
    
    -   \[ \] Validate user exists and is authenticated
        
    -   \[ \] Validate event is active
        
    -   \[ \] Create transaction record in Transactions table (status: "pending")
        
    -   \[ \] Call Yoco Payment API to create payment intent
        
    -   \[ \] Return payment intent client secret to frontend
        
    -   \[ \] Set up webhook to receive payment confirmation
        
    -   \[ \] On success: Update transaction status to "completed"
        
    -   \[ \] On failure: Update transaction status to "failed", notify user
        
-   \[ \] Handle errors gracefully with user-friendly messages
    
-   \[ \] Log all payment attempts to CloudWatch
    

#### Lambda: processRefund

-   \[ \] Create Lambda function: `processRefund`
    
-   \[ \] Input:
    

```
{
  transactionId: string;
  requestId: string;
  reason: "veto" | "event_cancelled" | "timeout";
}
```

-   \[ \] Implementation steps:
    
    -   \[ \] Fetch transaction from Transactions table
        
    -   \[ \] Validate transaction is refundable (status: "completed")
        
    -   \[ \] Call Yoco Refund API with original transaction ID
        
    -   \[ \] Create new refund transaction record (type: "refund")
        
    -   \[ \] Update request status to "vetoed" if applicable
        
    -   \[ \] Send push notification to user about refund
        
    -   \[ \] Return success/failure status
        
-   \[ \] Idempotency: Check if refund already processed
    
-   \[ \] Automatic retry logic for failed refunds (max 3 attempts)
    

#### Lambda: processPayout

-   \[ \] Create Lambda function: `processPayout`
    
-   \[ \] Scheduled by EventBridge (daily at 3am SAST)
    
-   \[ \] Implementation steps:
    
    -   \[ \] Query completed events from last 24 hours
        
    -   \[ \] Calculate performer earnings (total revenue - platform fee - refunds)
        
    -   \[ \] Group by performer
        
    -   \[ \] For each performer:
        
        -   \[ \] Calculate payout amount (85% of gross, 15% platform fee)
            
        -   \[ \] Initiate Yoco payout to performer's registered account
            
        -   \[ \] Send email notification with payout details
            
        -   \[ \] Log payout in CloudWatch
            
-   \[ \] Handle payout failures with retry queue
    

### Task 2.3: Payment UI Components

#### Web Payment Form

-   [x] Create `PaymentModal` component
    
    -   \[ \] Display request details (song, artist, price)
        
    -   \[ \] Show total breakdown (base price + add-ons)
        
    -   \[ \] Card input fields (integrated with Yoco.js)
        
    -   \[ \] Save card checkbox for future use
        
    -   \[ \] Terms & conditions checkbox
        
    -   \[ \] "Pay Now" button with loading state
        
-   \[ \] Implement 3D Secure flow for card payments
    
<<<<<<< HEAD
-   \[ \] Show payment success animation (confetti effect)    
=======
-   \[ \] Show payment success animation (confetti effect)
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
-   \[ \] Handle payment errors with clear messaging
    

#### Mobile Payment Flow (React Native)

-   \[ \] Integrate Yoco Mobile SDK
    
-   \[ \] Create `PaymentScreen` component
    
    -   \[ \] Request summary card
        
    -   \[ \] Payment method selector (saved cards, new card, EFT)
        
    -   \[ \] Card scanner option (camera access)
        
    -   \[ \] Biometric authentication option (Face ID/Touch ID)
        
-   \[ \] Implement Apple Pay integration for iOS
    
-   \[ \] Implement Google Pay integration for Android
    
-   \[ \] Handle background payment processing
    
-   \[ \] Show persistent notification during payment
    

### Task 2.4: Refund System Implementation

-   \[ \] Create automatic refund trigger on request veto
    
    -   \[ \] DynamoDB Stream on Requests table
        
    -   \[ \] Filter for status change to "vetoed"
        
    -   \[ \] Invoke `processRefund` Lambda automatically
        
-   \[ \] Build `RefundNotification` component
    
    -   \[ \] Display refund amount and reason
        
    -   \[ \] "Add to Backup List" button
        
    -   \[ \] Link to support if user disputes
        
-   \[ \] Create refund history view in user profile
    
    -   \[ \] List all refunded requests
        
    -   \[ \] Show refund date and reason
        
    -   \[ \] Display refund status (pending/completed)
        

## PHASE 3: REAL-TIME QUEUE SYSTEM

### Task 3.1: GraphQL API Schema (AWS AppSync)

#### Type Definitions

-   \[ \] Define GraphQL types:
    

```
type Event {
  eventId: ID!
  performerId: ID!
  venueName: String!
  venueLocation: Location!
  startTime: AWSTimestamp!
  endTime: AWSTimestamp!
  status: EventStatus!
  settings: EventSettings!
  qrCode: String
  totalRevenue: Float!
  totalRequests: Int!
}

type Request {
  requestId: ID!
  eventId: ID!
  userId: ID!
  user: User # Resolver joins with Users table
  songTitle: String!
  artistName: String!
  genre: String
  status: RequestStatus!
  requestType: RequestType!
  price: Float!
  queuePosition: Int
  dedication: String
  shoutout: String
  submittedAt: AWSTimestamp!
  playedAt: AWSTimestamp
  upvotes: Int!
}

type Queue {
  eventId: ID!
  orderedRequests: [Request!]! # Resolver fetches full request objects
  lastUpdated: AWSTimestamp!
  currentlyPlaying: Request
}

enum EventStatus {
  SCHEDULED
  ACTIVE
  COMPLETED
  CANCELLED
}

enum RequestStatus {
  PENDING
  APPROVED
  PLAYING
  COMPLETED
  VETOED
}

enum RequestType {
  STANDARD
  SPOTLIGHT
  GROUP
}
```

#### Queries

-   \[ \] Implement queries:
    

```
type Query {
  getEvent(eventId: ID!): Event
  listActiveEvents(limit: Int, nextToken: String): EventConnection
  getQueue(eventId: ID!): Queue
  getRequest(requestId: ID!): Request
  getUserRequests(userId: ID!, limit: Int): [Request!]!
  getEventRequests(eventId: ID!, status: RequestStatus): [Request!]!
}
```

-   \[ \] Create resolvers for each query using DynamoDB data source
    
-   \[ \] Implement pagination for list queries
    
-   \[ \] Add authorization rules (performers can see all, audience see own)
    

#### Mutations

-   \[ \] Implement mutations:
    

```
type Mutation {
  createEvent(input: CreateEventInput!): Event
  updateEventStatus(eventId: ID!, status: EventStatus!): Event
  
  createRequest(input: CreateRequestInput!): Request
  updateRequestStatus(requestId: ID!, status: RequestStatus!): Request
  vetoRequest(requestId: ID!, reason: String): Request
  
  reorderQueue(eventId: ID!, orderedRequestIds: [ID!]!): Queue
  upvoteRequest(requestId: ID!): Request
  
  createGroupRequest(input: GroupRequestInput!): GroupRequest
  contributeToGroupRequest(groupRequestId: ID!, amount: Float!): GroupRequest
}
```

-   \[ \] Create resolvers with proper error handling
    
-   \[ \] Add validation logic (e.g., performers can only create events)
    
-   \[ \] Trigger side effects (e.g., `vetoRequest` calls `processRefund` Lambda)
    

#### Subscriptions

-   \[ \] Implement real-time subscriptions:
    

```
type Subscription {
  onQueueUpdate(eventId: ID!): Queue
    @aws_subscribe(mutations: ["reorderQueue", "createRequest"])
  
  onRequestStatusChange(requestId: ID!): Request
    @aws_subscribe(mutations: ["updateRequestStatus", "vetoRequest"])
  
  onNewRequest(eventId: ID!): Request
    @aws_subscribe(mutations: ["createRequest"])
  
  onEventUpdate(eventId: ID!): Event
    @aws_subscribe(mutations: ["updateEventStatus"])
}
```

-   \[ \] Configure subscription filters to reduce unnecessary updates
    
-   \[ \] Test subscription reliability and reconnection logic
    

### Task 3.2: Queue Management Logic

#### Lambda: calculateQueuePosition

-   \[ \] Create Lambda function: `calculateQueuePosition`
    
-   \[ \] Input: `{` eventId: `string; requestId:` string `}`
    
-   \[ \] Algorithm:
    
    1.  \[ \] Fetch current queue from Queues table
        
    2.  \[ \] Fetch request details (type, price, `submittedAt`)
        
    3.  \[ \] Priority rules:
        
        -   Spotlight requests → front of queue (preserve order among spotlights)
            
        -   Standard requests → FIFO within same price tier
            
        -   Group requests → enter when fully funded
            
    4.  \[ \] Calculate position based on rules
        
    5.  \[ \] Return position number
        
-   \[ \] Trigger: Called automatically when request created/updated
    
-   \[ \] Update request's `queuePosition` in Requests table
    

#### Lambda: reorderQueueHandler

-   \[ \] Create Lambda function: `reorderQueueHandler`
    
-   \[ \] Triggered by AppSync mutation `reorderQueue`
    
-   \[ \] Authorization: Only event performer can reorder
    
-   \[ \] Implementation:
    
    1.  \[ \] Validate performer owns event
        
    2.  \[ \] Update Queues table with new order
        
    3.  \[ \] Recalculate `queuePosition` for all affected requests
        
    4.  \[ \] Trigger AppSync subscription `onQueueUpdate`
        
    5.  \[ \] Return updated queue
        
-   \[ \] Add optimistic locking to prevent concurrent updates
    

### Task 3.3: Queue Display Components

#### Performer Queue View (Web + Mobile)

-   [x] Create `PerformerQueueView` component
    
-   \[ \] Layout:
    
    -   \[ \] Top: Currently playing card (large, prominent)
        
    -   \[ \] Below: Next 3 songs (medium size, "Coming Up" indicator)
        
    -   \[ \] Scrollable list: All queued requests (small cards)
        
<<<<<<< HEAD
-   \[ \] Card design:    
=======
-   \[ \] Card design:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
  ┌─────────────────────────────────────┐
  │ [Song Title]                 [$] │
  │ [Artist Name]                       │
  │ [User Name] · [Tier Badge]          │
  │ [Dedication preview...]             │
  │                                     │
  │ [Accept] [Reorder] [Veto]           │
  └─────────────────────────────────────┘
```

-   \[ \] Color coding:
    
    -   \[ \] Spotlight: Red border/background (`#ff1744`)
        
    -   \[ \] Standard: Blue border (`#00d9ff`)
        
<<<<<<< HEAD
    -   \[ \] Group: Purple border (`#9d00ff`)        
=======
    -   \[ \] Group: Purple border (`#9d00ff`)
        
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
-   \[ \] Drag-to-reorder functionality (web: drag-and-drop, mobile: long-press)
    
-   \[ \] Swipe actions on mobile:
    
    -   \[ \] Swipe left: Veto
        
    -   \[ \] Swipe right: Mark as playing
        
-   \[ \] Real-time updates via AppSync subscription
    
-   \[ \] Optimistic UI updates (immediate visual feedback, revert on failure)
    

#### Audience Queue View (Web + Mobile)

-   [x] Create `AudienceQueueView` component
    
-   \[ \] Show own requests prominently at top
    
<<<<<<< HEAD
-   \[ \] Display queue position with circular progress indicator:    
=======
-   \[ \] Display queue position with circular progress indicator:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
  Current position: 3 of 12
  ◉━━━━━━━━━○ (25% complete)
  Estimated wait: 15 minutes
```

-   \[ \] List all queued songs (anonymized or with names based on settings)
    
-   \[ \] Highlight user's own request with border
    
-   \[ \] Show "Currently Playing" banner at top
    
-   [x] Upvote button next to each request (heart icon)
    
-   \[ \] Subscribe to `onQueueUpdate` for real-time changes
    
-   \[ \] Pull-to-refresh on mobile
    

### Task 3.4: Request Status Tracking

-   \[ \] Create `RequestStatusTracker` component
    
-   \[ \] Status flow visualization:
    

```
  Pending → Approved → Playing → Completed
                     ↘ Vetoed (refunded)
```

-   \[ \] Visual indicator for each status:
    
    -   \[ \] Pending: Yellow dot, "In Queue"
        
    -   \[ \] Approved: Blue dot, "Coming Up"
        
    -   \[ \] Playing: Green pulsing dot, "Now Playing"
        
    -   \[ \] Completed: Green checkmark
        
<<<<<<< HEAD
    -   \[ \] Vetoed: Red X, "Refunded"        
=======
    -   \[ \] Vetoed: Red X, "Refunded"
        
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
-   \[ \] Push notification triggers:
    
    -   \[ \] Position moves up (every 5 positions)
        
    -   \[ \] Coming up next (3 songs away)
        
    -   \[ \] Now playing (song started)
        
    -   \[ \] Completed (song finished)
        
    -   \[ \] Vetoed (with refund notification)
        
-   \[ \] Subscribe to `onRequestStatusChange` subscription
    

## PHASE 4: PERFORMER FEATURES

### Task 4.1: Event Creation & Management

#### Event Creation Screen

-   \[ \] Create `CreateEventScreen` component (web + mobile)
    
-   \[ \] Form fields:
    
    -   \[ \] Venue name (text input)
        
    -   \[ \] Venue address (Google Places autocomplete)
        
    -   \[ \] Event date (date picker)
        
    -   \[ \] Start time and end time (time pickers)
        
    -   \[ \] Event type (dropdown: Club Night, Wedding, Private Party, Festival)
        
    -   \[ \] Base price per request (ZAR, min: R10, suggested: R30-R50)
        
    -   \[ \] Request cap per hour (slider: 5-30, default: 15)
        
    -   \[ \] Spotlight slots per 15min block (dropdown: 0-3, default: 1)
        
    -   \[ \] Allow dedications (toggle)
        
    -   \[ \] Allow group requests (toggle)
        
-   \[ \] Generate QR code automatically:
    
    -   \[ \] Use QR code library (`qrcode.react` for web, `react-native-qrcode-svg` for mobile)
        
    -   \[ \] QR data: `beatmatchme://event/{eventId}`
        
    -   \[ \] Upload QR image to S3
        
    -   \[ \] Store URL in Events table
        
-   \[ \] Call AppSync mutation `createEvent`
    
-   \[ \] Navigate to event dashboard on success
    

#### Event Dashboard

-   \[ \] Create `EventDashboard` component
    
-   \[ \] Sections:
    
    1.  \[ \] **Live Stats Card**
        
        -   Current queue size
            
        -   Total requests tonight
            
        -   Total revenue (animated counter)
            
        -   Active upvotes
            
    2.  \[ \] **Queue Management**
        
        -   Embed `PerformerQueueView` component
            
        -   Quick actions: Pause queue, Clear completed, End event
            
    3.  \[ \] **Revenue Tracker**
        
        -   Real-time earnings counter with currency animation
            
<<<<<<< HEAD
        -   Milestone celebrations (confetti at R500, R1000, R2000)            
=======
        -   Milestone celebrations (confetti at R500, R1000, R2000)
            
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
        -   Breakdown: Total charged, refunds, net earnings
            
    4.  \[ \] **Analytics Snapshot**
        
        -   Top requested genres (pie chart)
            
        -   Request rate over time (line graph)
            
        -   Average wait time
            
-   \[ \] Real-time updates from AppSync subscriptions
    
-   \[ \] Share QR code button (download or share link)
    

#### Event Control Actions

-   \[ \] Implement event status controls:
    
    -   \[ \] Start Event: Change status to "active"
        
    -   \[ \] Pause Queue: Stop accepting new requests temporarily
        
    -   \[ \] Resume Queue: Re-enable requests
        
    -   \[ \] End Event: Change status to "completed", process payouts
        
-   \[ \] Confirmation modals for destructive actions
    
-   \[ \] Handle edge cases (e.g., end event with pending requests → offer bulk refund)
    

### Task 4.2: Veto System Implementation

#### Veto Action Flow

-   \[ \] Add "Veto" button to each request card in `PerformerQueueView`
    
-   \[ \] On veto click:
    
    1.  \[ \] Show confirmation modal: "Veto this request? User will be refunded automatically."
        
    2.  \[ \] Optional: Text input for veto reason (sent to user)
        
    3.  \[ \] Call AppSync mutation `vetoRequest`
        
    4.  \[ \] Mutation resolver:
        
        -   Update request status to "vetoed"
            
        -   Invoke `processRefund` Lambda asynchronously
            
        -   Trigger `onRequestStatusChange` subscription
            
    5.  \[ \] Show success toast: "Request vetoed, refund processed"
        
    6.  \[ \] Remove request from queue
        
    7.  \[ \] Send push notification to user
        

#### Veto Analytics

-   \[ \] Track veto rate in `EventDashboard`
    
-   \[ \] Display warning if veto rate > 20%: "High veto rate may discourage requests"
    
-   \[ \] Show veto reasons in post-event analytics
    
-   \[ \] Calculate refund impact on net revenue
    

### Task 4.3: Dynamic Pricing Controls

#### Pricing Dashboard

-   \[ \] Create `PricingControls` component
    
-   \[ \] Base price adjustment:
    
    -   \[ \] Slider: R10 - R200
        
    -   \[ \] Real-time preview of impact
        
    -   \[ \] Apply immediately to new requests
        
-   \[ \] Surge pricing toggle:
    
    -   \[ \] Enable/disable surge multiplier
        
    -   \[ \] Automatic surge based on demand (1.5x if queue > 20 requests)
        
    -   \[ \] Manual surge override
        
-   \[ \] Spotlight slot pricing:
    
    -   \[ \] Auto-calculated as 2.5x base price
        
    -   \[ \] Manual override option
        
    -   \[ \] Availability toggle (sold out mode)
        
-   \[ \] Add-on pricing:
    
    -   \[ \] Dedication price (default: +R10)
        
    -   \[ \] Shout-out price (default: +R15)
        
-   \[ \] Save pricing rules to Events table `settings`
    

#### Real-Time Price Display

-   \[ \] Show current prices on audience request screen
    
-   \[ \] Update prices dynamically if performer changes settings
    
-   \[ \] Display surge indicator if active: "⚡ High demand pricing"
    

### Task 4.4: Tracklist Management

#### Tracklist Upload

-   \[ \] Create `TracklistManager` component (web only initially)
    
-   \[ \] Upload methods:
    
    -   \[ \] Manual entry form (song title, artist, genre)
        
    -   \[ \] CSV import (columns: title, artist, genre, duration)
        
    -   \[ \] Spotify playlist import (future phase)
        
-   \[ \] Store tracklist in DynamoDB:
    
    -   \[ \] Create `Songs` table (schema TBD, link to `performerId`)
        
-   \[ \] Bulk actions:
    
    -   \[ \] Delete multiple songs
        
    -   \[ \] Edit genre tags
        
    -   \[ \] Search and filter
        
-   \[ \] Export tracklist to CSV
    

#### Pre-Approved Requests

-   \[ \] Audience only sees songs in performer's tracklist
    
-   \[ \] Search functionality filters by:
    
    -   \[ \] Song title
        
    -   \[ \] Artist name
        
    -   \[ \] Genre
        
    -   \[ \] Mood tags (added by performer)
        
-   \[ \] Display message if song not in library: "Request a custom song for +R20" (future feature)
    

## PHASE 5: AUDIENCE FEATURES

### Task 5.1: Event Discovery & Join Flow

#### Event Discovery Screen

-   \[ \] Create `EventDiscoveryScreen` component
    
-   \[ \] Discovery methods:
    
    1.  \[ \] **QR Code Scanner**
        
        -   \[ \] Camera permission request
            
        -   \[ \] Scan QR code from venue
            
        -   \[ \] Parse `beatmatchme://event/{eventId}`
            
        -   \[ \] Fetch event details from AppSync
            
        -   \[ \] Show event preview with join button
            
    2.  \[ \] **Nearby Events (GPS-based)**
        
        -   \[ \] Location permission request
            
        -   \[ \] Query events within 5km radius
            
        -   \[ \] Show list with distance and start time
            
        -   \[ \] Filter by event type
            
    3.  \[ \] **Manual Event Code Entry**
        
        -   \[ \] 6-character code input
            
        -   \[ \] Lookup event by code
            
-   \[ \] Event Preview Card:
    

```
  ┌─────────────────────────────────┐
  │ [Venue Name]                    │
  │ [DJ/Performer Name]             │
  │ 📍 [Location]                   │
  │ 🕒 [Start Time]                 │
  │ 💰 Requests from R30            │
  │                                 │
  │ [Join Event]                    │
  └─────────────────────────────────┘
```

-   \[ \] On join: Navigate to `EventLobby` screen
    
-   \[ \] Store joined event in local state (persist across app restarts)
    

#### Event Lobby (Main Audience View)

-   \[ \] Create `EventLobby` screen
    
-   \[ \] Tabs/sections:
    
    1.  \[ \] **Request** - Song selection and submission
        
    2.  \[ \] **Queue** - `AudienceQueueView`
        
    3.  \[ \] **Vibe** - Event stats and social features
        
    4.  \[ \] **Profile** - User stats and achievements
        
-   \[ \] Persistent bottom navigation for tabs
    
-   \[ \] Subscribe to event updates on mount
    

### Task 5.2: Song Request Flow

#### Song Selection Screen

-   [x] Create `SongSelectionScreen` component
    
-   [x] Display performer's tracklist
    
-   [x] Search bar with debounced filtering
    
-   [x] Genre filter chips (tap to filter)
    
-   [x] Song card design:
    

```
  ┌─────────────────────────────────┐
  │ [Song Title]                    │
  │ [Artist Name]                   │
  │ [Genre] · [Duration]            │
  │                                 │
  │ ❤️ [Upvotes]   [Request]   │
  └─────────────────────────────────┘
```

<<<<<<< HEAD
-   [x] "Feeling Lucky" button (component exists in ExploratoryFeatures.tsx)
    
    -   [x] random song selection        
-   [x] Recently requested songs indicator (greyed out if in queue)
    
-   [x] Tap song → navigate to `RequestConfirmation` screen
=======
-   \[ \] "Feeling Lucky" button
    
    -   random song selection
        
-   \[ \] Recently requested songs indicator (greyed out if in queue)
    
-   \[ \] Tap song → navigate to `RequestConfirmation` screen
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
    

#### Request Confirmation Screen

-   [x] Create `RequestConfirmation` component
    
-   [x] Display:
    
    -   [x] Song details (title, artist, album art if available)
        
    -   [x] Current queue position if requested
        
    -   [x] Estimated wait time (calculate based on average song duration × position)
        
-   [x] Price breakdown:
    
    -   [x] Base price: R\[X\]
        
    -   [x] Dedication: +R\[Y\] (optional)
        
    -   [x] Shout-out: +R\[Z\] (optional)
        
    -   [x] **Total: R\[Total\]**
        
-   [x] Request type selector:
    
    -   [x] **Standard Request** (default)
        
        -   [x] Normal queue position
            
        -   [x] Base price
            
    -   [x] **Spotlight Slot** (if available)
        
        -   [x] Jump to front of queue
            
        -   [x] 2.5x price
            
        -   [x] Show remaining slots: "2 of 3 left this block"
            
    -   [x] **Group Request**
        
        -   [x] Split cost with friends
            
        -   [ ] Navigate to `GroupRequestScreen`
            
-   [x] Add-ons section:
    
    -   [x] Dedication toggle + text input (140 characters)
        
    -   [x] Shout-out toggle + text input (60 characters)
        
    -   [x] Character counter and price update
        
-   [x] "Hold to Confirm" button:
    
    -   [x] Circular progress animation (hold for 2 seconds)
        
    -   [ ] Haptic feedback on completion
        
    -   [x] Prevent accidental taps
        
-   \[ \] On confirm:
    
    1.  \[ \] Call `processPayment` Lambda via AppSync mutation
        
    2.  \[ \] Show payment processing modal
        
    3.  \[ \] Handle 3D Secure if required
        
    4.  \[ \] On success: Show success animation + navigate to `RequestTracking`
        
    5.  \[ \] On failure: Show error, offer retry
        

#### Request Tracking View

-   [x] Create `RequestTrackingView` component
    
-   \[ \] Display current request status prominently:
    

```
  🎵 Your Request
  [Song Title] - [Artist]
  
  Status: In Queue
  Position: 7 of 15
  ◉━━━━━━━○ (40% complete)
  
  Estimated wait: ~18 minutes
  
  [View Full Queue]
```

-   \[ \] Real-time position updates via subscription
    
-   \[ \] Status badges:
    
    -   \[ \] Pending: Yellow "⏳ In Queue"
        
    -   \[ \] Approved: Blue "✓ Confirmed"
        
    -   \[ \] Coming Up: Green "🔜 Coming Up Next!"
        
    -   \[ \] Playing: Animated "🎶 Now Playing!"
        
    -   \[ \] Completed: "✓ Played at \[time\]"
        
<<<<<<< HEAD
    -   \[ \] Vetoed: "❌ Refunded" + reason        
=======
    -   \[ \] Vetoed: "❌ Refunded" + reason
        
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
-   \[ \] Push notifications at key moments:
    
    -   \[ \] Moved up 5 positions
        
    -   \[ \] Coming up (3 songs away)
        
    -   \[ \] Now playing
        
    -   \[ \] Completed or vetoed
        
-   \[ \] Quick actions:
    
    -   \[ \] Upvote my request (if others can see it)
        
    -   \[ \] Share "I requested \[song\]!" to social media
        
    -   \[ \] Add another request
        

### Task 5.3: Group Request System

#### Group Request Creation

-   [x] Create `GroupRequestScreen` component
    
-   \[ \] Flow:
    
    1.  \[ \] Display song details
        
    2.  \[ \] Show total cost (can be split among multiple people)
        
    3.  \[ \] "Set Target Amount" input (defaults to song price)
        
    4.  \[ \] "How many people?" input (defaults to 2)
        
    5.  \[ \] Calculate per-person cost: R\[total / people\]
        
    6.  \[ \] "Create Group Request" button
        
-   \[ \] On create:
    
    -   \[ \] Call AppSync mutation `createGroupRequest`
        
    -   \[ \] Generate shareable link: `beatmatchme://group/{groupRequestId}`
        
    -   \[ \] Show share sheet (WhatsApp, SMS, Copy Link)
        
    -   \[ \] Navigate to `GroupRequestLobby`
        

#### Group Request Lobby

-   [x] Create `GroupRequestLobby` component
    
-   \[ \] Display:
    

```
  🎵 Group Request
  [Song Title] - [Artist]
  
  Progress: R[current] of R[target]
  ████████░░ 80%
  
  Contributors:
  • [Name] - R[amount] ✓
  • [Name] - R[amount] ✓
  • [You] - R[amount] (pending)
  • Waiting for 1 more...
  
  [Contribute] [Share Link] [Cancel]
```

-   \[ \] Real-time updates as people join
    
-   \[ \] Countdown timer: 15 minutes to fund
    
-   \[ \] When fully funded:
    
    -   \[ \] Automatically submit request
        
    -   \[ \] Charge all contributors
        
    -   \[ \] Show success animation
        
    -   \[ \] Navigate to `RequestTracking`
        
-   \[ \] If expired:
    
    -   \[ \] Refund all contributors
        
    -   \[ \] Show expiration message
        
    -   \[ \] Offer to restart
        

#### Join Group Request

-   [x] Create `JoinGroupRequestScreen` component
    
-   \[ \] Accessed via shareable link
    
-   \[ \] Display:
    
    -   \[ \] Song details
        
    -   \[ \] Initiator name
        
    -   \[ \] Current funding progress
        
    -   \[ \] Required contribution amount
        
-   \[ \] "Contribute R\[X\]" button
    
-   \[ \] Custom contribution input (min: R10)
    
-   \[ \] Process payment on contribute
    
-   \[ \] Add to contributors list in real-time
    
-   \[ \] Show success message when joined
    

### Task 5.4: Social Features

#### Dedication Wall

-   \[ \] Create `DedicationWall` component
    
-   \[ \] Display all dedications for current event:
    

```
  ┌─────────────────────────────────┐
  │ [User Avatar] [Name] · [Badge]  │
  │ [Song] - [Artist]               │
  │ "Happy Birthday Sarah! 🎉"      │
  │                                 │
  │ ❤️ 23  · [Time ago]             │
  └─────────────────────────────────┘
```

-   \[ \] Infinite scroll (paginated)
    
-   \[ \] Heart reaction button:
    
    -   \[ \] Tap to add/remove heart
        
    -   \[ \] Real-time heart count updates
        
    -   \[ \] Haptic feedback on tap
        
-   \[ \] Filter options:
    
    -   \[ \] All dedications
        
    -   \[ \] Friends only
        
    -   \[ \] Most hearted
        
<<<<<<< HEAD
-   \[ \] Share individual dedication to social media    
=======
-   [x] Share individual dedication to social media
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

#### Upvote System

-   [x] Add upvote button to each queue item (heart icon)
    
-   [x] On tap:
    
    -   [x] Optimistic UI update (heart fills, count +1)
        
    -   [ ] Call AppSync mutation `upvoteRequest`
        
    -   [ ] Haptic feedback
        
    -   [x] If already upvoted: Remove upvote
        
<<<<<<< HEAD
-   \[ \] Display upvote count on request cards    
-   \[ \] "Feeling This" ripple effect:
=======
-   [x] Display upvote count on request cards
    
-   [ ] "Feeling This" ripple effect:
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
    
    -   [ ] Long-press heart → send appreciation pulse to DJ
        
    -   [ ] Concentric rings animation emanates from button
        
    -   [ ] Aggregate mood meter on performer dashboard
        

#### Friend Activity

<<<<<<< HEAD
-   \[ \] Implement friend connections:
    
    -   \[ \] Search users by name/phone
        
    -   \[ \] Send friend requests
        
    -   \[ \] Accept/decline requests
        
    -   \[ \] Friends list in profile        
-   \[ \] Show friends at same event:
=======
-   [x] Implement friend connections:
    
    -   [x] Search users by name/phone
        
    -   [x] Send friend requests
        
    -   [x] Accept/decline requests
        
    -   [x] Friends list in profile
        
-   [x] Show friends at same event:
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
    

```
  👥 Friends Here (3)
  [Avatar] [Avatar] [Avatar]
```

-   [ ] Tap to see friend's requests
    
-   [ ] Synchronized queue view with friend indicators:
    
    -   [ ] Your requests: Blue border
        
    -   [ ] Friends' requests: Purple tag "👥 \[Friend Name\]"
        
-   [ ] Push notification when friend makes request:
    
    -   [ ] "Sarah just requested \[song\]!"
        
    -   [ ] Tap to view in queue
        
-   [ ] Subscribe to `onFriendActivity` subscription
    

## PHASE 6: GAMIFICATION & ACHIEVEMENTS

### Task 6.1: Achievement System Core

#### Achievement Definitions

-   [x] Define achievement types in Achievements table:
    

```
const ACHIEVEMENTS = {
  FIRST_REQUEST: {
    id: 'first_request',
    name: 'First Request',
    description: 'Make your first song request',
    tier: 'bronze',
    icon: '🎵',
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Participate in 5 group requests',
    tier: 'silver',
    icon: '🦋',
  },
  VIBE_CURATOR: {
    id: 'vibe_curator',
    name: 'Vibe Curator',
    description: 'Get 50 upvotes on your requests',
    tier: 'gold',
    icon: '⭐',
  },
  TRENDSETTER: {
    id: 'trendsetter',
    name: 'Trendsetter',
    description: 'Request a song that gets 20+ upvotes',
    tier: 'gold',
    icon: '🔥',
  },
  PLATINUM_DJ: {
    id: 'platinum_dj',
    name: 'Platinum DJ',
    description: 'Reach top 1% of requesters at venue',
    tier: 'platinum',
    icon: '💎',
  },
  GENRE_EXPLORER: {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Request songs from 10 different genres',
    tier: 'silver',
    icon: '🌍',
  },
  DEDICATION_KING: {
    id: 'dedication_king',
    name: 'Dedication King/Queen',
    description: 'Send 25 dedications',
    tier: 'gold',
    icon: '👑',
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Attend 10 events',
    tier: 'silver',
    icon: '🦉',
  },
};
```

#### Lambda: checkAchievements

-   \[ \] Create Lambda function: `checkAchievements`
    
-   \[ \] Triggered by DynamoDB Streams on:
    
    -   \[ \] Requests table (new request completed)
        
    -   \[ \] Achievements table (stats updated)
        
-   \[ \] Logic:
    
    1.  \[ \] Fetch user's current achievements and stats
        
    2.  \[ \] Check all achievement criteria
        
    3.  \[ \] For each newly unlocked achievement:
        
        -   Add to user's badges array
            
        -   Update unlock timestamp
            
        -   Send push notification
            
        -   Trigger celebration animation
            
    4.  \[ \] Update user tier if thresholds crossed
        
    5.  \[ \] Return list of newly unlocked achievements
        
-   \[ \] Idempotency: Never unlock same achievement twice
    

### Task 6.2: Achievement UI Components

#### Achievement Unlock Animation

-   [x] Create `AchievementUnlockModal` component
    
-   [x] Design:
    

```
  ┌─────────────────────────────────┐
  │                                 │
  │         ✨ [Icon] ✨          │
  │                                 │
  │       [Achievement Name]        │
  │         [Tier Badge]            │
  │                                 │
  │         [Description]           │
  │                                 │
  │      [Share] [Close]            │
  └─────────────────────────────────┘
```

-   [x] Animations:
    
    -   [x] Fade in with scale effect
        
    -   [x] Confetti burst (bronze: few particles, platinum: explosion)
        
    -   [x] Badge shimmer effect
        
    -   [x] Haptic feedback (success pattern)
        
-   [x] Auto-dismiss after 5 seconds or tap to close
    
-   \[ \] Share to social media option
    

#### Achievements Gallery

-   [x] Create `AchievementsGallery` component (in user profile)
    
-   [x] Grid layout showing all achievements
    
-   [x] Unlocked: Full color + icon
    
-   [x] Locked: Grayscale + lock icon + "???" name
    
-   [x] Progress bars for incremental achievements:
    

```
  🦋 Social Butterfly
  ████░░░░░░ 3/5 group requests
```

-   [x] Tap achievement to see details and share
    
-   [x] Filter by:
    
    -   [x] All
        
    -   [x] Unlocked
        
    -   [x] In Progress
        
    -   [x] Locked
        
-   [x] Sort by:
    
    -   [x] Rarity (platinum → bronze)
        
    -   [x] Recently unlocked
        
    -   [x] Alphabetical
        

#### Profile Badge Display

-   \[ \] Show highest tier badge prominently on user profile:
    
    -   \[ \] Circular badge with tier color
        
    -   \[ \] Animated shimmer for platinum
        
    -   \[ \] Badge name below: "Gold Curator"
        
-   \[ \] Display badge next to username in:
    
    -   \[ \] Queue listings
        
    -   \[ \] Dedication wall
        
    -   \[ \] Group request contributors
        
    -   \[ \] Leaderboards
        

### Task 6.3: Leaderboard System

#### Venue Leaderboards

-   [x] Create `Leaderboard` component
    
-   \[ \] Types:
    
    1.  \[ \] **Tonight's Top Requesters**
        
        -   Users with most requests at current event
            
        -   Real-time updates
            
        -   Top 10 only
            
    2.  \[ \] **All-Time Venue Champions**
        
        -   Users with most successful requests at venue (all events)
            
        -   Updated daily
            
        -   Top 20
            
    3.  \[ \] **Genre Masters**
        
        -   Top requester per genre at venue
            
        -   Updated weekly
            
-   \[ \] Display format:
    

```
  🏆 Tonight's Top Requesters
  
  1. 👤 [Name] [Badge] · [Count] requests
  2. 👤 [Name] [Badge] · [Count] requests
  3. 👤 [Name] [Badge] · [Count] requests
  ...
  
  Your rank: #12
```

-   \[ \] Highlight current user's position
    
-   \[ \] Tap user to see their profile/stats
    
-   \[ \] Refresh every 30 seconds
    

#### Global Leaderboards

-   \[ \] Create global leaderboards (across all venues):
    
    1.  \[ \] Most events attended
        
    2.  \[ \] Most requests fulfilled
        
    3.  \[ \] Highest upvote count
        
    4.  \[ \] Most dedications sent
        
-   \[ \] Accessible from Profile tab
    
-   \[ \] Pagination (load more on scroll)
    
-   \[ \] Cache in ElastiCache, refresh hourly
    

## PHASE 7: REAL-TIME EXPERIENCE & ANIMATIONS

### Task 7.1: Constellation Navigation System

#### Navigation Architecture

-   [x] Create `ConstellationNav` component (mobile only)
    
-   \[ \] Design concept: Radial menu with items orbiting thumb-reachable center
    
-   \[ \] Item positions (degrees from center):
    
    -   \[ \] 0°: Request Song (center, largest)
        
    -   \[ \] 60°: Upvote Queue
        
    -   \[ \] 120°: My Achievements
        
    -   \[ \] 180°: Group Request
        
    -   \[ \] 240°: Dedications
        
    -   \[ \] 300°: Event Stats
        
-   \[ \] Dynamic behavior:
    
    -   \[ \] Items "gravitate" closer based on usage frequency
        
    -   \[ \] Unused items fade to outer orbit
        
    -   \[ \] Most popular venue action moves toward center
        
-   \[ \] Gestures:
    
    -   \[ \] Tap icon: Navigate to feature
        
    -   \[ \] Long-press center: Expand all options
        
    -   \[ \] Swipe outward from center: Fling menu item to activate
        
-   \[ \] Social intelligence indicators:
    
    -   \[ \] Badge count on Request icon: Total requests tonight
        
    -   \[ \] Upvote counter on Upvote icon: "23 people vibing"
        
    -   \[ \] Friend avatars orbit Group Request icon
        

#### Implementation

-   \[ \] Use React Native Gesture Handler for touch detection
    
-   \[ \] `Animated.Value` for smooth position transitions
    
-   \[ \] Calculate positions with trigonometry:
    

```
const angle = (index * 60 * Math.PI) / 180;
const x = centerX + radius * Math.cos(angle);
const y = centerY + radius * Math.sin(angle);
```

-   \[ \] Haptic feedback on icon tap (light)
    
-   \[ \] Scale animation on press (1.0 → 1.2 → 1.0)
    
-   \[ \] Store usage frequency in AsyncStorage
    
-   \[ \] Recalculate positions on app launch
    

<<<<<<< HEAD
### Task 7.2: Audio-Reactive Visualizer#### Web Implementation (Web Audio API)
=======
### Task 7.2: Audio-Reactive Visualizer

#### Web Implementation (Web Audio API)
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

-   [x] Create `AudioVisualizer` component
    
-   \[ \] Request microphone access (for ambient audio sampling)
    
-   \[ \] Initialize Web Audio API:
    

```
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
```

-   \[ \] Continuous analysis loop (60fps):
    

```
analyser.getByteFrequencyData(dataArray);
// Map frequency bins to visual elements
const bass = average(dataArray.slice(0, 10));
const mid = average(dataArray.slice(10, 50));
const treble = average(dataArray.slice(50, 128));
```

-   \[ \] Visual effects:
    
    -   \[ \] Background gradient shifts based on dominant frequency
        
    -   \[ \] Particle burst on kick drum detection (bass spike)
        
    -   \[ \] Edge glow intensity follows overall volume
        
    -   \[ \] Circular waveform on screen periphery
        
-   \[ \] Throttle to 30fps on low-end devices
    
-   \[ \] Disable on reduced motion setting
    

#### Mobile Implementation (iOS/Android)

-   \[ \] Use `expo-av` or `react-native-audio` library
    
-   \[ \] Request microphone permission
    
-   \[ \] Sample audio at 30fps
    
-   \[ \] Map to gradient color transitions:
    

```
const bassColor = interpolateColor(bass, [0, 255], ['#9d00ff', '#ff006e']);
const midColor = interpolateColor(mid, [0, 255], ['#00d9ff', '#ffbe0b']);
```

-   \[ \] Use `LinearGradient` component with animated colors
    
-   \[ \] Performance: Use native driver for animations
    
-   \[ \] Fallback: Static gradient if permission denied
    

#### Gradient Color System

<<<<<<< HEAD
-   \[ \] Define 5 emotional state gradients:    
=======
-   [x] Define 5 emotional state gradients:
    
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

```
const GRADIENTS = {
  BUILDING_ENERGY: ['#9d00ff', '#00d9ff'], // Violet → Cyan
  PEAK_HYPE: ['#ff006e', '#ffbe0b'], // Magenta → Gold
  INTIMATE_MOMENT: ['#ff1744', '#ff6f00'], // Deep Rose → Warm Amber
  COOL_DOWN: ['#02f2e2', '#80deea'], // Teal → Ice Blue
  EUPHORIA: ['#ff0080', '#ff8c00', '#ffd700', '#00ff00', '#00bfff', '#8a2be2'], // Rainbow
};
```

-   \[ \] Transition between gradients based on tempo and energy
    
-   \[ \] Never repeat exact same gradient (add random offset to hue)
    
-   \[ \] 1-in-50 chance: Ultra-rare northern lights variant
    

<<<<<<< HEAD
### Task 7.3: Haptic Feedback System#### Haptic Patterns (iOS & Android)
=======
### Task 7.3: Haptic Feedback System

#### Haptic Patterns (iOS & Android)
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

-   [x] Define feedback types using Haptics API:
    

```
const HAPTIC_PATTERNS = {
  LIGHT_TAP: 'impactLight', // Button press
  MEDIUM_TAP: 'impactMedium', // Queue position change
  HEAVY_TAP: 'impactHeavy', // Request accepted
  SUCCESS: ['medium', 'light', 'light'], // Request completed (ascending)
  ERROR: ['heavy', 'heavy'], // Veto notification (two sharp taps)
  NOTIFICATION: 'notificationSuccess', // Coming up alert
  BEAT_PULSE: 'impactLight', // Rhythm sync (repeating)
};
```

-   [x] Implement haptic triggers:
    
    -   [x] Button/icon taps: `LIGHT_TAP`
        
    -   [x] Queue update: `MEDIUM_TAP`
        
    -   [x] Payment success: `SUCCESS` pattern
        
    -   [x] Veto notification: `ERROR` pattern
        
    -   [x] Request playing: `NOTIFICATION`
        
-   \[ \] Beat pulse synchronization:
    
    -   \[ \] Detect kick drum beats from audio analysis
        
    -   \[ \] Trigger `BEAT_PULSE` on each beat
        
    -   \[ \] Max frequency: 2 per second (avoid annoyance)
        
-   \[ \] User setting to adjust intensity (off, low, medium, high)
    
-   \[ \] Disable haptics on reduced motion setting
    

#### Gesture Guardrails

-   \[ \] Implement edge glow indicators for swipe zones:
    
    -   \[ \] Left edge: Cyan glow when swipe left available
        
    -   \[ \] Right edge: Magenta glow when swipe right available
        
    -   \[ \] Top edge: Yellow glow when pull-down available
        
    -   \[ \] Bottom edge: Green glow when swipe up available
        
-   \[ \] Glow triggers when finger enters edge zone (50px from edge)
    
-   \[ \] Fade in animation (300ms)
    
-   \[ \] Haptic light tap when glow appears
    
-   \[ \] First 3 uses: Show tooltip explaining gesture
    

### Task 7.4: Real-Time Notifications

#### Push Notification Setup

-   \[ \] Configure AWS SNS for push notifications
    
-   \[ \] Register device tokens on app launch
    
-   \[ \] Store tokens in Users table
    
-   \[ \] Create Lambda function: `sendPushNotification`
    
    -   \[ \] Input: `{ userId, title, body, data }`
        
    -   \[ \] Fetch user's device tokens
        
    -   \[ \] Send via SNS to APNs (iOS) and FCM (Android)
        
    -   \[ \] Handle delivery failures (remove invalid tokens)
        

#### Notification Types & Triggers

-   \[ \] **Queue Position Update** (every 5 positions)
    

```
  Title: "Your request moved up! 🎵"
  Body: "Now #3 in queue for [Song Title]"
```

```
* [ ] Trigger: On queue reorder + request position change
* [ ] Throttle: Max 1 per 2 minutes per request
```

-   \[ \] **Coming Up Next** (3 songs away)
    

```
  Title: "Your song is coming up! 🔜"
  Body: "[Song Title] will play in ~6 minutes"
```

```
* [ ] Trigger: When `queuePosition` <= 3
* [ ] Send once per request
```

-   \[ \] **Now Playing** (song started)
    

```
  Title: "Your song is playing! 🎶"
  Body: "[Song Title] by [Artist] is now live"
```

```
* [ ] Trigger: Request status → "playing"
* [ ] Play celebration sound
```

-   \[ \] **Request Completed**
    

```
  Title: "Thanks for the vibe! ✓"
  Body: "[Song Title] was played at [time]"
```

```
* [ ] Trigger: Request status → "completed"
* [ ] Prompt: "Rate your experience?"
```

-   \[ \] **Request Vetoed**
    

```
  Title: "Request refunded 💸"
  Body: "[Song Title] couldn't be played. R[amount] refunded."
```

```
* [ ] Trigger: Request status → "vetoed"
* [ ] Include veto reason if provided
* [ ] Action button: "Add to Backup List"
```

-   \[ \] **Friend Activity**
    

```
  Title: "[Friend Name] just requested a song! 👋"
  Body: "[Song Title] by [Artist]"
```

```
* [ ] Trigger: Friend creates request at same event
* [ ] Throttle: Max 1 per 5 minutes per friend
```

-   \[ \] **Milestone Achieved**
    

```
  Title: "Achievement Unlocked! 🏆"
  Body: "You earned [Achievement Name]"
```

```
* [ ] Trigger: `checkAchievements` Lambda detects unlock
* [ ] Deep link to achievement details
```

#### Notification Permissions

-   \[ \] Request permission on first app launch (after onboarding)
    
-   \[ \] Graceful degradation if denied (in-app notifications only)
    
-   \[ \] Settings screen option to re-enable
    
-   \[ \] Notification preferences:
    
    -   \[ \] Queue updates: On/Off
        
    -   \[ \] Friend activity: On/Off
        
    -   \[ \] Milestones: On/Off
        
    -   \[ \] Marketing: On/Off
        

## PHASE 8: ANALYTICS & INSIGHTS

### Task 8.1: Event Analytics for Performers

#### Real-Time Analytics Dashboard

-   [x] Create `PerformerAnalytics` component
    
-   \[ \] Live metrics (updated every 30 seconds):
    

```
  ┌─────────────────────────────────┐
  │ Tonight's Performance           │
  ├─────────────────────────────────┤
  │ 💰 Revenue: R1,245.00           │
  │    ↑ +R350 last hour            │
  │                                 │
  │ 🎵 Requests: 23 total           │
  │    ✓ 20 played · ❌ 3 vetoed    │
  │                                 │
  │ 👥 Audience: 47 unique users    │
  │    🔥 15 active now             │
  │                                 │
  │ ⏱️ Avg Wait: 12 minutes          │
  │    📊 Request Rate: 8/hour      │
  └─────────────────────────────────┘
```

-   \[ \] Data sources:
    
    -   \[ \] Query Transactions table for revenue
        
    -   \[ \] Query Requests table for counts and veto rate
        
    -   \[ \] Query Events table for audience size
        
    -   \[ \] Calculate metrics in real-time
        

#### Genre Breakdown Chart

-   [x] Use Recharts (web) or `react-native-chart-kit` (mobile)
    
-   [x] Pie chart showing:
    
    -   [x] % of requests per genre
        
    -   [x] Color-coded slices
        
    -   [ ] Interactive (tap to see song list)
        
-   [x] Query Requests table, aggregate by `genre`
    

#### Request Rate Timeline

-   [x] Line graph: Requests per 15-minute block
    
-   [x] X-axis: Time blocks
    
-   [x] Y-axis: Request count
    
-   [x] Highlight peak times
    
-   [x] Data source: Requests table, group by `submittedAt`
    

#### Revenue Milestones

-   [x] Animated counter showing current earnings
    
-   [x] Milestone markers: R500, R1000, R2000, R5000
    
<<<<<<< HEAD
-   \[ \] Confetti animation when milestone reached    
-   \[ \] Progress bar to next milestone
=======
-   [x] Confetti animation when milestone reached
    
-   [x] Progress bar to next milestone
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
    
-   [x] Projected end-of-event earnings (based on current rate)
    

### Task 8.2: Historical Analytics

#### Post-Event Summary

-   \[ \] Generate after event status → "completed"
    
-   \[ \] Lambda function: `generateEventSummary`
    
    -   \[ \] Input: `{ eventId }`
        
    -   \[ \] Query all event data
        
    -   \[ \] Calculate totals and insights
        
    -   \[ \] Store summary in S3 as JSON
        
    -   \[ \] Send email to performer
        
-   \[ \] Summary includes:
    

```
  Event: [Venue Name] on [Date]
  Duration: [Hours]
  
  Revenue:
  - Gross: R[X]
  - Refunds: R[Y]
  - Net: R[Z]
  - Platform Fee: R[15% of Z]
  - Your Payout: R[85% of Z]
  
  Requests:
  - Total: [Count]
  - Played: [Count]
  - Vetoed: [Count] ([%])
  
  Audience:
  - Unique Users: [Count]
  - Repeat Requesters: [Count]
  - New Users: [Count]
  
  Top Songs:
  1. [Song] - [# of upvotes]
  2. [Song] - [# of upvotes]
  3. [Song] - [# of upvotes]
  
  Top Genres:
  1. [Genre] - [%]
  2. [Genre] - [%]
  3. [Genre] - [%]
  
  Peak Times:
  - Most requests: [Time block]
  - Highest revenue: [Time block]
```

#### Performance Trends (Last 30 Days)

-   \[ \] Create `TrendsView` component
    
-   \[ \] Metrics over time:
    
    -   \[ \] Average revenue per event (line graph)
        
    -   \[ \] Average requests per event (line graph)
        
    -   \[ \] Veto rate trend (line graph with warning if increasing)
        
    -   \[ \] Audience growth (bar chart)
        
-   \[ \] Data source: Query Events table for last 30 days
    
-   \[ \] Cache in ElastiCache, refresh daily
    

#### Venue Insights

-   \[ \] "Your crowd loves transitions between \[Genre A\] and \[Genre B\]"
    
    -   \[ \] Analyze song sequence patterns
        
    -   \[ \] Identify frequent genre transitions
        
    -   \[ \] Use Kinesis Analytics for pattern detection
        
-   \[ \] "Requests peak between \[Time\] and \[Time\] at this venue"
    
    -   \[ \] Aggregate requests by hour across all events
        
    -   \[ \] Find peak hour
        
-   \[ \] "Songs by \[Artist\] have \[%\] acceptance rate"
    
    -   \[ \] Calculate play rate vs. veto rate per artist
        
    -   \[ \] Highlight top accepted artists
        

### Task 8.3: Audience Personal Analytics

#### Musical Journey Timeline

-   \[ \] Create `MusicalJourneyView` component
    
-   \[ \] Vertical timeline showing all past requests:
    

```
  ┌─────────────────────────────────┐
  │ Your Musical Journey            │
  ├─────────────────────────────────┤
  │ ● [Date] · [Venue]              │
  │  [Song] - [Artist]              │
  │   ✓ Played · ❤️ 12 upvotes      │
  │                                 │
  │ ● [Date] · [Venue]              │
  │  [Song] - [Artist]              │
  │   ❌ Vetoed · 💸 Refunded       │
  │                                 │
  │ ... (infinite scroll)           │
  └─────────────────────────────────┘
```

-   \[ \] Filter by:
    
    -   \[ \] All requests
        
    -   \[ \] Played only
        
    -   \[ \] Specific venue
        
    -   \[ \] Date range
        
-   \[ \] Tap song to see details (queue position, wait time, dedications)
    

#### Genre Exploration Wheel

-   \[ \] Create `GenreWheelView` component
    
-   \[ \] Circular visualization:
    
    -   \[ \] Wheel divided into genre segments
        
    -   \[ \] Segment size = % of requests in that genre
        
    -   \[ \] Fill color intensity = frequency
        
    -   \[ \] Tap segment to see songs in genre
        
-   \[ \] Track genres explored over time
    
-   \[ \] Achievement: Unlock "Genre Explorer" at 10 unique genres
    

#### Taste Profile Badge

-   \[ \] Use Amazon Personalize (future phase) or simple ML:
    
    -   \[ \] Analyze genre distribution
        
    -   \[ \] Identify listening patterns (nostalgic, trendy, eclectic)
        
    -   \[ \] Generate personality label:
        
        -   "The Nostalgic Romantic" (lots of older love songs)
            
        -   "Bass Commander" (heavy electronic/hip-hop)
            
        -   "Indie Curator" (alternative/indie focus)
            
        -   "Genre Hopper" (diverse requests)
            
-   \[ \] Display badge on profile with icon
    
-   \[ \] Update monthly based on recent activity
    

#### Stats Overview

-   \[ \] Create `StatsCard` component showing:
    

```
  Your BeatMatchMe Stats
  
  🎵 [Total] Requests Made
  ✓ [Count] Played
  ❌ [Count] Vetoed ([%])
  
  🏆 [Tier] Status
  [Progress bar to next tier]
  
  🎉 [Count] Events Attended
  🌍 [Count] Genres Explored
  ❤️ [Count] Total Upvotes Received
```

## PHASE 9: CROSS-PLATFORM CONSISTENCY

### Task 9.1: Shared Component Library

#### Design System Setup

-   \[ \] Create shared constants file: `theme.ts`
    

```
export const COLORS = {
  // Core UI
  background: '#1a1a1a',
  surface: '#2a2a2a',
  navIndigo: '#1a1a3e',
  
  // Dynamic Gradients
  buildingEnergy: ['#9d00ff', '#00d9ff'],
  peakHype: ['#ff006e', '#ffbe0b'],
  intimateMoment: ['#ff1744', '#ff6f00'],
  coolDown: ['#02f2e2', '#80deea'],
  
  // Status Colors
  pending: '#ffbe0b',
  approved: '#00d9ff',
  playing: '#00ff88',
  completed: '#4caf50',
  vetoed: '#ff1744',
  
  // Tier Colors
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
};

export const TYPOGRAPHY = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
        
-   \[ \] Create `Card` component:
    
    -   \[ \] Default surface color
        
    -   \[ \] Optional gradient background
        
    -   \[ \] Shadow variants (none, sm, md, lg)
        
    -   \[ \] Pressable variant with scale animation
        
-   \[ \] Create `Badge` component:
    
    -   \[ \] Tier variants (bronze, silver, gold, platinum)
        
    -   \[ \] Status variants (pending, approved, playing, completed, vetoed)
        
    -   \[ \] Animated shimmer for platinum
        
    -   \[ \] Custom icon support
        
-   \[ \] Create `Avatar` component:
    
    -   \[ \] Circular with border
        
    -   \[ \] Size variants (xs, sm, md, lg, xl)
        
    -   \[ \] Tier ring indicator
        
    -   \[ \] Fallback initials
        
-   \[ \] Create `ProgressBar` component:
    
    -   \[ \] Linear and circular variants
        
    -   \[ \] Gradient fill
        
    -   \[ \] Animated transitions
        
    -   \[ \] Label support
        
-   \[ \] Create `Modal` component:
    
    -   \[ \] Backdrop with blur
        
    -   \[ \] Slide-up animation (mobile)
        
    -   \[ \] Fade-in animation (web)
        
    -   \[ \] Close button
        
    -   \[ \] Prevent scroll when open
        

### Task 9.2: Platform-Specific Optimizations

#### Web-Specific Features

-   \[ \] Implement keyboard shortcuts:
    
    -   \[ \] `R`: Quick request
        
    -   \[ \] `U`: Upvote top queue item
        
    -   \[ \] `G`: Open group request
        
    -   \[ \] `A`: View achievements
        
    -   \[ \] `Esc`: Close modals
        
-   \[ \] Add hover states to all interactive elements
    
-   \[ \] Implement right-click context menus:
    
    -   \[ \] Song cards: "Share", "Add to Favorites", "Report"
        
    -   \[ \] Queue items: "View Details", "Upvote", "Share"
        
-   \[ \] Desktop notification support (in addition to push)
    
-   \[ \] Optimize for larger screens:
    
    -   \[ \] Side-by-side layouts (queue + request form)
        
    -   \[ \] Expanded analytics dashboards
        
    -   \[ \] Multi-column dedication wall
        

#### Mobile-Specific Features

-   \[ \] Implement native gesture recognizers:
    
    -   \[ \] Swipe left on queue item: Quick upvote
        
    -   \[ \] Swipe right on queue item: View details
        
    -   \[ \] Pull-to-refresh on all lists
        
    -   \[ \] Long-press for context menus
        
-   \[ \] Add iOS/Android widget (show current event, queue position)
    
-   \[ \] Implement 3D Touch shortcuts (iOS):
    
    -   \[ \] Quick Request
        
    -   \[ \] View Queue
        
    -   \[ \] Check My Requests
        
-   \[ \] Optimize for one-handed use:
    
    -   \[ \] Bottom sheet modals
        
    -   \[ \] Floating action button (FAB) for primary actions
        
    -   \[ \] Reachable navigation (Constellation at thumb position)
        
-   \[ \] Battery optimization:
    
    -   \[ \] Reduce animation frame rate when battery < 20%
        
    -   \[ \] Pause audio visualizer in background
        
    -   \[ \] Throttle real-time subscriptions
        

#### Tablet Optimization

-   \[ \] Create split-view layouts:
    
    -   \[ \] Left: Current queue
        
    -   \[ \] Right: Request form / dedication wall / analytics
        
-   \[ \] Enable picture-in-picture for audio visualizer
    
-   \[ \] Support external keyboard (same shortcuts as web)
    
-   \[ \] Landscape mode optimizations:
    
    -   \[ \] Horizontal Constellation navigation
        
    -   \[ \] Expanded queue with more details visible
        
    -   \[ \] Side-by-side comparison views
        

### Task 9.3: Responsive Layout System

#### Breakpoint Definitions

-   \[ \] Define responsive breakpoints:
    

```
export const BREAKPOINTS = {
  mobile: 320,
  mobileLarge: 428,
  tablet: 768,
  desktop: 1024,
  desktopLarge: 1440,
};
```

#### Layout Components

-   \[ \] Create `Container` component:
    
    -   \[ \] Max-width based on breakpoint
        
    -   \[ \] Horizontal padding
        
    -   \[ \] Center alignment
        
-   \[ \] Create `Grid` component:
    
    -   \[ \] Responsive columns (1 on mobile, 2 on tablet, 3+ on desktop)
        
    -   \[ \] Configurable gap
        
    -   \[ \] Auto-fit and auto-fill support
        
-   \[ \] Create `Stack` component:
    
    -   \[ \] Vertical or horizontal layout
        
    -   \[ \] Configurable spacing
        
    -   \[ \] Responsive direction (e.g., vertical on mobile, horizontal on desktop)
        

#### Component Adaptations

-   \[ \] Song cards:
    
    -   \[ \] Mobile: Full-width, stacked layout
        
    -   \[ \] Tablet: 2 columns, more details visible
        
    -   \[ \] Desktop: 3-4 columns, expanded hover states
        
-   \[ \] Queue view:
    
    -   \[ \] Mobile: Simple list with essential info
        
    -   \[ \] Tablet: List with position graph and upvote counts
        
    -   \[ \] Desktop: Detailed view with user avatars, dedications preview
        
-   \[ \] Dedication wall:
    
    -   \[ \] Mobile: Single column, large cards
        
    -   \[ \] Tablet: 2 columns, medium cards
        
    -   \[ \] Desktop: Masonry layout, varying card sizes
        
-   \[ \] Analytics dashboard:
    
    -   \[ \] Mobile: Stacked metrics, one chart at a time
        
    -   \[ \] Tablet: 2x2 grid of metrics, charts below
        
    -   \[ \] Desktop: Full dashboard with multiple charts side-by-side
        

## PHASE 10: PAYMENT & FINANCIAL MANAGEMENT

### Task 10.1: Payment Processing Architecture

#### Stripe Integration Setup

-   \[ \] Create Stripe account (platform account for BeatMatchMe)
    
-   \[ \] Configure Stripe Connect for performers (separate payout accounts)
    
-   \[ \] Install Stripe SDK:
    
    -   \[ \] Web: `@stripe/stripe-js` and `@stripe/react-stripe-js`
        
    -   \[ \] Mobile: `@stripe/stripe-react-native`
        
-   \[ \] Create environment variables:
    
    -   \[ \] `STRIPE_PUBLISHABLE_KEY`
        
    -   \[ \] `STRIPE_SECRET_KEY` (Lambda only)
        
    -   \[ \] `STRIPE_WEBHOOK_SECRET`
        
-   \[ \] Set up Stripe webhook endpoint: `/webhooks/stripe`
    

#### Lambda: processPayment

-   \[ \] Create Lambda function: `processPayment`
    
-   \[ \] Input parameters:
    

```
{
  userId: string,
  eventId: string,
  songId: string,
  requestType: 'standard' | 'spotlight',
  addOns: {
    dedication?: string,
    shoutOut?: string,
  },
  paymentMethodId: string,
}
```

-   \[ \] Payment flow:
    
    1.  \[ \] Calculate total price:
        
        -   Base price from `Event.pricing`
            
        -   Multiply by 2.5x if spotlight request
            
        -   Add dedication fee if provided
            
        -   Add shout-out fee if provided
            
    2.  \[ \] Create Stripe `PaymentIntent`:
        

```
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount * 100, // Convert to cents
  currency: 'zar',
  payment_method: paymentMethodId,
  confirmation_method: 'manual',
  confirm: true,
  metadata: {
    userId,
    eventId,
    songId,
    requestType,
  },
  application_fee_amount: Math.round(totalAmount * 0.15 * 100), // 15% platform fee
  transfer_data: {
    destination: performerStripeAccountId, // 85% goes to performer
  },
});
```

```
3.  [ ] Handle 3D Secure:
    * If `requires_action`, return `clientSecret` to frontend
    * Frontend confirms payment with `stripe.confirmCardPayment()`
    * Webhook handles final status update
4.  [ ] On success:
    * Create record in `Transactions` table
    * Create record in `Requests` table (status: 'pending')
    * Publish to `onNewRequest` subscription
    * Return transaction details
5.  [ ] On failure:
    * Log error
    * Return error message to user
```

#### Lambda: processRefund

-   \[ \] Create Lambda function: `processRefund`
    
-   \[ \] Input: `{ transactionId, reason }`
    
-   \[ \] Triggered when:
    
    -   \[ \] DJ vetoes request
        
    -   \[ \] Request times out
        
    -   \[ \] Technical error
        
-   \[ \] Refund flow:
    
    1.  \[ \] Fetch transaction from `Transactions` table
        
    2.  \[ \] Create Stripe refund:
        

```
const refund = await stripe.refunds.create({
  payment_intent: transaction.stripePaymentIntentId,
  reason: 'requested_by_customer', // or 'duplicate', 'fraudulent'
  metadata: {
    originalTransactionId: transactionId,
    refundReason: reason,
  },
});
```

```
3.  [ ] Update transaction:
    * Set status to 'refunded'
    * Add `refundReason`
    * Set `refundedAt` timestamp
4.  [ ] Update request:
    * Set status to 'vetoed' or 'refunded'
5.  [ ] Send push notification to user
6.  [ ] Publish to subscription for real-time update
```

#### Lambda: processGroupPayment

-   \[ \] Create Lambda function: `processGroupPayment`
    
-   \[ \] Triggered when group request is fully funded
    
-   \[ \] Input: `{ groupRequestId }`
    
-   \[ \] Flow:
    
    1.  \[ \] Fetch group request and all contributions
        
    2.  \[ \] Charge each contributor simultaneously:
        

```
const charges = await Promise.all(
  contributors.map(contributor =>
    stripe.paymentIntents.create({
      amount: contributor.amount * 100,
      currency: 'zar',
      payment_method: contributor.paymentMethodId,
      confirm: true,
      metadata: {
        groupRequestId,
        contributorId: contributor.userId,
      },
    })
  )
);
```

```
3.  [ ] If any charge fails:
    * Roll back successful charges (create refunds)
    * Notify all contributors of failure
    * Expire group request
4.  [ ] If all succeed:
    * Create consolidated transaction
    * Create request with all contributor names
    * Notify all contributors of success
    * Navigate all contributors to `RequestTracking`
```

#### Stripe Webhook Handler

-   \[ \] Create Lambda function: `handleStripeWebhook`
    
-   \[ \] Handle events:
    
    -   \[ \] `payment_intent.succeeded`:
        
        -   Update transaction status to 'completed'
            
        -   Update request status to 'pending'
            
        -   Send confirmation to user
            
    -   \[ \] `payment_intent.payment_failed`:
        
        -   Update transaction status to 'failed'
            
        -   Delete pending request
            
        -   Notify user of failure
            
    -   \[ \] `charge.refunded`:
        
        -   Update transaction status to 'refunded'
            
        -   Update request status to 'refunded'
            
        -   Notify user
            
    -   \[ \] `account.updated`:
        
        -   Update performer's Stripe account status
            
        -   If account deactivated, disable event creation
            

### Task 10.2: Payment UI Components

#### Payment Method Management

-   \[ \] Create `PaymentMethodsScreen` component
    
-   \[ \] Display saved cards:
    

```
  💳 Visa ****1234
  Expires 12/25
  [Default] [Remove]
  
  💳 Mastercard ****5678
  Expires 03/26
  [Set as Default] [Remove]
  
  [+ Add New Card]
```

-   \[ \] Add new card flow:
    
    -   \[ \] Use Stripe `CardElement` (web) or `CardForm` (mobile)
        
    -   \[ \] Validate card details client-side
        
    -   \[ \] Create `PaymentMethod` via Stripe
        
    -   \[ \] Attach to customer via Lambda
        
    -   \[ \] Save `paymentMethodId` to user profile
        
-   \[ \] Set default payment method
    
-   \[ \] Remove payment method (with confirmation)
    

#### Payment Confirmation Modal

-   \[ \] Create `PaymentConfirmationModal` component
    
-   \[ \] Display:
    

```
  Confirm Your Request
  
  Song: [Song Title] - [Artist]
  Request Type: [Standard / Spotlight]
  
  Base Price: R[X]
  + Dedication: R[Y]
  + Shout-out: R[Z]
  ─────────────────
  Total: R[Total]
  
  Payment Method:
  💳 Visa ****1234 [Change]
  
  ✓ Fair-Play Guarantee
    Your song plays or you get refunded
  
  [Hold to Confirm Payment]
```

-   \[ \] Hold-to-confirm button:
    
    -   \[ \] Circular progress animation
        
    -   \[ \] Requires 2-second hold
        
    -   \[ \] Haptic feedback during hold
        
    -   \[ \] Prevents accidental taps
        
-   \[ \] On confirm:
    
    -   \[ \] Show loading spinner
        
    -   \[ \] Call `processPayment` Lambda
        
    -   \[ \] Handle 3D Secure if required
        
    -   \[ \] Show success/error message
        

#### 3D Secure Flow

-   \[ \] Implement 3DS authentication:
    
    -   \[ \] On `requires_action` response, open Stripe 3DS modal
        
    -   \[ \] Web: `stripe.confirmCardPayment(clientSecret)`
        
    -   \[ \] Mobile: Native 3DS screen
        
    -   \[ \] Show loading state during authentication
        
    -   \[ \] Handle success: Navigate to `RequestTracking`
        
    -   \[ \] Handle failure: Show error, allow retry
        

#### Payment Processing Indicator

-   \[ \] Create `ProcessingPaymentModal` component
    
-   \[ \] Design:
    

```
  ┌─────────────────────────────────┐
  │                                 │
  │         [Spinner]               │
  │                                 │
  │    Processing Payment...        │
  │                                 │
  │   This may take a few seconds   │
  │                                 │
  └─────────────────────────────────┘
```

-   \[ \] Cannot be dismissed until complete
    
-   \[ \] Timeout after 30 seconds with error message
    

#### Payment Success Animation

-   \[ \] Create `PaymentSuccessModal` component
    
-   \[ \] Design:
    

```
  ┌─────────────────────────────────┐
  │                                 │
  │         ✓ [Animated]            │
  │                                 │
  │    Request Confirmed!           │
  │                                 │
  │         [Song Title]            │
  │         [Artist]                │
  │                                 │
  │    Position in Queue: #7        │
  │    Estimated Wait: ~18 min      │
  │                                 │
  │         [View Queue]            │
  └─────────────────────────────────┘
```

-   \[ \] Animations:
    
    -   \[ \] Checkmark draw animation
        
    -   \[ \] Confetti burst
        
    -   \[ \] Success sound effect
        
    -   \[ \] Haptic success pattern
        
-   \[ \] Auto-navigate to `RequestTracking` after 3 seconds
    

### Task 10.3: Performer Payouts

#### Stripe Connect Onboarding

-   \[ \] Create `PerformerOnboardingScreen` component
    
-   \[ \] Flow:
    
    1.  \[ \] Explain Stripe Connect benefits
        
    2.  \[ \] "Get Started" button
        
    3.  \[ \] Call Lambda `createStripeConnectAccount`
        
    4.  \[ \] Lambda creates Stripe account and returns onboarding link
        
    5.  \[ \] Open Stripe onboarding in webview (mobile) or new tab (web)
        
    6.  \[ \] User completes Stripe KYC process
        
    7.  \[ \] Stripe redirects back to app with success/failure
        
    8.  \[ \] Update performer profile with Stripe account ID
        
-   \[ \] Display onboarding status:
    
    -   \[ \] Pending: "Complete your payout setup"
        
    -   \[ \] In Review: "Your account is being verified"
        
    -   \[ \] Active: "Payouts enabled ✓"
        
    -   \[ \] Restricted: "Action required" + link to Stripe dashboard
        

#### Lambda: createStripeConnectAccount

-   \[ \] Create Lambda function: `createStripeConnectAccount`
    
-   \[ \] Input: `{ userId }`
    
-   \[ \] Flow:
    
    1.  \[ \] Create Stripe Connect account:
        

```
const account = await stripe.accounts.create({
  type: 'express',
  country: 'ZA',
  email: user.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  business_type: 'individual',
});
```

```
2.  [ ] Create account link for onboarding:
```

```
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${APP_URL}/performer/onboarding/refresh`,
  return_url: `${APP_URL}/performer/onboarding/complete`,
  type: 'account_onboarding',
});
```

```
3.  [ ] Save account ID to performer profile
4.  [ ] Return onboarding URL
```

#### Payout Dashboard

-   \[ \] Create `PayoutDashboard` component (in `PerformerAnalytics`)
    
-   \[ \] Display:
    

```
  💰 Earnings Overview
  
  Tonight: R1,245.00
  This Week: R4,820.00
  This Month: R18,350.00
  All Time: R127,490.00
  
  ┌─────────────────────────────────┐
  │ Available Balance: R1,245.00    │
  │ [Payout to Bank]                │
  └─────────────────────────────────┘
  
  Pending: R0.00
  In Transit: R850.00 (arrives Oct 28)
  
  Recent Payouts:
  • Oct 20 - R2,150.00 ✓ Paid
  • Oct 13 - R1,890.00 ✓ Paid
  • Oct 6 - R3,200.00 ✓ Paid
```

-   \[ \] Data source:
    
    -   \[ \] Query `Transactions` table for earnings
        
    -   \[ \] Query Stripe API for balance and payouts
        
    -   \[ \] Cache in ElastiCache, refresh every 5 minutes
        
-   \[ \] Manual payout button:
    
    -   \[ \] Call Lambda `requestPayout`
        
    -   \[ \] Show confirmation modal
        
    -   \[ \] Display payout timeline
        

#### Lambda: requestPayout

-   \[ \] Create Lambda function: `requestPayout`
    
-   \[ \] Input: `{ performerId, amount }`
    
-   \[ \] Flow:
    
    1.  \[ \] Verify sufficient balance in Stripe account
        
    2.  \[ \] Create payout:
        

```
const payout = await stripe.payouts.create(
  {
    amount: amount * 100,
    currency: 'zar',
  },
  {
    stripeAccount: performerStripeAccountId,
  }
);
```

```
3.  [ ] Record payout in `Payouts` table
4.  [ ] Send confirmation email
5.  [ ] Return payout details (ETA, amount)
```

#### Transaction History

-   \[ \] Create `TransactionHistory` component
    
-   \[ \] Display all transactions with filters:
    
    -   \[ \] Date range picker
        
    -   \[ \] Event filter
        
    -   \[ \] Transaction type (request, group request, tip, refund)
        
    -   \[ \] Status filter (completed, refunded, pending)
        
-   \[ \] Export options:
    
    -   \[ \] CSV download
        
    -   \[ \] PDF report
        
    -   \[ \] Email summary
        
-   \[ \] Each transaction shows:
    
    -   \[ \] Date and time
        
    -   \[ \] Event name
        
    -   \[ \] Song title
        
    -   \[ \] Gross amount
        
    -   \[ \] Platform fee (15%)
        
    -   \[ \] Net amount
        
    -   \[ \] Status
        
-   \[ \] Pagination (50 per page)
    

## PHASE 11: ADVANCED FEATURES

### Task 11.1: Predictive Queue AI

#### Data Collection for ML

-   \[ \] Create Lambda function: `collectQueueData`
    
-   \[ \] Triggered on every queue update
    
-   \[ \] Collect data points:
    
    -   \[ \] Event context: venue, date, time, performer
        
    -   \[ \] Queue state: songs, positions, upvotes, request types
        
    -   \[ \] Song metadata: genre, tempo, energy, key
        
    -   \[ \] Audience behavior: request frequency, genre distribution
        
    -   \[ \] Outcome: song played/vetoed, wait time, crowd reaction
        
-   \[ \] Store in S3 as training data:
    
    -   \[ \] Format: JSON Lines (one event per line)
        
    -   \[ \] Partition by date: `s3://beatmatchme-ml-data/YYYY/MM/DD/events.jsonl`
        
-   \[ \] Anonymize user data (remove PII)
    

#### ML Model Training

-   \[ \] Set up Amazon SageMaker training job
    
-   \[ \] Model objective: Predict optimal song order to maximize:
    
    -   \[ \] Audience satisfaction (measured by upvotes)
        
    -   \[ \] Play rate (minimize vetoes)
        
    -   \[ \] Energy flow (smooth transitions between genres/tempos)
        
-   \[ \] Features:
    
    -   \[ \] Current queue composition (genres, tempos)
        
    -   \[ \] Time since last \[genre\] song
        
    -   \[ \] Performer's historical preferences
        
    -   \[ \] Venue's genre tendencies
        
    -   \[ \] Time of night
        
    -   \[ \] Crowd energy level
        
-   \[ \] Model architecture:
    
    -   \[ \] Use gradient boosting (XGBoost or LightGBM)
        
    -   \[ \] Alternatively: LSTM for sequence prediction
        
-   \[ \] Train weekly on new data
    
-   \[ \] Deploy model to SageMaker endpoint
    

#### Lambda: predictQueueOptimization

-   \[ \] Create Lambda function: `predictQueueOptimization`
    
-   \[ \] Input: `{ eventId }`
    
-   \[ \] Flow:
    
    1.  \[ \] Fetch current queue
        
    2.  \[ \] Extract features for each song
        
    3.  \[ \] Call SageMaker endpoint with feature vectors
        
    4.  \[ \] Get predicted optimal order
        
    5.  \[ \] Return suggestions to performer:
        

```
  🤖 AI Suggestions
  
  Consider swapping:
  #3 [Song A] ⇄ #5 [Song B]
  
  Reason: Creates smoother energy transition
  Expected +15% satisfaction
  
  [Apply] [Dismiss]
```

```
6.  [ ] Log performer's decision (accept/reject) for model improvement
```

#### Performer UI Integration

-   \[ \] Add "AI Assist" toggle in `PerformerDashboard`
    
-   \[ \] When enabled:
    
    -   \[ \] Show AI suggestions as cards above queue
        
    -   \[ \] Highlight suggested swaps with animated arrows
        
    -   \[ \] One-tap to apply suggestion
        
-   \[ \] Performer can override any suggestion
    
-   \[ \] Track suggestion acceptance rate
    
-   \[ \] Disable if performer consistently rejects (not useful for their style)
    

### Task 11.2: Smart Request Suggestions

#### Recommendation Engine

-   \[ \] Create Lambda function: `getRecommendations`
    
-   \[ \] Input: `{ userId, eventId }`
    
-   \[ \] Recommendation logic:
    
    1.  \[ \] **Collaborative Filtering**: Songs requested by similar users at similar events
        
    2.  \[ \] **Venue Trends**: Top-played songs at this venue
        
    3.  \[ \] **Time-Based**: Popular songs for current time of night
        
    4.  \[ \] **Genre Exploration**: Suggest unfamiliar genres user hasn't tried
        
    5.  \[ \] **Mood Matching**: Songs matching current event energy
        
-   \[ \] Data sources:
    
    -   \[ \] User's request history (from `Requests` table)
        
    -   \[ \] Venue's play history (from `Requests` + `Events` tables)
        
    -   \[ \] Current queue composition
        
    -   \[ \] Time of day patterns
        
-   \[ \] Return ranked list of 20 suggestions with reasons
    

#### UI: Smart Suggestions

-   \[ \] Add "Recommended for You" section in `SongBrowserScreen`
    
-   \[ \] Display as horizontal scrollable cards:
    

```
  🎯 Recommended for You
  
  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
  │ [Album Art]   │  │ [Album Art]   │  │ [Album Art]   │
  │ [Song Title]  │  │ [Song Title]  │  │ [Song Title]  │
  │ [Artist]      │  │ [Artist]      │  │ [Artist]      │
  │               │  │               │  │               │
  │ ⭐ Top pick   │  │ 🔥 Trending   │  │ 🎭 Your vibe  │
  │    for you    │  │    here       │  │               │
  └───────────────┘  └───────────────┘  └───────────────┘
```

-   \[ \] Each card shows recommendation reason:
    
    -   \[ \] "Top pick for you" (personalized)
        
    -   \[ \] "Trending here" (venue popular)
        
    -   \[ \] "Your vibe" (matches history)
        
    -   \[ \] "Explore \[genre\]" (new genre)
        
    -   \[ \] "\[X\] people requested this tonight"
        
-   \[ \] Tap to see full song details and request
    

#### "Feeling Lucky" Feature

-   \[ \] Add "Surprise Me!" button in `SongBrowserScreen`
    
-   \[ \] On tap:
    
    1.  \[ \] Call `getRecommendations` Lambda
        
    2.  \[ \] Pick random song from top 5 recommendations
        
    3.  \[ \] Show mystery reveal animation:
        

```
  ┌─────────────────────────────────┐
  │                                 │
  │    [Spinning vinyl animation]   │
  │                                 │
  │     Rolling the dice...         │
  │                                 │
  └─────────────────────────────────┘
  
  ↓ (animates to)
  
  ┌─────────────────────────────────┐
  │                                 │
  │     Your Surprise Song:         │
  │                                 │
  │         [Album Art]             │
  │         [Song Title]            │
  │         [Artist]                │
  │                                 │
  │   [Request This] [Roll Again]   │
  └─────────────────────────────────┘
```

-   \[ \] "Roll Again" picks another random suggestion
    
-   \[ \] Achievement: "Risk Taker" (request 10 surprise songs)
    

### Task 11.3: Crowd Energy Meter

#### Energy Detection System

-   \[ \] Enhance audio analysis (from Task 7.2) to detect:
    
    -   \[ \] Overall volume level
        
    -   \[ \] Beat intensity (bass presence)
        
    -   \[ \] Tempo changes
        
    -   \[ \] Crowd noise level (if microphone samples ambient sound)
        
-   \[ \] Create Lambda function: `analyzeCrowdEnergy`
    
-   \[ \] Triggered every 30 seconds during events
    
-   \[ \] Input: Audio analysis data from last 30 seconds
    
-   \[ \] Calculate energy score (0-100):
    

```
const energyScore =
  (bassLevel * 0.4) +
  (volumeLevel * 0.3) +
  (tempo * 0.2) +
  (crowdNoise * 0.1);
```

-   \[ \] Store in Events table as `currentEnergy`
    
-   \[ \] Publish to `onEnergyUpdate` subscription
    

#### Energy Visualization

-   \[ \] Create `EnergyMeter` component
    
-   \[ \] Display in audience and performer views
    
-   \[ \] Design:
    

```
  🔥 Crowd Energy
  
  ████████░░ 82%
  
  [Energy State: Peak Hype]
```

-   \[ \] Energy states:
    
    -   \[ \] 0-20%: "Warming Up" (Blue)
        
    -   \[ \] 21-40%: "Building" (Cyan)
        
    -   \[ \] 41-60%: "Vibing" (Green)
        
    -   \[ \] 61-80%: "High Energy" (Yellow)
        
    -   \[ \] 81-100%: "Peak Hype" (Red)
        
-   \[ \] Animated fill bar with pulsing effect
    
-   \[ \] Color matches background gradient system
    
-   \[ \] Real-time updates via subscription
    

#### Energy Timeline Graph

-   \[ \] Create `EnergyTimeline` component (in `PerformerAnalytics`)
    
-   \[ \] Line graph showing energy over time
    
-   \[ \] X-axis: Time (15-minute blocks)
    
-   \[ \] Y-axis: Energy level (0-100)
    
-   \[ \] Annotations:
    
    -   \[ \] Mark when each song played
        
    -   \[ \] Highlight peak energy moments
        
    -   \[ \] Show request submission spikes
        
-   \[ \] Helps performers see:
    
    -   \[ \] "Energy peaked 30 minutes in"
        
    -   \[ \] "Playing \[Song X\] raised energy by 20%"
        
    -   \[ \] "Request rate correlates with energy"
        

#### Energy-Based Recommendations

-   \[ \] Integrate energy state into song recommendations
    
-   \[ \] In `getRecommendations` Lambda:
    
    -   \[ \] If energy is low, suggest upbeat songs
        
    -   \[ \] If energy is high, suggest similar energy or cool-down options
        
    -   \[ \] If energy is fluctuating, suggest crowd-pleasers
        
-   \[ \] Add energy tags to songs:
    
    -   \[ \] Chill (0-40)
        
    -   \[ \] Moderate (41-70)
        
    -   \[ \] High Energy (71-100)
        
-   \[ \] Allow filtering by energy level in song browser
    

### Task 11.4: Backup Request List

#### Feature Overview

-   \[ \] When request is vetoed, user can add song to "Backup List"
    
-   \[ \] Backup songs automatically re-request if they become appropriate
    
-   \[ \] Performer can see backup lists and manually approve
    

#### Backup List Management

-   \[ \] Create `BackupListScreen` component
    
-   \[ \] Display user's backup songs:
    

```
  📋 Your Backup List
  
  These songs will auto-request when the vibe fits:
  
  • [Song Title] - [Artist]
    [Remove]
  
  • [Song Title] - [Artist]
    [Remove]
  
  [Add from History]
```

-   \[ \] Add song to backup:
    
    -   \[ \] From veto notification ("Add to Backup List" button)
        
    -   \[ \] From request history (tap vetoed request → "Add to Backup")
        
    -   \[ \] Max 10 songs on backup list
        
-   \[ \] Remove song from backup
    
-   \[ \] Clear entire backup list
    

#### Auto-Request Logic

-   \[ \] Create Lambda function: `processBackupRequests`
    
-   \[ \] Triggered every 15 minutes during active events
    
-   \[ \] Logic:
    
    1.  \[ \] Fetch all users with backup lists at current event
        
    2.  \[ \] For each backup song:
        
        -   \[ \] Check if song now fits current energy level
            
        -   \[ \] Check if genre hasn't been played in last 30 minutes
            
        -   \[ \] Check if similar songs recently accepted
            
        -   \[ \] Check if queue has space (not at cap)
            
    3.  \[ \] If conditions met:
        
        -   \[ \] Create pending request (flag as backup)
            
        -   \[ \] Send notification: "Your backup song \[X\] was auto-requested!"
            
        -   \[ \] Remove from backup list
            
-   \[ \] Respect user's payment method (charge same as normal request)
    
-   \[ \] User can disable auto-request in settings
    

#### Performer Backup Review

-   \[ \] Add "Backup Requests" section in `PerformerDashboard`
    
-   \[ \] Show pending backup requests:
    

```
  🔄 Backup Requests (3)
  
  • [Song] - [Artist]
    Requested by: [User]
    Reason: Fits current energy
    [Approve] [Decline]
```

-   \[ \] Approve: Moves to main queue
    
-   \[ \] Decline: Returns to user's backup list
    
-   \[ \] Auto-approve if performer has "Trust AI" setting enabled
    

## PHASE 12: SECURITY & COMPLIANCE

### Task 12.1: Authentication Security

#### Enhanced Cognito Configuration

-   \[ \] Enable MFA (Multi-Factor Authentication):
    
    -   \[ \] SMS-based MFA
        
    -   \[ \] TOTP app support (Google Authenticator, Authy)
        
    -   \[ \] Optional but encouraged during signup
        
-   \[ \] Password policy:
    
    -   \[ \] Minimum 8 characters
        
    -   \[ \] Require uppercase, lowercase, number, special character
        
    -   \[ \] Prevent common passwords (check against breach database)
        
-   \[ \] Account lockout:
    
    -   \[ \] Lock after 5 failed login attempts
        
    -   \[ \] 15-minute cooldown
        
    -   \[ \] Send email notification on lockout
        
-   \[ \] Session management:
    
    -   \[ \] Access token expiration: 1 hour
        
    -   \[ \] Refresh token expiration: 30 days
        
    -   \[ \] Refresh token rotation enabled
        
    -   \[ \] Invalidate all sessions on password change
        

#### Email Verification & Account Recovery

-   \[ \] Enforce email verification before first use
    
-   \[ \] Custom email templates:
    
    -   \[ \] Welcome email with app tour link
        
    -   \[ \] Email verification with magic link
        
    -   \[ \] Password reset with secure token
        
    -   \[ \] Account activity alerts
        
-   \[ \] Password reset flow:
    
    -   \[ \] Request reset via email
        
    -   \[ \] Send 6-digit code (expires in 15 minutes)
        
    -   \[ \] Verify code + set new password
        
    -   \[ \] Invalidate all existing sessions
        
    -   \[ \] Send confirmation email
        
-   \[ \] Account recovery options:
    
    -   \[ \] Email-based recovery
        
    -   \[ \] SMS-based recovery (if phone verified)
        
    -   \[ \] Support ticket for edge cases
        

#### Device Management

-   \[ \] Create `DeviceManagement` component (in user settings)
    
-   \[ \] Track active sessions:
    

```
  🔒 Active Devices
  
  • iPhone 13 Pro
    Johannesburg, ZA
    Last active: 2 minutes ago [Current Device]
    
  • Chrome on Windows
    Cape Town, ZA
    Last active: 2 days ago [Sign Out]
    
  • Safari on iPad
    Unknown location
    Last active: 1 week ago [Sign Out]
```

-   \[ \] Store device info in DynamoDB (Sessions table):
    
    -   \[ \] Device type and model
        
    -   \[ \] Browser/app version
        
    -   \[ \] Last IP address
        
    -   \[ \] Last active timestamp
        
    -   \[ \] Location (from IP geolocation)
        
-   \[ \] Remote sign-out capability
    
-   \[ \] Sign out all devices option
    
-   \[ \] Email alert on new device login
    

### Task 12.2: Payment Security

#### PCI Compliance

-   \[ \] Never store raw card details (use Stripe tokens only)
    
-   \[ \] Use Stripe Elements/CardForm (PCI-compliant UI)
    
-   \[ \] Enable Stripe Radar for fraud detection
    
-   \[ \] Implement 3D Secure for all transactions
    
-   \[ \] SSL/TLS encryption for all API calls (enforced by API Gateway)
    
-   \[ \] Regular security audits (quarterly)
    

#### Fraud Prevention

-   \[ \] Create Lambda function: `detectFraudulentActivity`
    
-   \[ \] Triggered on every payment attempt
    
-   \[ \] Check for suspicious patterns:
    
    -   \[ \] Multiple failed payments in short time
        
    -   \[ \] Unusually high transaction amounts
        
    -   \[ \] Requests from blacklisted IP addresses
        
    -   \[ \] Multiple accounts from same device
        
    -   \[ \] Rapid account creation + payment
        
-   \[ \] Fraud scoring (0-100):
    

```
let fraudScore = 0;
if (failedPaymentsLast10Min > 3) fraudScore += 40;
if (amount > averageAmount * 5) fraudScore += 30;
if (isBlacklistedIP) fraudScore += 50;
if (accountAge < 1 hour && hasPayment) fraudScore += 30;
```

-   \[ \] Actions based on score:
    
    -   \[ \] 0-30: Allow transaction
        
    -   \[ \] 31-60: Require additional verification (email code)
        
    -   \[ \] 61-80: Flag for manual review
        
    -   \[ \] 81-100: Block transaction, lock account temporarily
        
-   \[ \] Log all fraud checks for review
    
-   \[ \] Send alerts to admin dashboard for high-risk activities
    

#### Rate Limiting

-   \[ \] Implement API Gateway rate limits:
    
    -   \[ \] Per user: 100 requests/minute
        
    -   \[ \] Per IP: 1000 requests/minute
        
    -   \[ \] Payment endpoints: 10 requests/minute per user
        
-   \[ \] DynamoDB rate limiting for expensive operations:
    
    -   \[ \] Request submission: 5 per minute per user
        
    -   \[ \] Group request creation: 3 per hour per user
        
    -   \[ \] Search queries: 30 per minute per user
        
-   \[ \] Create `RateLimitExceeded` error response:
    

```
{
  "error": "RateLimitExceeded",
  "message": "Too many requests. Please wait 30 seconds.",
  "retryAfter": 30
}
```

-   \[ \] UI handling:
    
    -   \[ \] Show toast with retry countdown
        
    -   \[ \] Disable submit buttons during cooldown
        
    -   \[ \] Queue actions for automatic retry
        

#### Transaction Monitoring

-   \[ \] Create Lambda function: `monitorTransactions`
    
-   \[ \] Run hourly via EventBridge
    
-   \[ \] Check for anomalies:
    
    -   \[ \] Spike in refund requests
        
    -   \[ \] Unusual transaction patterns
        
    -   \[ \] High veto rates for specific performers
        
    -   \[ \] Geographic clustering of fraud
        
-   \[ \] Send alerts to admin dashboard
    
-   \[ \] Generate daily security report
    

### Task 12.3: Data Privacy & GDPR/POPIA Compliance

#### Privacy Policy & Terms of Service

-   \[ \] Draft comprehensive privacy policy covering:
    
    -   \[ \] Data collection (what, why, how)
        
    -   \[ \] Data storage (where, how long)
        
    -   \[ \] Data sharing (with whom, why)
        
    -   \[ \] User rights (access, deletion, portability)
        
    -   \[ \] Cookie usage
        
    -   \[ \] Third-party services (Stripe, AWS, analytics)
        
-   \[ \] Draft terms of service covering:
    
    -   \[ \] Account responsibilities
        
    -   \[ \] Acceptable use policy
        
    -   \[ \] Payment terms and refund policy
        
    -   \[ \] Intellectual property
        
    -   \[ \] Liability limitations
        
    -   \[ \] Dispute resolution
        
-   \[ \] Add legal pages to website and app
    
-   \[ \] Require acceptance during signup
    
-   \[ \] Version tracking (notify users of updates)
    

#### Data Access Requests (GDPR Article 15)

-   \[ \] Create `DataAccessRequest` component (in settings)
    
-   \[ \] User can request:
    
    -   \[ \] Export all personal data (JSON format)
        
    -   \[ \] Export request history (CSV)
        
    -   \[ \] Export transaction history (PDF)
        
-   \[ \] Create Lambda function: `generateDataExport`
    
-   \[ \] Flow:
    
    1.  \[ \] User submits request
        
    2.  \[ \] Lambda queries all relevant tables
        
    3.  \[ \] Compile data into ZIP archive
        
    4.  \[ \] Upload to S3 with pre-signed URL (expires in 7 days)
        
    5.  \[ \] Send email with download link
        
    6.  \[ \] Log request for audit trail
        
-   \[ \] Complete within 30 days (GDPR/POPIA requirement)
    

#### Right to Be Forgotten (GDPR Article 17)

-   \[ \] Create `AccountDeletion` component (in settings)
    
-   \[ \] Display consequences of deletion:
    

```
⚠️ Delete Your Account

This will permanently remove:
• Your profile and account data
• All request history
• Saved payment methods
• Achievements and stats
• Group request participation

This CANNOT be undone.

Note: Transaction records will be retained for 7 years
for legal compliance.

[Cancel] [Confirm Deletion]
```

-   \[ \] Create Lambda function: `deleteUserAccount`
    
-   \[ \] Flow:
    
    1.  \[ \] Verify user identity (require password re-entry)
        
    2.  \[ \] Check for active requests/group requests
        
    3.  \[ \] Process any pending refunds
        
    4.  \[ \] Anonymize transaction records (replace name with "Deleted User")
        
    5.  \[ \] Delete from `Users` table
        
    6.  \[ \] Delete from Cognito
        
    7.  \[ \] Delete payment methods from Stripe
        
    8.  \[ \] Remove from all subscriptions
        
    9.  \[ \] Send confirmation email
        
    10.  \[ \] Log deletion for audit trail
        
-   \[ \] Retention exceptions:
    
    -   \[ \] Transaction records: 7 years (legal requirement)
        
    -   \[ \] Fraud logs: 3 years
        
    -   \[ \] Anonymized analytics: Indefinite
        

#### Cookie Consent & Tracking

-   \[ \] Implement cookie consent banner (web only):
    

```
🍪 We use cookies
We use essential cookies for functionality and optional cookies for analytics.
[Accept All] [Reject Optional] [Customize]
```

-   \[ \] Cookie categories:
    
    -   \[ \] Essential: Authentication, security (always on)
        
    -   \[ \] Functional: Preferences, language (opt-in)
        
    -   \[ \] Analytics: Usage tracking (opt-in)
        
    -   \[ \] Marketing: Ads, retargeting (opt-in)
        
-   \[ \] Store consent preferences in `localStorage`
    
-   \[ \] Respect `Do Not Track` browser setting
    
-   \[ \] Anonymize IP addresses in analytics
    
-   \[ \] Disable analytics if consent withdrawn
    

#### Data Retention Policy

-   \[ \] Define retention periods:
    
    -   \[ \] User accounts: Until deletion request
        
    -   \[ \] Request history: 2 years
        
    -   \[ \] Transaction records: 7 years (tax compliance)
        
    -   \[ \] Analytics data: 3 years
        
    -   \[ \] Logs: 90 days
        
    -   \[ \] Backups: 30 days
        
-   \[ \] Create Lambda function: `enforceRetentionPolicy`
    
-   \[ \] Run daily via EventBridge
    
-   \[ \] Automatically delete expired data
    
-   \[ \] Log all deletions for audit
    

### Task 12.4: Content Moderation

#### Automated Content Filtering

-   \[ \] Create Lambda function: `moderateContent`
    
-   \[ \] Triggered on:
    
    -   \[ \] Dedication text submission
        
    -   \[ \] Shout-out text submission
        
    -   \[ \] User profile bio updates
        
    -   \[ \] Venue descriptions
        
-   \[ \] Use AWS Comprehend for:
    
    -   \[ \] Profanity detection
        
    -   \[ \] Hate speech detection
        
    -   \[ \] PII detection (prevent sharing phone/email)
        
    -   \[ \] Sentiment analysis
        
-   \[ \] Content rules:
    
    -   \[ \] Block messages with profanity (unless venue allows)
        
    -   \[ \] Block hate speech (always)
        
    -   \[ \] Block messages with URLs (prevent spam)
        
    -   \[ \] Block messages with phone numbers/emails
        
    -   \[ \] Flag suspicious content for manual review
        
-   \[ \] Response to violations:
    

```
{
  "approved": false,
  "reason": "Your message contains inappropriate language",
  "suggestion": "Please revise and try again"
}
```

#### Manual Moderation Queue

-   \[ \] Create `ModerationDashboard` component (admin only)
    
-   \[ \] Display flagged content:
    

```
  🚩 Flagged Content (12)
  
  • Dedication from [User] at [Venue]
    "[Flagged text]"
    Reason: Potential hate speech
    [Approve] [Reject] [Ban User]
    
  • Shout-out from [User] at [Venue]
    "[Flagged text]"
    Reason: Suspicious link
    [Approve] [Reject]
```

-   \[ \] Moderator actions:
    
    -   \[ \] Approve: Allow content, remove flag
        
    -   \[ \] Reject: Remove content, notify user
        
    -   \[ \] Ban user: Suspend account, log reason
        
-   \[ \] Track moderator decisions for quality control
    
-   \[ \] SLA: Review flagged content within 1 hour
    

#### User Reporting System

-   \[ \] Add "Report" button to:
    
    -   \[ \] Dedications
        
    -   \[ \] User profiles
        
    -   \[ \] Venues
        
-   \[ \] Create `ReportModal` component:
    

```
  🚩 Report Content
  
  Why are you reporting this?
  ○ Inappropriate language
  ○ Harassment
  ○ Spam
  ○ Impersonation
  ○ Other
  
  [Additional details (optional)]
  
  [Cancel] [Submit Report]
```

-   \[ \] Create Lambda function: `handleUserReport`
    
-   \[ \] Flow:
    
    1.  \[ \] Log report in `Reports` table
        
    2.  \[ \] Flag content for moderation
        
    3.  \[ \] If multiple reports (3+), auto-hide content
        
    4.  \[ \] Send to moderation queue
        
    5.  \[ \] Thank reporter
        
-   \[ \] Abuse prevention:
    
    -   \[ \] Limit 10 reports per user per day
        
    -   \[ \] Track false reports (ban if excessive)
        

#### Performer Veto Controls

-   \[ \] Allow performers to set content rules per event:
    
    -   \[ \] Allow/block profanity in dedications
        
    -   \[ \] Require manual approval for all dedications
        
    -   \[ \] Block specific words (custom blacklist)
        
    -   \[ \] Auto-reject dedications mentioning competitors
        
-   \[ \] Create `VetoSettings` component in event setup
    
-   \[ \] Apply rules in real-time before showing dedications
    

## PHASE 13: TESTING & QUALITY ASSURANCE

### Task 13.1: Unit Testing

#### Testing Framework Setup

-   \[ \] Install testing libraries:
    
    -   \[ \] Web: Jest, React Testing Library
        
    -   \[ \] Mobile: Jest, React Native Testing Library
        
    -   \[ \] Backend: Jest for Lambda functions
        
-   \[ \] Configure test environment:
    
    -   \[ \] Mock AWS services (`aws-sdk-mock`)
        
    -   \[ \] Mock Stripe API (`stripe-mock`)
        
    -   \[ \] Mock Cognito (`amazon-cognito-identity-js-mock`)
        
-   \[ \] Set up test database (DynamoDB Local)
    
-   \[ \] Create test data factories
    

#### Component Testing

-   \[ \] Test all UI components:
    
    -   \[ \] Button variants render correctly
        
    -   \[ \] Forms validate input
        
    -   \[ \] Modals open/close properly
        
    -   \[ \] Lists handle empty states
        
    -   \[ \] Cards display data correctly
        
-   \[ \] Test user interactions:
    
    -   \[ \] Button clicks trigger correct actions
        
    -   \[ \] Form submissions call correct functions
        
    -   \[ \] Gesture recognizers work as expected
        
    -   \[ \] Navigation flows work correctly
        
-   \[ \] Test edge cases:
    
    -   \[ \] Loading states
        
    -   \[ \] Error states
        
    -   \[ \] Empty states
        
    -   \[ \] Offline states
        
    -   \[ \] Very long text (overflow handling)
        

#### Lambda Function Testing

-   \[ \] Test each Lambda function:
    
    -   \[ \] Happy path (expected inputs)
        
    -   \[ \] Error handling (invalid inputs)
        
    -   \[ \] Edge cases (boundary conditions)
        
    -   \[ \] Integration with AWS services
        
-   \[ \] Example test structure:
    

```
describe('processPayment', () => {
  it('should create payment intent for standard request', async () => {
    const event = {
      body: JSON.stringify({
        userId: 'user123',
        eventId: 'event456',
        songId: 'song789',
        requestType: 'standard',
        paymentMethodId: 'pm_123',
      }),
    };
    const result = await processPayment(event);
    const body = JSON.parse(result.body);
    expect(result.statusCode).toBe(200);
    expect(body.transactionId).toBeDefined();
    expect(body.status).toBe('completed');
  });

  it('should handle payment failure', async () => {
    // Mock Stripe failure
    stripe.paymentIntents.create.mockRejectedValue(new Error('Card declined'));
    const result = await processPayment(event);
    const body = JSON.parse(result.body);
    expect(result.statusCode).toBe(400);
    expect(body.error).toBe('PaymentFailed');
  });
});
```

#### Integration Testing

-   \[ \] Test complete user flows:
    
    -   \[ \] Signup → Verify Email → Login
        
    -   \[ \] Browse Songs → Request Song → Payment → Track Request
        
    -   \[ \] Create Event → Generate QR Code → User Joins
        
    -   \[ \] Group Request Creation → Contribution → Payment
        
-   \[ \] Test real-time subscriptions:
    
    -   \[ \] Queue updates propagate correctly
        
    -   \[ \] Friend activity notifications work
        
    -   \[ \] Energy meter updates in real-time
        
-   \[ \] Test payment flows end-to-end:
    
    -   \[ \] Stripe test mode
        
    -   \[ \] 3D Secure authentication
        
    -   \[ \] Refund processing
        
    -   \[ \] Payout processing
        

### Task 13.2: Performance Testing

#### Load Testing

-   \[ \] Use `artillery.io` or `k6` for load tests
    
-   \[ \] Test scenarios:
    
    -   \[ \] 100 concurrent users browsing songs
        
    -   \[ \] 50 simultaneous request submissions
        
    -   \[ \] 1000 users viewing same queue
        
    -   \[ \] 100 WebSocket connections (real-time updates)
        
-   \[ \] Define performance targets:
    
    -   \[ \] API response time: < 200ms (p95)
        
    -   \[ \] Page load time: < 2 seconds
        
    -   \[ \] Time to interactive: < 3 seconds
        
    -   \[ \] WebSocket message latency: < 100ms
        
-   \[ \] Identify bottlenecks:
    
    -   \[ \] Slow database queries
        
    -   \[ \] Unoptimized Lambda cold starts
        
    -   \[ \] Large payload sizes
        
    -   \[ \] N+1 query problems
        
-   \[ \] Implement fixes and re-test
    

#### Stress Testing

-   \[ \] Gradually increase load until system breaks
    
-   \[ \] Find maximum concurrent users supported
    
-   \[ \] Test auto-scaling behavior:
    
    -   \[ \] Lambda concurrency scaling
        
    -   \[ \] DynamoDB auto-scaling
        
    -   \[ \] API Gateway throttling
        
-   \[ \] Document breaking points and limits
    
-   \[ \] Set up CloudWatch alarms for approaching limits
    

#### Mobile Performance Testing

-   \[ \] Test on various devices:
    
    -   \[ \] High-end (iPhone 15 Pro, Samsung S24)
        
    -   \[ \] Mid-range (iPhone 12, Pixel 6)
        
    -   \[ \] Low-end (iPhone SE, budget Android)
        
-   \[ \] Measure metrics:
    
    -   \[ \] App launch time
        
    -   \[ \] Screen transition times
        
    -   \[ \] Animation frame rate (target: 60fps)
        
    -   \[ \] Memory usage
        
    -   \[ \] Battery consumption
        
-   \[ \] Test on slow networks:
    
    -   \[ \] 3G simulation
        
    -   \[ \] High latency (500ms+)
        
    -   \[ \] Packet loss
        
-   \[ \] Optimize based on findings:
    
    -   \[ \] Reduce image sizes
        
    -   \[ \] Lazy load components
        
    -   \[ \] Implement request caching
        
    -   \[ \] Prefetch critical data
        

### Task 13.3: Security Testing

#### Penetration Testing

-   \[ \] Hire security firm or use bug bounty platform
    
-   \[ \] Test for common vulnerabilities:
    
    -   \[ \] XSS (cross-site scripting)
        
    -   \[ \] CSRF (cross-site request forgery)
        
    -   \[ \] Authentication bypass
        
    -   \[ \] Authorization flaws
        
    -   \[ \] API abuse
        
-   \[ \] Test specific endpoints:
    
    -   \[ \] Payment processing
        
    -   \[ \] User authentication
        
    -   \[ \] Data export
        
    -   \[ \] Admin functions
        
-   \[ \] Fix all critical and high-severity findings
    
-   \[ \] Re-test after fixes
    

#### Dependency Scanning

-   \[ \] Run `npm audit` regularly
    
-   \[ \] Use Snyk or Dependabot for automated scanning
    
-   \[ \] Monitor for vulnerable dependencies
    
-   \[ \] Update packages promptly
    
-   \[ \] Document exceptions (if updates break compatibility)
    

#### Code Security Review

-   \[ \] Review Lambda functions for:
    
    -   \[ \] Proper input validation
        
    -   \[ \] Secrets management (no hardcoded keys)
        
    -   \[ \] Proper error handling (no sensitive info in errors)
        
    -   \[ \] Authorization checks (verify user permissions)
        
-   \[ \] Review frontend for:
    
    -   \[ \] XSS prevention (sanitize user input)
        
    -   \[ \] Secure storage (no sensitive data in `localStorage`)
        
    -   \[ \] HTTPS enforcement
        
    -   \[ \] Content Security Policy headers
        

### Task 13.4: User Acceptance Testing (UAT)

#### Beta Testing Program

-   \[ \] Recruit 50-100 beta testers:
    
    -   \[ \] 30 audience members
        
    -   \[ \] 10 DJs/performers
        
    -   \[ \] 10 venue owners
        
-   \[ \] Provide test events and test payments
    
-   \[ \] Create feedback channels:
    
    -   \[ \] In-app feedback form
        
    -   \[ \] Private Slack channel
        
    -   \[ \] Weekly surveys
        
    -   \[ \] Optional user interviews
        
-   \[ \] Track key metrics:
    
    -   \[ \] Feature usage rates
        
    -   \[ \] Task completion rates
        
    -   \[ \] Error rates
        
    -   \[ \] User satisfaction scores
        
-   \[ \] Iterate based on feedback
    

#### Usability Testing

-   \[ \] Conduct moderated usability sessions:
    
    -   \[ \] 10 audience members
        
    -   \[ \] 5 performers
        
-   \[ \] Test critical flows:
    
    -   \[ \] First-time user onboarding
        
    -   \[ \] Song request process
        
    -   \[ \] Payment completion
        
    -   \[ \] Queue tracking
        
    -   \[ \] Performer event setup
        
-   \[ \] Observe and record:
    
    -   \[ \] Time to complete tasks
        
    -   \[ \] Errors and confusion points
        
    -   \[ \] User comments and feedback
        
-   \[ \] Calculate task success rates
    
-   \[ \] Identify UX improvements
    

#### Accessibility Testing

-   \[ \] Test with screen readers:
    
    -   \[ \] VoiceOver (iOS)
        
    -   \[ \] TalkBack (Android)
        
    -   \[ \] NVDA/JAWS (web)
        
-   \[ \] Verify WCAG 2.1 AA compliance:
    
    -   \[ \] Color contrast ratios (4.5:1 for text)
        
    -   \[ \] Keyboard navigation (all interactive elements)
        
    -   \[ \] Focus indicators (visible outlines)
        
    -   \[ \] Alt text for images
        
    -   \[ \] Form labels and errors
        
    -   \[ \] Heading hierarchy
        
-   \[ \] Test with accessibility tools:
    
    -   \[ \] axe DevTools
        
    -   \[ \] Lighthouse accessibility audit
        
    -   \[ \] WAVE extension
        
-   \[ \] Fix all critical issues
    

## PHASE 14: DEPLOYMENT & INFRASTRUCTURE

### Task 14.1: CI/CD Pipeline

#### GitHub Actions Setup

-   \[ \] Create `.github/workflows/main.yml`
    
-   \[ \] Define stages:
    
    1.  **Lint**: ESLint, Prettier checks
        
    2.  **Test**: Run unit and integration tests
        
    3.  **Build**: Compile web and mobile apps
        
    4.  **Deploy**: Deploy to staging/production
        
-   \[ \] Trigger on:
    
    -   \[ \] Push to `main` → Deploy to production
        
    -   \[ \] Push to `develop` → Deploy to staging
        
    -   \[ \] Pull request → Run tests only
        

#### Infrastructure as Code

-   \[ \] Use AWS CDK or Terraform
    
-   \[ \] Define all resources in code:
    
    -   \[ \] API Gateway
        
    -   \[ \] Lambda functions
        
    -   \[ \] DynamoDB tables
        
    -   \[ \] S3 buckets
        
    -   \[ \] CloudFront distribution
        
    -   \[ \] Cognito user pool
        
    -   \[ \] AppSync API
        
-   \[ \] Separate stacks for staging and production
    
-   \[ \] Parameterize environment-specific values
    
-   \[ \] Version control all infrastructure code
    

#### Automated Testing in Pipeline

-   \[ \] Run tests on every commit
    
-   \[ \] Require passing tests before merge
    
-   \[ \] Generate code coverage reports
    
-   \[ \] Fail build if coverage drops below 80%
    
-   \[ \] Run Lighthouse performance audits
    
-   \[ \] Run security scans (Snyk, `npm audit`)
    

#### Deployment Strategy

-   \[ \] Blue-green deployment for zero-downtime:
    
    -   \[ \] Deploy new version alongside old
        
    -   \[ \] Route 10% of traffic to new version
        
    -   \[ \] Monitor for errors
        
    -   \[ \] Gradually increase to 100%
        
    -   \[ \] Rollback if issues detected
        
-   \[ \] Lambda versioning and aliases:
    
    -   \[ \] Create new version on each deploy
        
    -   \[ \] Update `$LATEST` alias
        
    -   \[ \] Keep previous 5 versions for rollback
        
-   \[ \] Database migrations:
    
    -   \[ \] Run migrations before code deploy
        
    -   \[ \] Ensure backward compatibility
        
    -   \[ \] Test rollback procedure
        

### Task 14.2: Monitoring & Alerting

#### CloudWatch Dashboards

-   \[ \] Create custom dashboard with widgets:
    
    -   \[ \] API Gateway request count and errors
        
    -   \[ \] Lambda invocation count and duration
        
    -   \[ \] DynamoDB read/write capacity usage
        
    -   \[ \] S3 bucket size and request metrics
        
    -   \[ \] WebSocket connection count
        
    -   \[ \] Payment success/failure rate
        
    -   \[ \] User signup rate
        
-   \[ \] Create separate dashboards for:
    
    -   \[ \] Application metrics
        
    -   \[ \] Infrastructure metrics
        
    -   \[ \] Business metrics (revenue, requests)
        

#### Alerting Rules

-   \[ \] Set up CloudWatch alarms for:
    
    -   \[ \] API error rate > 5%
        
    -   \[ \] Lambda errors > 10 in 5 minutes
        
    -   \[ \] Lambda duration > 10 seconds (cold start issue)
        
    -   \[ \] DynamoDB throttled requests > 0
        
    -   \[ \] Payment failure rate > 10%
        
    -   \[ \] WebSocket disconnection rate > 20%
        
-   \[ \] Send alerts to:
    
    -   \[ \] Email (for low-priority)
        
    -   \[ \] SMS (for high-priority)
        
    -   \[ \] PagerDuty (for critical)
        
    -   \[ \] Slack channel (for all)
        

#### Application Performance Monitoring (APM)

-   \[ \] Integrate New Relic or Datadog
    
-   \[ \] Track custom metrics:
    
    -   \[ \] Request submission time
        
    -   \[ \] Payment processing time
        
    -   \[ \] Queue update latency
        
    -   \[ \] Search query response time
        
-   \[ \] Set up distributed tracing:
    
    -   \[ \] Trace requests across Lambda functions
        
    -   \[ \] Identify slow database queries
        
    -   \[ \] Find bottlenecks in payment flow
        
-   \[ \] Create performance budgets:
    
    -   \[ \] API response time: < 200ms
        
    -   \[ \] Page load time: < 2 seconds
        
-   \[ \] Alert if budgets exceeded
    

#### Error Tracking

-   \[ \] Integrate Sentry or Rollbar
    
-   \[ \] Capture all frontend errors:
    
    -   \[ \] JavaScript exceptions
        
    -   \[ \] React error boundaries
        
    -   \[ \] Network failures
        
    -   \[ \] Payment errors
        
-   \[ \] Capture all backend errors:
    
    -   \[ \] Lambda exceptions
        
    -   \[ \] Database errors
        
    -   \[ \] Third-party API failures
        
-   \[ \] Add context to errors:
    
    -   \[ \] User ID
        
    -   \[ \] Event ID
        
    -   \[ \] Request payload
        
    -   \[ \] Stack trace
        
-   \[ \] Set up error alerts:
    
    -   \[ \] New error types
        
    -   \[ \] Error rate spikes
        
    -   \[ \] Critical path failures
        

### Task 14.3: Logging & Debugging

#### Structured Logging

-   \[ \] Use Winston or Pino for logging
    
-   \[ \] Log levels:
    
    -   \[ \] ERROR: Failures requiring immediate attention
        
    -   \[ \] WARN: Potential issues (e.g., high latency)
        
    -   \[ \] INFO: Important events (e.g., request submitted)
        
    -   \[ \] DEBUG: Detailed information for debugging
        
-   \[ \] Structured log format (JSON):
    

```
{
  "timestamp": "2025-11-03T14:32:10.123Z",
  "level": "INFO",
  "message": "Request submitted",
  "userId": "user123",
  "eventId": "event456",
  "songId": "song789",
  "amount": 50,
  "requestType": "standard"
}
```

-   \[ \] Include correlation IDs to trace requests across services
    
-   \[ \] Send logs to CloudWatch Logs
    
-   \[ \] Set log retention: 90 days

## PHASE 15: ADVANCED UX & PSYCHOLOGICAL ENGAGEMENT COMPLETE

<<<<<<< HEAD
### Task 15.1: Constellation Navigation System 
- [x] Implement social gravity algorithm
- [x] Add friend proximity indicators
- [x] Create crowd momentum arrows
- [x] Build adaptive positioning system

### Task 15.2: Ambient Awareness System 
- [x] Peripheral edge glow notifications
- [x] Circular queue tracker ring
- [x] Contribution thermometer
- [x] Event energy waveform

### Task 15.3: Contextual Theming Engine 
- [x] Event type detection and theme adaptation (5 event types)
- [x] Time-of-night color temperature progression
- [x] Weather integration (5 conditions)
- [x] Rare animation variants system

### Task 15.4: Exploratory Features 
- [x] "Feeling Lucky" Request implementation
- [x] Genre Roulette Wheel
- [x] Daily/Weekly Challenges system

### Task 15.5: Advanced Status & Recognition 
- [x] Hall of Fame persistent display
- [x] Visual status markers (aura rings, trails)
- [x] VIP entrance animations
=======
### Task 15.1: Constellation Navigation System
- [ ] Implement social gravity algorithm
- [ ] Add friend proximity indicators
- [ ] Create crowd momentum arrows
- [ ] Build adaptive positioning system

### Task 15.2: Ambient Awareness System
- [ ] Peripheral edge glow notifications
- [ ] Circular queue tracker ring
- [ ] Contribution thermometer
- [ ] Event energy waveform

### Task 15.3: Contextual Theming Engine
- [ ] Event type detection and theme adaptation
- [ ] Time-of-night color temperature progression
- [ ] Weather integration (optional)
- [ ] Rare animation variants system

### Task 15.4: Exploratory Features
- [ ] "Feeling Lucky" Request implementation
- [ ] Genre Roulette Wheel
- [ ] Daily/Weekly Challenges system

### Task 15.5: Advanced Status & Recognition
- [ ] Hall of Fame persistent display
- [ ] Visual status markers (aura rings, trails)
- [ ] VIP entrance animations
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

### Task 15.6: Relationship-Building Features 
- [x] "Dance Floor Bonds" matching algorithm
- [x] Shared experience artifacts
- [x] Performer-audience bridge features

<<<<<<< HEAD
### Task 15.7: Growth Tracking Systems 
- [x] Genre Exploration Tree
- [x] Sonic Memory Lane enhancements
- [x] Taste Evolution Graph
=======
### Task 15.7: Growth Tracking Systems
- [ ] Genre Exploration Tree
- [ ] Sonic Memory Lane enhancements
- [ ] Taste Evolution Graph
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24

### Task 15.8: Contribution & Impact Systems 
- [x] Collective energy metrics
- [x] Pay-it-forward economy (karma, tips)
- [x] Legacy building features

<<<<<<< HEAD
### Task 15.9: Psychological Engagement Mechanics 
- [x] Variable reward schedules
- [x] Social proof amplification
- [x] Reciprocity triggers

### Task 15.10: Advanced Accessibility 
- [x] Sensory intensity controls
- [x] Simplified mode (via contextual theming)
- [x] Gesture customization (guardrails)
- [x] Neurodivergent-friendly options (hold-to-confirm)
=======
### Task 15.9: Psychological Engagement Mechanics
- [ ] Variable reward schedules
- [ ] Social proof amplification
- [ ] Reciprocity triggers

### Task 15.10: Advanced Accessibility
- [ ] Sensory intensity controls
- [ ] Simplified mode
- [ ] Gesture customization
- [ ] Neurodivergent-friendly options
>>>>>>> f80a01a738bef61ff13459f8be662d99fd04ab24
