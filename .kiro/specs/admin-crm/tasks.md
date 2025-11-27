# Implementation Plan

- [x] 1. Extend GraphQL Schema with Admin Types and Operations




  - [x] 1.1 Add admin enums to schema (UserStatus, VerificationStatus, EscrowStatus, DisputeRaiser, DisputeReason, DisputeStatus, DisputePriority, PayoutStatus)


    - Add all enum definitions to infrastructure/schema.graphql


    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 1.2 Add admin types to schema (AdminStats, AdminUser, AdminUserConnection, AdminTransaction, AdminTransactionConnection, Dispute, DisputeConnection, Payout, PayoutConnection)






    - Add all type definitions with proper field types
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


  - [x] 1.3 Add admin queries with @aws_auth directive (getAdminStats, listAllUsers, listAllTransactions, listAllDisputes, listAllPayouts)
    - Add queries to Query type with cognito_groups: ["Admins"] authorization
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_


  - [x] 1.4 Add admin mutations with @aws_auth directive (updateUserStatus, releaseEscrowFunds, refundTransaction, resolveDispute, processAdminPayout)
    - Add mutations to Mutation type with cognito_groups: ["Admins"] authorization

    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5_




- [x] 2. Create DynamoDB Tables and GSIs
  - [x] 2.1 Add Disputes table to Terraform configuration


    - Create BeatMatchMe-Disputes table with disputeId as partition key
    - Add status-createdAt-index GSI


    - _Requirements: 8.3_
  - [x] 2.2 Add Payouts table to Terraform configuration


    - Create BeatMatchMe-Payouts table with payoutId as partition key
    - Add performerId-index and status-index GSIs


    - _Requirements: 8.4_
  - [x] 2.3 Add role-status-index GSI to Users table


    - Update existing Users table Terraform to include new GSI
    - _Requirements: 8.1, 8.5_

  - [x] 2.4 Add status-createdAt-index GSI to Transactions table




    - Update existing Transactions table Terraform to include new GSI

    - _Requirements: 8.2, 8.5_




- [x] 3. Create AppSync Resolver Configuration
  - [x] 3.1 Create resolver configuration for getAdminStats query


    - Create VTL request/response templates that aggregate data from multiple tables
    - Configure Lambda data source for complex aggregation
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 3.2 Create resolver configuration for listAllUsers query
    - Create VTL templates for DynamoDB scan with role filter
    - Use role-status-index GSI for efficient queries

    - _Requirements: 7.1, 7.3, 7.4_
  - [x] 3.3 Create resolver configuration for listAllTransactions query
    - Create VTL templates for DynamoDB scan with status filter

    - Use status-createdAt-index GSI for efficient queries
    - _Requirements: 7.1, 7.3, 7.4_
  - [x] 3.4 Create resolver configuration for listAllDisputes query
    - Create VTL templates for DynamoDB scan on Disputes table
    - Use status-createdAt-index GSI for efficient queries

    - _Requirements: 7.1, 7.3, 7.4_
  - [x] 3.5 Create resolver configuration for listAllPayouts query
    - Create VTL templates for DynamoDB scan on Payouts table

    - Use status-index GSI for efficient queries
    - _Requirements: 7.1, 7.3, 7.4_
  - [x] 3.6 Create resolver configuration for updateUserStatus mutation

    - Create VTL templates for DynamoDB UpdateItem operation
    - Update status and updatedAt fields
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 3.7 Create resolver configuration for releaseEscrowFunds mutation
    - Create VTL templates for DynamoDB UpdateItem operation
    - Update status to RELEASED and set releasedAt timestamp

    - _Requirements: 7.2, 7.3, 7.4_
  - [x] 3.8 Create resolver configuration for refundTransaction mutation
    - Configure Lambda data source for payment provider integration
    - Update transaction status and trigger refund via payment provider
    - _Requirements: 7.2, 7.3, 7.4_
  - [x] 3.9 Create resolver configuration for resolveDispute mutation

    - Create VTL templates for DynamoDB UpdateItem on Disputes table
    - Trigger appropriate escrow action based on resolution
    - _Requirements: 7.2, 7.3, 7.4_
  - [x] 3.10 Create resolver configuration for processAdminPayout mutation
    - Configure Lambda data source for bank transfer integration
    - Update payout status through processing lifecycle
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 4. Update AppSync Configuration Files
  - [x] 4.1 Update appsync-config.json with admin data sources


    - Add DynamoDB data sources for Disputes and Payouts tables
    - Add Lambda data source for admin operations
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 4.2 Update appsync-resolvers.json with admin resolver mappings
    - Map all admin queries and mutations to their resolvers
    - Configure authorization settings
    - _Requirements: 7.1, 7.2, 7.3_



- [x] 5. Create Lambda Function for Admin Operations
  - [x] 5.1 Create adminOperations Lambda function
    - Implement getAdminStats aggregation logic

    - Implement refundTransaction with Yoco API integration
    - Implement processAdminPayout with bank transfer logic
    - _Requirements: 4.4, 6.2, 6.3, 6.4, 7.1, 7.2_
  - [x] 5.2 Add Lambda to Terraform configuration
    - Create Lambda function resource
    - Configure IAM role with DynamoDB and Secrets Manager access
    - Set up environment variables
    - _Requirements: 7.2_

- [x] 6. Create Cognito Admin Group
  - [x] 6.1 Add Admins group to Cognito User Pool via Terraform



    - Create Admins group in existing User Pool
    - Document admin user creation process
    - _Requirements: 1.2, 1.3, 3.4, 4.5, 5.4, 6.5_

- [x] 7. Write Integration Tests






  - [x] 7.1 Create tests for admin GraphQL queries

    - Test listAllUsers with role filter
    - Test listAllTransactions with status filter
    - Test getAdminStats aggregation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 7.2 Create tests for admin GraphQL mutations
    - Test updateUserStatus suspend/activate flow
    - Test releaseEscrowFunds state transition
    - Test refundTransaction with mock payment provider
    - Test resolveDispute with both actions
    - Test processAdminPayout lifecycle

    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4_
  - [ ] 7.3 Create authorization tests
    - Verify non-admin users receive UnauthorizedError
    - Verify admin group members can access all endpoints
    - _Requirements: 1.2, 1.3, 3.4, 4.5, 5.4, 6.5, 7.3_
