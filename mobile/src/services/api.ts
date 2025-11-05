import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { fetchAuthSession } from 'aws-amplify/auth';
import awsconfig from '../config/aws-exports';
import NetInfo from '@react-native-community/netinfo';

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
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    return { headers };
  }
});

// Error link for better error handling
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `❌ GraphQL Error: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`❌ Network Error: ${networkError}`);
    console.error('Operation:', operation.operationName);
  }
});

// Create Apollo Client with cache persistence support
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getQueue: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          listActiveEvents: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Network status monitoring
let isOnline = true;
let networkUnsubscribe: (() => void) | null = null;

export const initializeNetworkMonitoring = () => {
  networkUnsubscribe = NetInfo.addEventListener((state) => {
    const wasOnline = isOnline;
    isOnline = state.isConnected ?? false;

    if (!wasOnline && isOnline) {
      console.log('🟢 Network reconnected - refetching queries');
      apolloClient.refetchQueries({ include: 'active' });
    } else if (wasOnline && !isOnline) {
      console.log('🔴 Network disconnected');
    }
  });
};

export const cleanupNetworkMonitoring = () => {
  if (networkUnsubscribe) {
    networkUnsubscribe();
    networkUnsubscribe = null;
  }
};

export const getNetworkStatus = () => isOnline;

// Cache persistence helpers
export const clearApolloCache = async () => {
  try {
    await apolloClient.clearStore();
    console.log('✅ Apollo cache cleared');
  } catch (error) {
    console.error('❌ Error clearing Apollo cache:', error);
  }
};

export const resetApolloClient = async () => {
  try {
    await apolloClient.resetStore();
    console.log('✅ Apollo client reset');
  } catch (error) {
    console.error('❌ Error resetting Apollo client:', error);
  }
};

console.log('✅ Apollo Client initialized');
console.log('📡 AppSync Endpoint:', awsconfig.API.GraphQL.endpoint);
