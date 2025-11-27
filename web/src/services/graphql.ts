/**
 * GraphQL API Service
 * Handles all GraphQL queries and mutations
 */

import { generateClient } from 'aws-amplify/api';

// Create client with explicit userPool auth mode
const client = generateClient({
  authMode: 'userPool'
});

// Queries
export const getEvent = /* GraphQL */ `
  query GetEvent($eventId: ID!) {
    getEvent(eventId: $eventId) {
      eventId
      createdBy
      venueName
      venueLocation {
        address
        city
        province
      }
      startTime
      endTime
      status
      totalRevenue
      totalRequests
      createdAt
    }
  }
`;

export const getDJSet = /* GraphQL */ `
  query GetDJSet($setId: ID!) {
    getDJSet(setId: $setId) {
      setId
      eventId
      performerId
      setStartTime
      setEndTime
      status
      isAcceptingRequests
      revenue
      requestCount
      settings {
        basePrice
        requestCapPerHour
        spotlightSlotsPerBlock
        allowDedications
        allowGroupRequests
      }
      playlistType
      playlistId
      playlistName
      playlistTracks
      playlistAppliedAt
      createdAt
    }
  }
`;

export const listEventDJSets = /* GraphQL */ `
  query ListEventDJSets($eventId: ID!) {
    listEventDJSets(eventId: $eventId) {
      setId
      eventId
      performerId
      setStartTime
      setEndTime
      status
      isAcceptingRequests
      revenue
      requestCount
      createdAt
    }
  }
`;

export const listPerformerSets = /* GraphQL */ `
  query ListPerformerSets($performerId: ID!, $limit: Int) {
    listPerformerSets(performerId: $performerId, limit: $limit) {
      setId
      eventId
      performerId
      setStartTime
      setEndTime
      status
      isAcceptingRequests
      revenue
      requestCount
      playlistType
      playlistId
      playlistName
      playlistTracks
      playlistAppliedAt
      createdAt
    }
  }
`;

export const getQueue = /* GraphQL */ `
  query GetQueue($setId: ID!) {
    getQueue(setId: $setId) {
      setId
      eventId
      performerId
      orderedRequests {
        requestId
        songTitle
        artistName
        userName
        userTier
        requestType
        queuePosition
        upvotes
        dedication
        status
      }
      lastUpdated
      currentlyPlaying {
        requestId
        songTitle
        artistName
      }
    }
  }
`;

export const getUserRequests = /* GraphQL */ `
  query GetUserRequests($userId: ID!, $limit: Int) {
    getUserRequests(userId: $userId, limit: $limit) {
      requestId
      songTitle
      artistName
      status
      queuePosition
      price
      submittedAt
      upvotes
    }
  }
`;

export const getEventTracklist = /* GraphQL */ `
  query GetEventTracklist($eventId: ID!) {
    getEventTracklist(eventId: $eventId) {
      trackId
      title
      artist
      genre
      duration
      albumArt
      basePrice
    }
  }
`;

export const getPerformerTracklist = /* GraphQL */ `
  query GetPerformerTracklist($performerId: ID!) {
    getPerformerTracklist(performerId: $performerId) {
      songs {
        id
        title
        artist
        genre
        basePrice
        duration
        albumArt
      }
    }
  }
`;

export const getGroupRequest = /* GraphQL */ `
  query GetGroupRequest($groupRequestId: ID!) {
    getGroupRequest(groupRequestId: $groupRequestId) {
      groupRequestId
      songTitle
      artistName
      targetAmount
      currentAmount
      contributors {
        userId
        amount
        contributedAt
      }
      status
      expiresAt
    }
  }
`;

// Mutations
export const createDJSet = /* GraphQL */ `
  mutation CreateDJSet($input: CreateDJSetInput!) {
    createDJSet(input: $input) {
      setId
      eventId
      performerId
      setStartTime
      setEndTime
      status
      isAcceptingRequests
      revenue
      requestCount
      createdAt
    }
  }
`;

export const createRequest = /* GraphQL */ `
  mutation CreateRequest($input: CreateRequestInput!) {
    createRequest(input: $input) {
      requestId
      songTitle
      artistName
      price
      queuePosition
      status
    }
  }
`;

