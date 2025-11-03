/**
 * GraphQL API Service
 * Handles all GraphQL queries and mutations
 */

import { API, graphqlOperation } from 'aws-amplify';

// Queries
export const getEvent = /* GraphQL */ `
  query GetEvent($eventId: ID!) {
    getEvent(eventId: $eventId) {
      eventId
      performerId
      venueName
      venueLocation {
        address
        city
        province
      }
      startTime
      endTime
      status
      settings {
        basePrice
        requestCapPerHour
        spotlightSlotsPerBlock
        allowDedications
        allowGroupRequests
      }
      qrCode
      totalRevenue
      totalRequests
    }
  }
`;

export const getQueue = /* GraphQL */ `
  query GetQueue($eventId: ID!) {
    getQueue(eventId: $eventId) {
      eventId
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

export const upvoteRequest = /* GraphQL */ `
  mutation UpvoteRequest($requestId: ID!) {
    upvoteRequest(requestId: $requestId) {
      requestId
      upvotes
    }
  }
`;

export const reorderQueue = /* GraphQL */ `
  mutation ReorderQueue($eventId: ID!, $orderedRequestIds: [ID!]!) {
    reorderQueue(eventId: $eventId, orderedRequestIds: $orderedRequestIds) {
      eventId
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
      venueName
      startTime
      qrCode
      status
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
  const response = await API.graphql(graphqlOperation(getEvent, { eventId }));
  return (response as any).data.getEvent;
}

export async function fetchQueue(eventId: string) {
  const response = await API.graphql(graphqlOperation(getQueue, { eventId }));
  return (response as any).data.getQueue;
}

export async function submitRequest(input: any) {
  const response = await API.graphql(graphqlOperation(createRequest, { input }));
  return (response as any).data.createRequest;
}

export async function submitUpvote(requestId: string) {
  const response = await API.graphql(graphqlOperation(upvoteRequest, { requestId }));
  return (response as any).data.upvoteRequest;
}

export async function submitQueueReorder(eventId: string, orderedRequestIds: string[]) {
  const response = await API.graphql(
    graphqlOperation(reorderQueue, { eventId, orderedRequestIds })
  );
  return (response as any).data.reorderQueue;
}

export async function submitVeto(requestId: string, reason?: string) {
  const response = await API.graphql(graphqlOperation(vetoRequest, { requestId, reason }));
  return (response as any).data.vetoRequest;
}

export async function submitGroupRequest(input: any) {
  const response = await API.graphql(graphqlOperation(createGroupRequest, { input }));
  return (response as any).data.createGroupRequest;
}

export async function submitContribution(groupRequestId: string, amount: number) {
  const response = await API.graphql(
    graphqlOperation(contributeToGroupRequest, { groupRequestId, amount })
  );
  return (response as any).data.contributeToGroupRequest;
}

export async function submitCreateEvent(input: any) {
  const response = await API.graphql(graphqlOperation(createEvent, { input }));
  return (response as any).data.createEvent;
}

export async function submitUpdateEventStatus(eventId: string, status: string) {
  const response = await API.graphql(graphqlOperation(updateEventStatus, { eventId, status }));
  return (response as any).data.updateEventStatus;
}
