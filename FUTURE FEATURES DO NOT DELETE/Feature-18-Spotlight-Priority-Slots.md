# Feature 18: Spotlight Priority Slots (Audience)

## Overview
Provide a premium option for audience members to guarantee priority placement in the queue by paying a higher price for "Spotlight" requests.

## User Journey

### Browsing and Song Selection

1. Audience member wants guaranteed priority placement
2. User browses library normally
3. User selects a song

### Request Options Screen

4. On request confirmation screen, two options appear:

   **Option A: Standard Request**
   - Base price (e.g., R50)
   - Standard queue position
   - "Subject to queue order"

   **Option B: Spotlight Request**
   - Higher price (e.g., R125 = 2.5× base)
   - "Guaranteed priority placement" badge
   - Limited availability indicator (e.g., "1 of 2 slots available this block")
   - "Skip the line" icon ⚡

### Selecting Spotlight

5. User taps "Spotlight Request - R[price]"
6. Additional confirmation modal:
   - "Spotlight Request?"
   - Benefits listed:
     - ✓ Guaranteed to play next in queue
     - ✓ Skip ahead of standard requests
     - ✓ Limited slots (only X per 15 min)
   - Price comparison
   - "Confirm Spotlight" button

### Submission and Prioritization

7. User confirms and pays spotlight price
8. Request submitted with `requestType: 'spotlight'`
9. Backend prioritizes in queue ahead of standard requests
10. User sees "SPOTLIGHT" badge on their request
11. Request moves to front of queue immediately

### DJ Perspective

12. DJ sees spotlight request with gold star icon ⭐
13. Spotlight requests automatically placed at top of queue
14. DJ can still reorder but spotlight requests stay prioritized

## Technical Requirements

### Backend
- `requestType` field: `'standard' | 'spotlight'`
- Spotlight pricing multiplier (configurable)
- Slot availability tracking per time block
- Queue prioritization algorithm:
  - Spotlight requests ranked above standard
  - Within spotlight tier, sort by timestamp or price
- Real-time slot availability updates

### Payment
- Dynamic pricing based on spotlight multiplier
- Refund handling (spotlight price if vetoed)
- Revenue tracking by request type

### Queue Management
- Automatic reordering when spotlight request added
- Slot limit enforcement (e.g., max 2 per 15 minutes)
- Time block calculation and reset
- Prevent queue saturation with spotlights

### Business Rules
- Spotlight multiplier: 2.5× base price (configurable)
- Max slots per block: 2 (configurable)
- Time block duration: 15 minutes (configurable)
- Spotlight requests cannot be downgraded
- If vetoed, full spotlight price refunded

## UI Components Needed
- Request type selector (Standard vs Spotlight)
- Spotlight confirmation modal
- Benefit comparison list
- Availability indicator
- Slot countdown timer
- Gold star badge/icon
- Priority placement animation
- Price comparison display

## Analytics & Monitoring
- Spotlight adoption rate
- Revenue from spotlight vs standard
- Average wait time: spotlight vs standard
- Slot utilization percentage
- Peak demand times for spotlight

## Pricing Strategy Considerations
- Base price multiplier: 2-3×
- Dynamic pricing based on:
  - Time of night (peak hours higher)
  - Queue length
  - Demand (slot scarcity)
- Tier discounts apply to spotlight price

## Status
📋 **PLANNED** - Future Feature
