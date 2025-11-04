# Feature 1: Discover and Join an Event (Audience)

## Overview
Allow audience members to discover and join events through multiple methods: QR code scanning, GPS-based nearby search, or manual search by venue/DJ name.

## User Journey

### Initial App Launch

1. User opens app and sees login screen
2. User signs up/logs in as AUDIENCE role
3. App displays Event Discovery screen with three options:
   - **Scan QR Code** (fastest)
   - **Find Nearby Events** (GPS-based)
   - **Search Events** (by venue/DJ name)

---

## Option A: QR Code Scan

### Scanning Process

1. User clicks "Scan QR Code"
2. Camera opens showing QR scanner frame
3. User points camera at QR code displayed at DJ booth
4. App automatically detects and decodes QR code
5. App fetches event details from backend

### DJ Set Selection (if applicable)

6. If event has multiple DJ sets, user sees DJ lineup selection screen
7. User selects a DJ set
8. App navigates to song browsing screen

---

## Option B: Nearby Events (GPS)

### Location-Based Discovery

1. User clicks "Nearby Events"
2. App requests location permission
3. User grants location access
4. App fetches events within 5km from backend API

### Event List Display

5. User sees list of nearby events with:
   - Venue name
   - DJ name
   - Distance (e.g., "1.2 km away")
   - "LIVE NOW" or "UPCOMING" status
   - Genre tags
   - Thumbnail image

### Event Selection

6. User taps on an event
7. If event has multiple DJ sets, user sees lineup selection
8. User selects a DJ set
9. App navigates to song browsing screen

---

## Option C: Search Events

### Search Interface

1. User clicks "Search Events"
2. Search screen opens with filters:
   - Search by venue name
   - Search by DJ name
   - Filter by genre
   - Filter by max price
   - Toggle "Available Only"

### Search Execution

3. User enters search query
4. App displays matching events with:
   - Relevance ranking
   - All event details
   - Filters applied

### Event Selection

5. User taps on an event
6. If event has multiple DJ sets, user sees lineup selection
7. User selects a DJ set
8. App navigates to song browsing screen

---

## Technical Requirements

### QR Code System

#### QR Code Format
```
beatmatchme://event/{eventId}/djset/{djSetId}
// or
https://app.beatmatchme.com/join?event={eventId}&djset={djSetId}
```

#### Backend
```graphql
query getEventByQR($eventId: ID!, $djSetId: ID) {
  getEvent(id: $eventId) {
    id
    venueName
    status
    djSets {
      id
      djName
      status
      genre
    }
  }
}
```

#### DJ QR Code Generation
- Auto-generated when DJ creates event
- Displayed in DJ app
- Printable version for physical display
- Dynamic QR with event status

### GPS-Based Search

#### Backend Query
```graphql
query getNearbyEvents(
  $latitude: Float!
  $longitude: Float!
  $radiusKm: Float = 5.0
) {
  getNearbyEvents(
    latitude: $latitude
    longitude: $longitude
    radiusKm: $radiusKm
  ) {
    events {
      id
      venueName
      venueLatitude
      venueLongitude
      distance
      status
      djSets {
        id
        djName
        status
        genre
      }
    }
  }
}
```

#### Geolocation Logic
- Use Haversine formula for distance calculation
- DynamoDB GSI on location data
- Cache nearby results for 5 minutes
- Update on significant location change (>100m)

#### Location Permissions
- Request when user taps "Nearby Events"
- Explain why location is needed
- Fallback to manual search if denied
- Store permission status

### Manual Search

#### Backend Query
```graphql
query searchEvents(
  $query: String
  $filters: EventSearchFilters
  $limit: Int = 20
  $nextToken: String
) {
  searchEvents(
    query: $query
    filters: $filters
    limit: $limit
    nextToken: $nextToken
  ) {
    events {
      id
      venueName
      status
      djSets {
        id
        djName
        status
        genre
      }
    }
    nextToken
  }
}

input EventSearchFilters {
  venueName: String
  djName: String
  genre: [String]
  maxPrice: Float
  status: [EventStatus]
  availableOnly: Boolean
}
```

#### Search Implementation
- ElasticSearch or DynamoDB scan with filters
- Fuzzy matching on venue/DJ names
- Index on common search fields
- Pagination for large result sets
- Search history (last 5 searches)

### DJ Set Selection

#### Multi-DJ Event Scenario
```graphql
type Event {
  id: ID!
  venueName: String!
  djSets: [DJSet!]!
}

type DJSet {
  id: ID!
  djId: ID!
  djName: String!
  genre: String
  status: DJSetStatus!
  startTime: AWSDateTime
  endTime: AWSDateTime
  isActive: Boolean!
}

enum DJSetStatus {
  UPCOMING
  LIVE
  ENDED
}
```

#### UI Flow
- Show DJ lineup as horizontal scrollable cards
- Each card shows:
  - DJ name
  - Genre
  - Time slot
  - "LIVE NOW" badge
  - "UP NEXT" badge
- User taps card to select
- Store selection in local state
- Navigate to song browsing

## UI Components Needed

### Event Discovery Screen
- Three large action buttons with icons
- Camera permission handling
- Location permission handling
- Loading states

### QR Scanner
- Camera viewfinder
- QR code detection overlay
- Success animation
- Error handling (invalid QR, expired event)

### Nearby Events List
- List/grid view toggle
- Distance sorting
- Status badges
- Pull-to-refresh
- Empty state (no nearby events)

### Search Screen
- Search input with autocomplete
- Filter chips
- Sort options (distance, time, popularity)
- Result cards
- Loading skeleton

### DJ Set Selection
- Horizontal carousel
- Card-based UI
- Status indicators
- Time remaining indicator
- "Join" button

## Error Handling

### QR Code Issues
- Invalid QR format → Show error, offer manual search
- Event ended → Notify user, show upcoming events
- Network error → Retry with loading state

### Location Issues
- Permission denied → Fallback to manual search
- GPS unavailable → Use last known location
- No nearby events → Expand radius or suggest popular events

### Search Issues
- No results → Suggest alternative spellings, show all events
- Network timeout → Retry with offline cache
- Invalid filters → Reset filters

## Offline Support
- Cache last viewed events
- Store search history locally
- Offline mode shows cached events with "offline" badge
- Auto-sync when connection restored

## Analytics Events
- Track discovery method usage (QR vs GPS vs Search)
- Search query patterns
- GPS search radius utilization
- DJ set selection time
- Drop-off points in flow

## Status
📋 **PLANNED** - Future Feature
