/**
 * GraphQL API Service for Mobile
 * Handles all GraphQL queries and mutations using Apollo Client
 */

import { gql } from '@apollo/client';
import { apolloClient } from './api';

// ==================================
// QUERIES
// ==================================

export const GET_EVENT = gql`
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

export const GET_DJ_SET = gql`
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

export const LIST_EVENT_DJ_SETS = gql`
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

export const LIST_PERFORMER_SETS = gql`
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

export const GET_QUEUE = gql`
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

export const GET_USER_REQUESTS = gql`
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

export const GET_USER_ACTIVE_REQUESTS = gql`
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

export const GET_EVENT_TRACKLIST = gql`
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

export const GET_PERFORMER_TRACKLIST = gql`
  query GetPerformerTracklist($performerId: ID!) {
    getPerformerTracklist(performerId: $performerId) {
      songs {
        id
        title
        artist
        genre
        duration
        albumArt
      }
      lastUpdated
    }
  }
`;

export const GET_GROUP_REQUEST = gql`
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

export const LIST_ACTIVE_EVENTS = gql`
  query ListActiveEvents {
    listActiveEvents {
      eventId
      venueName
      startTime
      endTime
      status
      totalRequests
    }
  }
`;

// ==================================
// MUTATIONS
// ==================================

export const CREATE_DJ_SET = gql`
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

export const CREATE_REQUEST = gql`
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

export const UPVOTE_REQUEST = gql`
  mutation UpvoteRequest($requestId: ID!) {
    upvoteRequest(requestId: $requestId) {
      requestId
      upvotes
    }
  }
`;

export const REORDER_QUEUE = gql`
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

export const VETO_REQUEST = gql`
  mutation VetoRequest($requestId: ID!, $reason: String) {
    vetoRequest(requestId: $requestId, reason: $reason) {
      requestId
      status
      vetoReason
    }
  }
`;

export const CREATE_GROUP_REQUEST = gql`
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

export const CONTRIBUTE_TO_GROUP_REQUEST = gql`
  mutation ContributeToGroupRequest($groupRequestId: ID!, $amount: Float!) {
    contributeToGroupRequest(groupRequestId: $groupRequestId, amount: $amount) {
      groupRequestId
      currentAmount
      status
    }
  }
`;

export const CREATE_EVENT = gql`
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

export const UPDATE_EVENT_STATUS = gql`
  mutation UpdateEventStatus($eventId: ID!, $status: EventStatus!) {
    updateEventStatus(eventId: $eventId, status: $status) {
      eventId
      status
    }
  }
`;

export const UPLOAD_TRACKLIST = gql`
  mutation UploadTracklist($performerId: ID!, $songs: [SongInput!]!) {
    uploadTracklist(performerId: $performerId, songs: $songs) {
      success
      songsAdded
      message
    }
  }
`;

export const SET_EVENT_TRACKLIST = gql`
  mutation SetEventTracklist($eventId: ID!, $songIds: [ID!]!) {
    setEventTracklist(eventId: $eventId, songIds: $songIds) {
      eventId
      songsCount
      message
    }
  }
`;

export const UPDATE_EVENT_SETTINGS = gql`
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

// Features 6, 10, 12 - Accept, Veto, Mark Playing
export const ACCEPT_REQUEST = gql`
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

export const MARK_REQUEST_AS_PLAYING = gql`
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

export const MARK_REQUEST_AS_COMPLETED = gql`
  mutation MarkRequestAsCompleted($requestId: ID!) {
    markRequestAsCompleted(requestId: $requestId) {
      requestId
      status
      completedAt
    }
  }
`;

export const PROCESS_REFUND = gql`
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

export const UPDATE_SET_STATUS = gql`
  mutation UpdateSetStatus($setId: ID!, $status: String!) {
    updateSetStatus(setId: $setId, status: $status) {
      setId
      status
      endedAt
    }
  }
`;

// ==================================
// SUBSCRIPTIONS
// ==================================

export const ON_QUEUE_UPDATE = gql`
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

export const ON_REQUEST_STATUS_CHANGE = gql`
  subscription OnRequestStatusChange($requestId: ID!) {
    onRequestStatusChange(requestId: $requestId) {
      requestId
      status
      queuePosition
    }
  }
`;

export const ON_NEW_REQUEST = gql`
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