// NEW: Secure mutation with integrated payment verification
export const submitRequestWithPayment = /* GraphQL */ `
  mutation SubmitRequestWithPayment($input: SubmitRequestWithPaymentInput!) {
    submitRequestWithPayment(input: $input) {
      success
      request {
        requestId
        eventId
        userId
        songTitle
        artistName
        requestType
        price
        queuePosition
        status
        dedication
        shoutout
        submittedAt
      }
      transaction {
        transactionId
        amount
        platformFee
        performerEarnings
        status
        paymentProvider
        providerTransactionId
        createdAt
      }
      errorCode
      errorMessage
    }
  }
`;

export const upvoteRequest = /* GraphQL */ `
  mutation UpvoteRequest($requestId: ID!) {
    upvoteRequest(requestId: $requestId) {
      requestId
      upvotes
    }
  }
`;

export const reorderQueue = /* GraphQL */ `
  mutation ReorderQueue($setId: ID!, $orderedRequestIds: [ID!]!) {
    reorderQueue(setId: $setId, orderedRequestIds: $orderedRequestIds) {
      setId
      eventId
      performerId
      orderedRequests {
        requestId
        queuePosition
      }
      lastUpdated
    }
  }
`;

export const vetoRequest = /* GraphQL */ `
  mutation VetoRequest($requestId: ID!, $reason: String) {
    vetoRequest(requestId: $requestId, reason: $reason) {
      requestId
      status
      vetoReason
    }
  }
`;

export const createGroupRequest = /* GraphQL */ `
  mutation CreateGroupRequest($input: GroupRequestInput!) {
    createGroupRequest(input: $input) {
      groupRequestId
      songTitle
      artistName
      targetAmount
      expiresAt
    }
  }
`;

export const contributeToGroupRequest = /* GraphQL */ `
  mutation ContributeToGroupRequest($groupRequestId: ID!, $amount: Float!) {
    contributeToGroupRequest(groupRequestId: $groupRequestId, amount: $amount) {
      groupRequestId
      currentAmount
      status
    }
  }
`;

export const createEvent = /* GraphQL */ `
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      eventId
      createdBy
      venueName
      startTime
      endTime
      status
      createdAt
    }
  }
`;

export const updateEventStatus = /* GraphQL */ `
  mutation UpdateEventStatus($eventId: ID!, $status: EventStatus!) {
    updateEventStatus(eventId: $eventId, status: $status) {
      eventId
      status
    }
  }
`;

export const uploadTracklist = /* GraphQL */ `
  mutation UploadTracklist($performerId: ID!, $songs: [SongInput!]!) {
    uploadTracklist(performerId: $performerId, songs: $songs) {
      success
      songsAdded
    }
  }
`;

export const setEventTracklist = /* GraphQL */ `
  mutation SetEventTracklist($eventId: ID!, $songIds: [ID!]!) {
    setEventTracklist(eventId: $eventId, songIds: $songIds) {
      eventId
      songsCount
      message
    }
  }
`;

export const updateEventSettings = /* GraphQL */ `
  mutation UpdateEventSettings($eventId: ID!, $settings: EventSettingsInput!) {
    updateEventSettings(eventId: $eventId, settings: $settings) {
      eventId
      settings {
        basePrice
        requestCapPerHour
        spotlightSlotsPerBlock
        spotlightPriceMultiplier
        allowDedications
        allowGroupRequests
        isSoldOut
      }
    }
  }
`;

// Subscriptions
export const onQueueUpdate = /* GraphQL */ `
  subscription OnQueueUpdate($eventId: ID!) {
    onQueueUpdate(eventId: $eventId) {
      eventId
      orderedRequests {
        requestId
        queuePosition
      }
      lastUpdated
    }
  }
`;

export const onRequestStatusChange = /* GraphQL */ `
  subscription OnRequestStatusChange($requestId: ID!) {
    onRequestStatusChange(requestId: $requestId) {
      requestId
      status
      queuePosition
    }
  }
`;

export const onNewRequest = /* GraphQL */ `
  subscription OnNewRequest($eventId: ID!) {
    onNewRequest(eventId: $eventId) {
      requestId
      songTitle
      artistName
      userName
      requestType
    }
  }
`;

export const onGroupRequestUpdate = /* GraphQL */ `
  subscription OnGroupRequestUpdate($groupRequestId: ID!) {
    onGroupRequestUpdate(groupRequestId: $groupRequestId) {
      groupRequestId
      currentAmount
      contributors {
        userId
        amount
      }
      status
    }
  }
`;

// API Helper Functions
export async function fetchEvent(eventId: string) {
  const response: any = await client.graphql({ query: getEvent, variables: { eventId } });
  return response.data.getEvent;
}

