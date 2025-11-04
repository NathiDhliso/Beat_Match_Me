# Feature 20: Tier Upgrade (Audience)

## Overview
Provide a subscription-based tier system allowing users to upgrade from free Bronze tier to paid tiers (Silver, Gold, Platinum) for enhanced benefits and features.

## User Journey

### Accessing Tier Upgrade

1. User taps profile icon in app
2. Profile screen shows current tier badge (e.g., BRONZE)
3. "Upgrade Tier" button displayed prominently
4. User taps "Upgrade Tier"

### Tier Comparison

5. Tier comparison modal opens showing all tiers side-by-side:

#### BRONZE (Free)
- ✓ Basic request functionality
- ✓ Standard queue position
- ✓ Email notifications
- ✓ 30-day request history

#### SILVER (R99/month)
- ✓ All Bronze benefits
- ✓ Priority queue placement
- ✓ 10% spotlight discount
- ✓ 90-day request history
- ✓ Early feature access

#### GOLD (R199/month)
- ✓ All Silver benefits
- ✓ Higher queue priority
- ✓ 20% spotlight discount
- ✓ Unlimited history
- ✓ VIP badge on requests
- ✓ Skip line 2× per event

#### PLATINUM (R399/month)
- ✓ All Gold benefits
- ✓ Highest priority
- ✓ 30% spotlight discount
- ✓ Guaranteed play (1 per event)
- ✓ Platinum badge
- ✓ Direct message to DJ
- ✓ Exclusive events access

### Subscription Purchase

6. User reviews benefits of each tier
7. User taps "Upgrade to [TIER]" button
8. Payment screen opens:
   - Subscription terms
   - Monthly price
   - First payment prorated
   - "Subscribe" button
9. User enters payment details
10. Subscription processed via Yoco

### Confirmation and Activation

11. Success animation plays
12. User's tier badge updates immediately
13. New benefits apply to all future requests
14. Confirmation email sent with receipt

## Technical Requirements

### Database Schema
```graphql
type User {
  id: ID!
  tier: UserTier!
  tierExpiresAt: AWSDateTime
  tierStartedAt: AWSDateTime
  subscriptionId: String
  subscriptionStatus: SubscriptionStatus
}

enum UserTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  PAYMENT_FAILED
}
```

### Subscription Management
- Yoco recurring payment integration
- Prorated billing for mid-month upgrades
- Automatic renewal handling
- Cancellation and downgrade logic
- Grace period for failed payments
- Subscription status tracking

### Benefit Application

#### Queue Priority
- Bronze: Base priority (0)
- Silver: +10 priority points
- Gold: +25 priority points
- Platinum: +50 priority points

#### Spotlight Discounts
- Applied automatically at checkout
- Stacks with promotional discounts (up to max)

#### Skip Line Feature
- Gold: 2 uses per event
- Platinum: Unlimited
- Tracked per event attendance
- UI shows remaining skips

#### Guaranteed Play (Platinum)
- 1 auto-approved request per event
- Bypasses DJ veto
- Still subject to content policy
- Special badge in queue

#### Direct Message to DJ (Platinum)
- In-app messaging feature
- DJ can enable/disable
- Rate limiting to prevent spam

### Backend Mutations
```graphql
mutation upgradeTier($targetTier: UserTier!) {
  upgradeTier(targetTier: $targetTier) {
    user {
      id
      tier
      tierExpiresAt
    }
    paymentUrl
    subscriptionId
  }
}

mutation cancelSubscription {
  cancelSubscription {
    user {
      id
      tier
      tierExpiresAt
    }
    effectiveDate
  }
}
```

### Payment Integration
- Yoco Subscription API
- Webhook handling for:
  - Successful payment
  - Failed payment
  - Subscription renewal
  - Subscription cancellation
- Automatic tier downgrade on expiration
- Refund handling for cancellations

## UI Components Needed
- Tier comparison table/cards
- Current tier badge display
- Upgrade CTA button
- Payment form
- Success animation
- Tier benefits modal
- Subscription management screen
- Usage tracking (skip line counter, etc.)

## Business Logic

### Upgrade Rules
- Can upgrade at any time
- Prorated charge for current month
- Immediate benefit activation
- No downgrade mid-subscription

### Cancellation Rules
- Can cancel at any time
- Benefits continue until period end
- No refund for partial month
- Auto-downgrade to Bronze after expiration

### Priority Calculation
```
finalPriority = basePrice + tierBonus + spotlightBonus + timestamp
```

### Discount Stacking
- Maximum discount: 30%
- Tier discount + promo code (if lower than tier)
- Spotlight discount applies to spotlight price only

## Analytics & Metrics
- Tier distribution (% users per tier)
- Upgrade conversion rate
- Average lifetime value by tier
- Churn rate per tier
- Feature usage by tier
- Revenue per tier
- Downgrade/cancellation reasons

## Marketing Considerations
- Free trial period (7 days) for Silver/Gold
- Upgrade prompts after 3rd standard request
- "Upgrade to skip line" CTA when queue is long
- Highlight savings for frequent users
- Referral bonuses
- Annual subscription discount (2 months free)

## Status
📋 **PLANNED** - Future Feature
