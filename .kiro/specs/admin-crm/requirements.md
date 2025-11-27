# Requirements Document

## Introduction

This document specifies the requirements for making the Admin CRM Dashboard production-ready for BeatMatchMe. The Admin CRM provides platform administrators with tools to manage users (DJs and Fans), monitor transactions, handle disputes, process payouts, and oversee escrow funds. The system uses AWS Cognito for authentication and requires admin group membership for access.

## Glossary

- **Admin_CRM**: The administrative dashboard for managing BeatMatchMe platform operations
- **Escrow**: Funds held by the platform between payment and release to performers
- **Payout**: Transfer of earned funds from the platform to a DJ's bank account
- **Dispute**: A contested transaction raised by either a fan or DJ
- **Platform_Fee**: The 10% commission taken by BeatMatchMe on each transaction
- **Cognito_Admin_Group**: AWS Cognito user group named "Admins" that grants admin access

## Requirements

### Requirement 1: Admin Authentication

**User Story:** As a platform administrator, I want to securely access the Admin CRM using my Cognito credentials, so that only authorized personnel can manage platform operations.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to /admin, THE Admin_CRM SHALL display a login form requesting email and password.
2. WHEN a user submits valid Cognito credentials, THE Admin_CRM SHALL verify the user belongs to the Cognito_Admin_Group or has custom:role set to ADMIN.
3. IF a user authenticates but is not in the Cognito_Admin_Group, THEN THE Admin_CRM SHALL display an access denied message and prevent dashboard access.
4. WHEN an authenticated admin clicks logout, THE Admin_CRM SHALL terminate the session and redirect to the login form.
5. THE Admin_CRM route SHALL NOT be linked from any public UI element in the application.

### Requirement 2: GraphQL Schema for Admin Operations

**User Story:** As a backend developer, I want the GraphQL schema to include all admin queries and mutations, so that the Admin CRM can fetch and modify platform data.

#### Acceptance Criteria

1. THE GraphQL schema SHALL include a listAllUsers query that accepts role, limit, and nextToken parameters and returns paginated user data including userId, email, name, role, tier, status, totalSpent, totalEarnings, totalRequests, totalEvents, rating, createdAt, lastActiveAt, and verificationStatus.
2. THE GraphQL schema SHALL include a listAllTransactions query that accepts status, limit, and nextToken parameters and returns paginated transaction data including transactionId, requestId, userId, userName, performerId, performerName, eventId, eventName, songTitle, artistName, amount, platformFee, performerEarnings, status, paymentProvider, providerTransactionId, createdAt, releasedAt, and refundedAt.
3. THE GraphQL schema SHALL include a listAllDisputes query that accepts status, limit, and nextToken parameters and returns paginated dispute data including disputeId, transactionId, raisedBy, raisedById, raisedByName, reason, description, status, priority, assignedTo, resolution, createdAt, and updatedAt.
4. THE GraphQL schema SHALL include a listAllPayouts query that accepts status, limit, and nextToken parameters and returns paginated payout data including payoutId, performerId, performerName, amount, transactionCount, status, bankName, accountNumber, reference, createdAt, processedAt, and failureReason.
5. THE GraphQL schema SHALL include a getAdminStats query that returns totalDJs, activeDJs, totalFans, activeFans, totalTransactions, heldFunds, releasedToday, pendingPayouts, openDisputes, platformRevenue, and platformRevenueToday.

### Requirement 3: User Management Mutations

**User Story:** As a platform administrator, I want to suspend or activate user accounts, so that I can enforce platform policies and manage problematic users.

#### Acceptance Criteria

1. THE GraphQL schema SHALL include an updateUserStatus mutation that accepts userId, status, and optional reason parameters.
2. WHEN an admin calls updateUserStatus with status SUSPENDED, THE system SHALL update the user record and prevent the user from accessing platform features.
3. WHEN an admin calls updateUserStatus with status ACTIVE, THE system SHALL restore the user's access to platform features.
4. THE updateUserStatus mutation SHALL require admin authentication via Cognito_Admin_Group membership.