export async function fetchQueue(setId: string) {
  const response: any = await client.graphql({ query: getQueue, variables: { setId } });
  return response.data.getQueue;
}

export async function fetchDJSet(setId: string) {
  const response: any = await client.graphql({ query: getDJSet, variables: { setId } });
  return response.data.getDJSet;
}

export async function fetchEventDJSets(eventId: string) {
  const response: any = await client.graphql({ query: listEventDJSets, variables: { eventId } });
  return response.data.listEventDJSets;
}

export async function fetchPerformerSets(performerId: string, limit?: number) {
  const response: any = await client.graphql({ query: listPerformerSets, variables: { performerId, limit } });
  return response.data.listPerformerSets;
}

export async function submitDJSet(input: any) {
  const response: any = await client.graphql({ query: createDJSet, variables: { input } });
  return response.data.createDJSet;
}

export async function submitRequest(input: any) {
  const response: any = await client.graphql({ query: createRequest, variables: { input } });
  return response.data.createRequest;
}

// NEW: Secure request submission with payment verification
export async function submitRequestWithPaymentVerification(input: any) {
  const response: any = await client.graphql({ 
    query: submitRequestWithPayment, 
    variables: { input } 
  });
  
  const result = response.data.submitRequestWithPayment;
  
  // Handle errors from backend
  if (!result.success) {
    const error: any = new Error(result.errorMessage || 'Request submission failed');
    error.code = result.errorCode;
    error.details = result;
    throw error;
  }
  
  return result;
}

export async function submitUpvote(requestId: string) {
  const response: any = await client.graphql({ query: upvoteRequest, variables: { requestId } });
  return response.data.upvoteRequest;
}

export async function submitQueueReorder(setId: string, orderedRequestIds: string[]) {
  const response: any = await client.graphql({
    query: reorderQueue,
    variables: { setId, orderedRequestIds }
  });
  return response.data.reorderQueue;
}

export async function submitVeto(requestId: string, reason?: string) {
  const response: any = await client.graphql({ query: vetoRequest, variables: { requestId, reason } });
  return response.data.vetoRequest;
}

export async function submitGroupRequest(input: any) {
  const response: any = await client.graphql({ query: createGroupRequest, variables: { input } });
  return response.data.createGroupRequest;
}

export async function submitContribution(groupRequestId: string, amount: number) {
  const response: any = await client.graphql({
    query: contributeToGroupRequest,
    variables: { groupRequestId, amount }
  });
  return response.data.contributeToGroupRequest;
}

export async function submitCreateEvent(input: any) {
  const response: any = await client.graphql({ query: createEvent, variables: { input } });
  return response.data.createEvent;
}

export async function submitUpdateEventStatus(eventId: string, status: string) {
  const response: any = await client.graphql({ query: updateEventStatus, variables: { eventId, status } });
  return response.data.updateEventStatus;
}

export async function fetchEventTracklist(eventId: string) {
  const response: any = await client.graphql({ query: getEventTracklist, variables: { eventId } });
  return response.data.getEventTracklist;
}

export async function fetchPerformerTracklist(performerId: string) {
  const response: any = await client.graphql({ query: getPerformerTracklist, variables: { performerId } });
  return response.data.getPerformerTracklist;
}

export async function submitUploadTracklist(performerId: string, songs: any[]) {
  const response: any = await client.graphql({ query: uploadTracklist, variables: { performerId, songs } });
  return response.data.uploadTracklist;
}

// ============================================
// NEW MUTATIONS - Features 6, 10, 12
// ============================================

export const acceptRequest = /* GraphQL */ `
  mutation AcceptRequest($requestId: ID!, $setId: ID!) {
    acceptRequest(requestId: $requestId, setId: $setId) {
      requestId
      status
      acceptedAt
      queuePosition
      songTitle
      artistName
    }
  }
`;

export const markRequestAsPlaying = /* GraphQL */ `
  mutation MarkRequestAsPlaying($requestId: ID!, $setId: ID!) {
    markRequestAsPlaying(requestId: $requestId, setId: $setId) {
      requestId
      status
      playedAt
      songTitle
      artistName
    }
  }
`;

export const markRequestAsCompleted = /* GraphQL */ `
  mutation MarkRequestAsCompleted($requestId: ID!) {
    markRequestAsCompleted(requestId: $requestId) {
      requestId
      status
      completedAt
    }
  }
`;

export async function submitAcceptRequest(requestId: string, setId: string) {
  const response: any = await client.graphql({
    query: acceptRequest,
    variables: { requestId, setId }
  });
  return response.data.acceptRequest;
}

