# Feature 19: Group Request Pooling (Audience)

## Overview
Allow multiple audience members to pool their money together to fund expensive song requests that individual users might not want to pay for alone.

## User Journey

### Initiating a Group Request

1. **Audience member wants expensive song but doesn't want to pay full price alone**
2. User selects song from library
3. On request screen, toggle appears: "Make this a Group Request"
4. User toggles on
5. Group request form shows:
   - Target amount (e.g., R200)
   - Individual contribution amount (user chooses, e.g., R50)
   - Time limit (e.g., "Expires in 10 minutes")
   - "Start Group Request" button
6. User taps "Start Group Request"
7. User pays their contribution (R50)
8. Group request posted with status: `FUNDING`

### Notification to Other Users

9. Other users see notification:
   - "New Group Request!"
   - Song title
   - "R50 / R200 funded"
   - Progress bar
   - "Contribute" button

### Other Users Contributing

10. Another user sees group request banner
11. User taps "Contribute"
12. Contribution modal shows:
    - Current funding status
    - Amount needed to complete
    - Suggested amounts (R25, R50, remaining)
    - "Contribute R[X]" button
13. User selects amount and pays
14. Progress bar updates in real-time
15. All contributors notified of new contribution

### Completion Scenarios

#### Success: Funding Reached
- When funding reaches 100% of target:
  - Group request status changes to `FUNDED`
  - Request submitted to DJ queue
  - All contributors notified: "Group request submitted!"
  - Contributors listed on request (if not anonymous)

#### Failure: Funding Expired
- If funding expires before reaching target:
  - All contributors automatically refunded
  - "Group request expired" notification sent

### DJ Perspective

- DJ sees group request in queue
- Badge shows "👥 GROUP REQUEST"
- Full target amount displayed (e.g., R200)
- Number of contributors shown
- DJ accepts/vetos normally
- If vetoed, all contributors refunded proportionally

## Technical Requirements

### Database Schema
- Group request tracking table
- Contribution tracking per user
- Real-time funding status updates

### Payment Integration
- Multi-contributor payment handling
- Proportional refund logic
- Automatic refund on expiration/veto

### Real-time Updates
- Live progress bar updates
- Contributor notifications
- Funding status changes

### Business Logic
- Time-based expiration
- Automatic fund pooling
- Request submission on 100% funding
- Refund distribution algorithm

## UI Components Needed
- Group request toggle
- Funding progress bar
- Contribution modal
- Real-time contributor list
- Group request badge for DJ view

## Status
📋 **PLANNED** - Future Feature