### Requirement 4: Escrow and Transaction Management

**User Story:** As a platform administrator, I want to release escrow funds or process refunds, so that I can resolve payment issues and ensure proper fund distribution.

#### Acceptance Criteria

1. THE GraphQL schema SHALL include a releaseEscrowFunds mutation that accepts transactionId and releases held funds to the performer.
2. THE GraphQL schema SHALL include a refundTransaction mutation that accepts transactionId and reason, and processes a refund to the original payer.
3. WHEN releaseEscrowFunds is called, THE system SHALL update the transaction status to RELEASED and record the releasedAt timestamp.
4. WHEN refundTransaction is called, THE system SHALL update the transaction status to REFUNDED, record the refundedAt timestamp, and initiate the refund through the payment provider.
5. THE escrow mutations SHALL require admin authentication via Cognito_Admin_Group membership.

### Requirement 5: Dispute Resolution

**User Story:** As a platform administrator, I want to review and resolve disputes, so that I can fairly adjudicate conflicts between fans and DJs.

#### Acceptance Criteria

1. THE GraphQL schema SHALL include a resolveDispute mutation that accepts disputeId, resolution notes, and action (REFUND or RELEASE).
2. WHEN resolveDispute is called with action REFUND, THE system SHALL process a refund to the fan and update the dispute status to RESOLVED.
3. WHEN resolveDispute is called with action RELEASE, THE system SHALL release funds to the DJ and update the dispute status to RESOLVED.
4. THE resolveDispute mutation SHALL require admin authentication via Cognito_Admin_Group membership.

### Requirement 6: Payout Processing

**User Story:** As a platform administrator, I want to process DJ payouts, so that performers receive their earned funds in a timely manner.

#### Acceptance Criteria

1. THE GraphQL schema SHALL include a processAdminPayout mutation that accepts payoutId and initiates the bank transfer.
2. WHEN processAdminPayout is called, THE system SHALL update the payout status to PROCESSING and initiate the transfer.
3. WHEN the bank transfer completes successfully, THE system SHALL update the payout status to COMPLETED and record the processedAt timestamp.
4. IF the bank transfer fails, THEN THE system SHALL update the payout status to FAILED and record the failureReason.
5. THE processAdminPayout mutation SHALL require admin authentication via Cognito_Admin_Group membership.

### Requirement 7: AppSync Resolver Implementation

**User Story:** As a backend developer, I want AppSync resolvers configured for all admin operations, so that the GraphQL API can execute admin queries and mutations.

#### Acceptance Criteria

1. THE AppSync configuration SHALL include resolvers for listAllUsers, listAllTransactions, listAllDisputes, listAllPayouts, and getAdminStats queries.
2. THE AppSync configuration SHALL include resolvers for updateUserStatus, releaseEscrowFunds, refundTransaction, resolveDispute, and processAdminPayout mutations.
3. EACH admin resolver SHALL verify the caller belongs to the Cognito_Admin_Group before executing the operation.
4. THE resolvers SHALL connect to DynamoDB tables for data retrieval and modification.

### Requirement 8: DynamoDB Data Model Extensions

**User Story:** As a backend developer, I want the DynamoDB tables to support admin operations, so that user status, transaction status, disputes, and payouts can be stored and queried efficiently.

#### Acceptance Criteria

1. THE Users table SHALL include status, totalSpent, totalEarnings, totalRequests, totalEvents, rating, lastActiveAt, and verificationStatus attributes.
2. THE Transactions table SHALL include platformFee, performerEarnings, status (PENDING, HELD, RELEASED, REFUNDED), releasedAt, and refundedAt attributes.
3. THE system SHALL include a Disputes table with disputeId, transactionId, raisedBy, raisedById, raisedByName, reason, description, status, priority, assignedTo, resolution, createdAt, and updatedAt attributes.
4. THE system SHALL include a Payouts table with payoutId, performerId, performerName, amount, transactionCount, status, bankName, accountNumber, reference, createdAt, processedAt, and failureReason attributes.
5. THE DynamoDB tables SHALL include GSIs to support queries by status and role.