export async function submitMarkPlaying(requestId: string, setId: string) {
  const response: any = await client.graphql({
    query: markRequestAsPlaying,
    variables: { requestId, setId }
  });
  return response.data.markRequestAsPlaying;
}

export async function submitMarkCompleted(requestId: string) {
  const response: any = await client.graphql({
    query: markRequestAsCompleted,
    variables: { requestId }
  });
  return response.data.markRequestAsCompleted;
}

// ============================================
// REFUND MUTATIONS - Feature 6
// ============================================

export const processRefund = /* GraphQL */ `
  mutation ProcessRefund($requestId: ID!, $reason: String) {
    processRefund(requestId: $requestId, reason: $reason) {
      refundId
      amount
      status
      transactionId
      estimatedDays
      refundedAt
    }
  }
`;

export const getUserActiveRequests = /* GraphQL */ `
  query GetUserActiveRequests($userId: ID!, $eventId: ID!) {
    getUserActiveRequests(userId: $userId, eventId: $eventId) {
      requestId
      songId
      songTitle
      artistName
      queuePosition
      status
      price
      submittedAt
    }
  }
`;

export const updateSetStatus = /* GraphQL */ `
  mutation UpdateSetStatus($setId: ID!, $status: String!) {
    updateSetStatus(setId: $setId, status: $status) {
      setId
      status
    }
  }
`;

export async function submitRefund(requestId: string, reason?: string) {
  const response: any = await client.graphql({
    query: processRefund,
    variables: { requestId, reason }
  });
  return response.data.processRefund;
}

export async function fetchUserActiveRequests(userId: string, eventId: string) {
  const response: any = await client.graphql({
    query: getUserActiveRequests,
    variables: { userId, eventId }
  });
  return response.data.getUserActiveRequests;
}

export async function submitUpdateSetStatus(setId: string, status: string) {
  const response: any = await client.graphql({
    query: updateSetStatus,
    variables: { setId, status }
  });
  return response.data.updateSetStatus;
}


export async function submitSetEventTracklist(eventId: string, songIds: string[]) {
  const response: any = await client.graphql({ query: setEventTracklist, variables: { eventId, songIds } });
  return response.data.setEventTracklist;
}

export async function submitUpdateEventSettings(eventId: string, settings: any) {
  const response: any = await client.graphql({ query: updateEventSettings, variables: { eventId, settings } });
  return response.data.updateEventSettings;
}

// ============================================
// ADMIN CRM QUERIES
// ============================================

export const listAllEvents = /* GraphQL */ `
  query ListAllEvents($limit: Int, $nextToken: String) {
    listAllEvents(limit: $limit, nextToken: $nextToken) {
      items {
        eventId
        createdBy
        venueName
        venueLocation {
          address
          city
          province
        }
        startTime
        endTime
        status
        totalRevenue
        totalRequests
        createdAt
      }
      nextToken
    }
  }
`;

export const listAllUsers = /* GraphQL */ `
  query ListAllUsers($role: String, $limit: Int, $nextToken: String) {
    listAllUsers(role: $role, limit: $limit, nextToken: $nextToken) {
      items {
        userId
        email
        name
        role
        tier
        status
        totalSpent
        totalEarnings
        totalRequests
        totalEvents
        rating
        createdAt
        lastActiveAt
        verificationStatus
      }
      nextToken
    }
  }
`;

export const listAllTransactions = /* GraphQL */ `
  query ListAllTransactions($status: String, $limit: Int, $nextToken: String) {
    listAllTransactions(status: $status, limit: $limit, nextToken: $nextToken) {
      items {
        transactionId
        requestId
        userId
        userName
        performerId
        performerName
        eventId
        eventName
        songTitle
        artistName
        amount
        platformFee
        performerEarnings
        status
        paymentProvider
        providerTransactionId
        createdAt
        releasedAt
        refundedAt
      }
      nextToken
    }
  }
`;

export const listAllDisputes = /* GraphQL */ `
  query ListAllDisputes($status: String, $limit: Int, $nextToken: String) {
    listAllDisputes(status: $status, limit: $limit, nextToken: $nextToken) {
      items {
        disputeId
        transactionId
        raisedBy
        raisedById
        raisedByName
        reason
        description
        status
        priority
        assignedTo
        resolution
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const listAllPayouts = /* GraphQL */ `
  query ListAllPayouts($status: String, $limit: Int, $nextToken: String) {
    listAllPayouts(status: $status, limit: $limit, nextToken: $nextToken) {
      items {
        payoutId
        performerId
        performerName
        amount
        transactionCount
        status
        bankName
        accountNumber
        reference
        createdAt
        processedAt
        failureReason
      }
      nextToken
    }
  }
