import { Alert } from 'react-native';

export interface NetworkError {
  message: string;
  code?: string;
  statusCode?: number;
}

export const handleNetworkError = (error: any): NetworkError => {
  let message = 'An unexpected error occurred';
  let code = 'UNKNOWN_ERROR';
  let statusCode: number | undefined;

  if (error.networkError) {
    if (error.networkError.statusCode) {
      statusCode = error.networkError.statusCode;
      
      switch (statusCode) {
        case 401:
          message = 'Session expired. Please log in again.';
          code = 'UNAUTHORIZED';
          break;
        case 403:
          message = 'You don\'t have permission to perform this action.';
          code = 'FORBIDDEN';
          break;
        case 404:
          message = 'The requested resource was not found.';
          code = 'NOT_FOUND';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          code = 'SERVER_ERROR';
          break;
        case 503:
          message = 'Service temporarily unavailable. Please try again.';
          code = 'SERVICE_UNAVAILABLE';
          break;
        default:
          message = `Network error (${statusCode}). Please check your connection.`;
          code = 'NETWORK_ERROR';
      }
    } else if (error.networkError.message?.includes('Network request failed')) {
      message = 'No internet connection. Please check your network.';
      code = 'NO_CONNECTION';
    }
  } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const gqlError = error.graphQLErrors[0];
    message = gqlError.message || 'GraphQL error occurred';
    code = gqlError.extensions?.code || 'GRAPHQL_ERROR';
  } else if (error.message) {
    message = error.message;
  }

  return { message, code, statusCode };
};

export const showErrorAlert = (
  error: any,
  title: string = 'Error',
  onRetry?: () => void
) => {
  const { message } = handleNetworkError(error);
  
  const buttons: any[] = [
    { text: 'OK', style: 'cancel' }
  ];
  
  if (onRetry) {
    buttons.unshift({
      text: 'Retry',
      onPress: onRetry
    });
  }
  
  Alert.alert(title, message, buttons);
};

export const isNetworkError = (error: any): boolean => {
  return (
    error?.networkError ||
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('Failed to fetch')
  );
};

export const isAuthError = (error: any): boolean => {
  const { code, statusCode } = handleNetworkError(error);
  return code === 'UNAUTHORIZED' || statusCode === 401;
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorTitle?: string,
  onRetry?: () => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);
    showErrorAlert(error, errorTitle, onRetry);
    return null;
  }
};
