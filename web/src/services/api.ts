import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { fetchAuthSession } from 'aws-amplify/auth';
import awsconfig from '../aws-exports';

// Create HTTP link to AppSync
const httpLink = new HttpLink({
  uri: awsconfig.API.GraphQL.endpoint,
});

// Auth link to add Cognito token to requests
const authLink = setContext(async (_, { headers }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.error('Error getting auth token:', error);
    return { headers };
  }
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

// GraphQL Queries and Mutations
export const QUERIES = {
  GET_USER: `
    query GetUser($userId: ID!) {
      getUser(userId: $userId) {
        userId
        email
        name
        role
        tier
        profileImage
        phone
        stats {
          totalRequests
          successfulRequests
          eventsAttended
          genresExplored
        }
      }
    }
  `,

  GET_EVENT: `
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
        totalRevenue
        totalRequests
      }
    }
  `,

  LIST_EVENTS: `
    query ListEvents($performerId: ID, $status: EventStatus) {
      listEvents(performerId: $performerId, status: $status) {
        items {
          eventId
          venueName
          startTime
          endTime
          status
          totalRevenue
          totalRequests
        }
      }
    }
  `,

  GET_QUEUE: `
    query GetQueue($eventId: ID!) {
      getQueue(eventId: $eventId) {
        queueId
        eventId
        requests {
          requestId
          songTitle
          artistName
          genre
          status
          requestType
          price
          queuePosition
          user {
            userId
            name
            tier
            profileImage
          }
          submittedAt
        }
      }
    }
  `,

  LIST_REQUESTS: `
    query ListRequests($userId: ID, $eventId: ID, $status: RequestStatus) {
      listRequests(userId: $userId, eventId: $eventId, status: $status) {
        items {
          requestId
          eventId
          songTitle
          artistName
          genre
          status
          requestType
          price
          queuePosition
          submittedAt
          playedAt
        }
      }
    }
  `,
};

export const MUTATIONS = {
  CREATE_EVENT: `
    mutation CreateEvent($input: CreateEventInput!) {
      createEvent(input: $input) {
        eventId
        venueName
        startTime
        status
      }
    }
  `,

  UPDATE_EVENT: `
    mutation UpdateEvent($eventId: ID!, $input: UpdateEventInput!) {
      updateEvent(eventId: $eventId, input: $input) {
        eventId
        status
      }
    }
  `,

  CREATE_REQUEST: `
    mutation CreateRequest($input: CreateRequestInput!) {
      createRequest(input: $input) {
        requestId
        eventId
        songTitle
        artistName
        status
        price
        queuePosition
      }
    }
  `,

  UPDATE_REQUEST_STATUS: `
    mutation UpdateRequestStatus($requestId: ID!, $status: RequestStatus!) {
      updateRequestStatus(requestId: $requestId, status: $status) {
        requestId
        status
        queuePosition
        playedAt
      }
    }
  `,

  PROCESS_PAYMENT: `
    mutation ProcessPayment($input: ProcessPaymentInput!) {
      processPayment(input: $input) {
        transactionId
        status
        amount
        requestId
      }
    }
  `,
};

export const SUBSCRIPTIONS = {
  ON_QUEUE_UPDATE: `
    subscription OnQueueUpdate($eventId: ID!) {
      onQueueUpdate(eventId: $eventId) {
        queueId
        eventId
        requests {
          requestId
          songTitle
          artistName
          status
          queuePosition
        }
      }
    }
  `,

  ON_REQUEST_STATUS_CHANGE: `
    subscription OnRequestStatusChange($requestId: ID!) {
      onRequestStatusChange(requestId: $requestId) {
        requestId
        status
        queuePosition
        playedAt
      }
    }
  `,
};