`;

export const getAdminStats = /* GraphQL */ `
  query GetAdminStats {
    getAdminStats {
      totalDJs
      activeDJs
      totalFans
      activeFans
      totalTransactions
      heldFunds
      releasedToday
      pendingPayouts
      openDisputes
      platformRevenue
      platformRevenueToday
    }
  }
`;

export const resolveDispute = /* GraphQL */ `
  mutation ResolveDispute($disputeId: ID!, $resolution: String!, $action: String!) {
    resolveDispute(disputeId: $disputeId, resolution: $resolution, action: $action) {
      disputeId
      status
      resolution
      resolvedAt
    }
  }
`;

export const processAdminPayout = /* GraphQL */ `
  mutation ProcessAdminPayout($payoutId: ID!) {
    processAdminPayout(payoutId: $payoutId) {
      payoutId
      status
      processedAt
    }
  }
`;

export const updateUserStatus = /* GraphQL */ `
  mutation UpdateUserStatus($userId: ID!, $status: String!, $reason: String) {
    updateUserStatus(userId: $userId, status: $status, reason: $reason) {
      userId
      status
    }
  }
`;

export const releaseEscrowFunds = /* GraphQL */ `
  mutation ReleaseEscrowFunds($transactionId: ID!) {
    releaseEscrowFunds(transactionId: $transactionId) {
      transactionId
      status
      releasedAt
    }
  }
`;

export const refundTransaction = /* GraphQL */ `
  mutation RefundTransaction($transactionId: ID!, $reason: String!) {
    refundTransaction(transactionId: $transactionId, reason: $reason) {
      transactionId
      status
      refundedAt
    }
  }
`;

export async function fetchAdminStats() {
  const response: any = await client.graphql({ query: getAdminStats });
  return response.data.getAdminStats;
}

export async function fetchAllEvents(limit?: number, nextToken?: string) {
  const response: any = await client.graphql({ 
    query: listAllEvents, 
    variables: { limit, nextToken } 
  });
  return response.data.listAllEvents;
}

export async function fetchAllUsers(role?: string, limit?: number, nextToken?: string) {
  const response: any = await client.graphql({ 
    query: listAllUsers, 
    variables: { role, limit, nextToken } 
  });
  return response.data.listAllUsers;
}

export async function fetchAllTransactions(status?: string, limit?: number, nextToken?: string) {
  const response: any = await client.graphql({ 
    query: listAllTransactions, 
    variables: { status, limit, nextToken } 
  });
  return response.data.listAllTransactions;
}

export async function fetchAllDisputes(status?: string, limit?: number, nextToken?: string) {
  const response: any = await client.graphql({ 
    query: listAllDisputes, 
    variables: { status, limit, nextToken } 
  });
  return response.data.listAllDisputes;
}

export async function fetchAllPayouts(status?: string, limit?: number, nextToken?: string) {
  const response: any = await client.graphql({ 
    query: listAllPayouts, 
    variables: { status, limit, nextToken } 
  });
  return response.data.listAllPayouts;
}

export async function submitResolveDispute(disputeId: string, resolution: string, action: string) {
  const response: any = await client.graphql({ 
    query: resolveDispute, 
    variables: { disputeId, resolution, action } 
  });
  return response.data.resolveDispute;
}

export async function submitProcessPayout(payoutId: string) {
  const response: any = await client.graphql({ 
    query: processAdminPayout, 
    variables: { payoutId } 
  });
  return response.data.processAdminPayout;
}

export async function submitUpdateUserStatus(userId: string, status: string, reason?: string) {
  const response: any = await client.graphql({ 
    query: updateUserStatus, 
    variables: { userId, status, reason } 
  });
  return response.data.updateUserStatus;
}

export async function submitReleaseEscrow(transactionId: string) {
  const response: any = await client.graphql({ 
    query: releaseEscrowFunds, 
    variables: { transactionId } 
  });
  return response.data.releaseEscrowFunds;
}

export async function submitRefundTransaction(transactionId: string, reason: string) {
  const response: any = await client.graphql({ 
    query: refundTransaction, 
    variables: { transactionId, reason } 
  });
  return response.data.refundTransaction;
}