export const ON_GROUP_REQUEST_UPDATE = gql`
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

// ==================================
// API HELPER FUNCTIONS
// ==================================

export async function fetchEvent(eventId: string) {
  const { data } = await apolloClient.query({
    query: GET_EVENT,
    variables: { eventId },
  });
  return data.getEvent;
}

export async function fetchQueue(setId: string) {
  const { data } = await apolloClient.query({
    query: GET_QUEUE,
    variables: { setId },
  });
  return data.getQueue;
}

export async function fetchDJSet(setId: string) {
  const { data } = await apolloClient.query({
    query: GET_DJ_SET,
    variables: { setId },
  });
  return data.getDJSet;
}

export async function fetchEventDJSets(eventId: string) {
  const { data } = await apolloClient.query({
    query: LIST_EVENT_DJ_SETS,
    variables: { eventId },
  });
  return data.listEventDJSets;
}

export async function fetchPerformerSets(performerId: string, limit?: number) {
  const { data } = await apolloClient.query({
    query: LIST_PERFORMER_SETS,
    variables: { performerId, limit },
  });
  return data.listPerformerSets;
}

export async function fetchActiveEvents() {
  const { data } = await apolloClient.query({
    query: LIST_ACTIVE_EVENTS,
  });
  return data.listActiveEvents;
}

export async function submitDJSet(input: any) {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_DJ_SET,
    variables: { input },
  });
  return data.createDJSet;
}

export async function submitRequest(input: any) {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_REQUEST,
    variables: { input },
  });
  return data.createRequest;
}

export async function submitUpvote(requestId: string) {
  const { data } = await apolloClient.mutate({
    mutation: UPVOTE_REQUEST,
    variables: { requestId },
  });
  return data.upvoteRequest;
}

export async function submitQueueReorder(setId: string, orderedRequestIds: string[]) {
  const { data } = await apolloClient.mutate({
    mutation: REORDER_QUEUE,
    variables: { setId, orderedRequestIds },
  });
  return data.reorderQueue;
}

export async function submitVeto(requestId: string, reason?: string) {
  const { data } = await apolloClient.mutate({
    mutation: VETO_REQUEST,
    variables: { requestId, reason },
  });
  return data.vetoRequest;
}

export async function submitGroupRequest(input: any) {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_GROUP_REQUEST,
    variables: { input },
  });
  return data.createGroupRequest;
}

export async function submitContribution(groupRequestId: string, amount: number) {
  const { data } = await apolloClient.mutate({
    mutation: CONTRIBUTE_TO_GROUP_REQUEST,
    variables: { groupRequestId, amount },
  });
  return data.contributeToGroupRequest;
}

export async function submitCreateEvent(input: any) {
  const { data } = await apolloClient.mutate({
    mutation: CREATE_EVENT,
    variables: { input },
  });
  return data.createEvent;
}

export async function submitUpdateEventStatus(eventId: string, status: string) {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_EVENT_STATUS,
    variables: { eventId, status },
  });
  return data.updateEventStatus;
}

export async function fetchEventTracklist(eventId: string) {
  const { data } = await apolloClient.query({
    query: GET_EVENT_TRACKLIST,
    variables: { eventId },
  });
  return data.getEventTracklist;
}

export async function fetchPerformerTracklist(performerId: string) {
  const { data } = await apolloClient.query({
    query: GET_PERFORMER_TRACKLIST,
    variables: { performerId },
  });
  return data.getPerformerTracklist;
}

export async function submitUploadTracklist(performerId: string, songs: any[]) {
  const { data } = await apolloClient.mutate({
    mutation: UPLOAD_TRACKLIST,
    variables: { performerId, songs },
  });
  return data.uploadTracklist;
}

// Features 6, 10, 12 - Helper Functions
export async function submitAcceptRequest(requestId: string, setId: string) {
  const { data } = await apolloClient.mutate({
    mutation: ACCEPT_REQUEST,
    variables: { requestId, setId },
  });
  return data.acceptRequest;
}

export async function submitMarkPlaying(requestId: string, setId: string) {
  const { data } = await apolloClient.mutate({
    mutation: MARK_REQUEST_AS_PLAYING,
    variables: { requestId, setId },
  });
  return data.markRequestAsPlaying;
}

export async function submitMarkCompleted(requestId: string) {
  const { data } = await apolloClient.mutate({
    mutation: MARK_REQUEST_AS_COMPLETED,
    variables: { requestId },
  });
  return data.markRequestAsCompleted;
}

export async function submitRefund(requestId: string, reason?: string) {
  const { data} = await apolloClient.mutate({
    mutation: PROCESS_REFUND,
    variables: { requestId, reason },
  });
  return data.processRefund;
}

export async function fetchUserActiveRequests(userId: string, eventId: string) {
  const { data } = await apolloClient.query({
    query: GET_USER_ACTIVE_REQUESTS,
    variables: { userId, eventId },
  });
  return data.getUserActiveRequests;
}

export async function submitUpdateSetStatus(setId: string, status: string) {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_SET_STATUS,
    variables: { setId, status },
  });
  return data.updateSetStatus;
}

export async function submitSetEventTracklist(eventId: string, songIds: string[]) {
  const { data } = await apolloClient.mutate({
    mutation: SET_EVENT_TRACKLIST,
    variables: { eventId, songIds },
  });
  return data.setEventTracklist;
}

export async function submitUpdateEventSettings(eventId: string, settings: any) {
  const { data } = await apolloClient.mutate({
    mutation: UPDATE_EVENT_SETTINGS,
    variables: { eventId, settings },
  });
  return data.updateEventSettings;
}

console.log('✅ GraphQL operations loaded');
