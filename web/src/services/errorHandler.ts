/**
 * Centralized Error Handling Service
 * Converts technical errors into user-friendly messages
 */

export interface ErrorInfo {
  title: string;
  message: string;
  action?: string;
  technical?: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Parse and format errors for user display
 */
export function parseError(error: any): ErrorInfo {
  // Handle null/undefined
  if (!error) {
    return {
      title: 'Unknown Error',
      message: 'Something went wrong. Please try again.',
      severity: 'error',
    };
  }

  const errorMessage = error.message || error.toString();
  const errorName = error.name || '';

  // AWS Cognito Errors
  if (errorMessage.includes('User pool client') && errorMessage.includes('does not exist')) {
    return {
      title: 'Configuration Error',
      message: 'The app is not properly configured. Please contact support.',
      action: 'Our team has been notified and will fix this shortly.',
      technical: 'Cognito User Pool Client ID is invalid or deleted',
      severity: 'error',
    };
  }

  if (errorMessage.includes('SECRET_HASH')) {
    return {
      title: 'App Configuration Issue',
      message: 'The authentication system needs to be reconfigured.',
      action: 'Please contact the administrator to fix the Cognito client secret setting.',
      technical: 'Web app client has secret enabled (not supported)',
      severity: 'error',
    };
  }

  if (errorMessage.includes('User does not exist')) {
    return {
      title: 'Account Not Found',
      message: 'No account exists with this email address.',
      action: 'Please sign up for a new account or check your email address.',
      severity: 'warning',
    };
  }

  if (errorMessage.includes('Incorrect username or password')) {
    return {
      title: 'Login Failed',
      message: 'The email or password you entered is incorrect.',
      action: 'Please check your credentials and try again.',
      severity: 'warning',
    };
  }

  if (errorMessage.includes('User is not confirmed')) {
    return {
      title: 'Email Not Verified',
      message: 'Please verify your email address before logging in.',
      action: 'Check your inbox for the verification code.',
      severity: 'warning',
    };
  }

  if (errorMessage.includes('User already exists')) {
    return {
      title: 'Account Exists',
      message: 'An account with this email already exists.',
      action: 'Please login instead, or use a different email address.',
      severity: 'warning',
    };
  }

  if (errorMessage.includes('Password did not conform')) {
    return {
      title: 'Weak Password',
      message: 'Your password does not meet the security requirements.',
      action: 'Use at least 8 characters with uppercase, lowercase, and numbers.',
      severity: 'warning',
    };
  }

  // Network Errors
  if (errorMessage.includes('Network') || errorMessage.includes('network') || 
      errorMessage.includes('timeout') || errorMessage.includes('Failed to fetch')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server.',
      action: 'Please check your internet connection and try again.',
      severity: 'warning',
    };
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long to complete.',
      action: 'Please try again. If the problem persists, contact support.',
      severity: 'warning',
    };
  }

  // GraphQL Errors
  if (errorMessage.includes('Cannot query field') || errorMessage.includes('GraphQL')) {
    return {
      title: 'Feature Not Available',
      message: 'This feature is currently being updated.',
      action: 'Please try again later or contact support if urgent.',
      technical: 'GraphQL schema mismatch',
      severity: 'warning',
    };
  }

  // Payment Errors
  if (errorMessage.includes('payment') || errorMessage.includes('Yoco')) {
    return {
      title: 'Payment Error',
      message: 'Unable to process your payment.',
      action: 'Please check your payment details and try again.',
      severity: 'error',
    };
  }

  if (errorMessage.includes('insufficient funds')) {
    return {
      title: 'Payment Declined',
      message: 'Your card was declined due to insufficient funds.',
      action: 'Please use a different payment method.',
      severity: 'warning',
    };
  }

  // Authorization Errors
  if (errorMessage.includes('not authorized') || errorMessage.includes('Unauthorized') ||
      errorName === 'UnauthorizedException') {
    return {
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      action: 'Please login again or contact support if this persists.',
      severity: 'warning',
    };
  }

  if (errorMessage.includes('Session expired') || errorMessage.includes('token')) {
    return {
      title: 'Session Expired',
      message: 'Your session has expired.',
      action: 'Please login again to continue.',
      severity: 'info',
    };
  }

  // Validation Errors
  if (errorMessage.includes('Invalid email')) {
    return {
      title: 'Invalid Email',
      message: 'Please enter a valid email address.',
      action: 'Check your email format (e.g., user@example.com)',
      severity: 'warning',
    };
  }

  if (errorMessage.includes('required') || errorMessage.includes('missing')) {
    return {
      title: 'Missing Information',
      message: 'Please fill in all required fields.',
      severity: 'warning',
    };
  }

  // Rate Limiting
  if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
    return {
      title: 'Too Many Attempts',
      message: 'You have made too many requests.',
      action: 'Please wait a few minutes before trying again.',
      severity: 'warning',
    };
  }

  // Generic AWS Errors
  if (errorName.includes('ServiceException') || errorName.includes('AWSError')) {
    return {
      title: 'Service Error',
      message: 'A service error occurred.',
      action: 'Please try again in a few moments.',
      technical: errorName,
      severity: 'error',
    };
  }

  // Default fallback
  return {
    title: 'Something Went Wrong',
    message: errorMessage || 'An unexpected error occurred.',
    action: 'Please try again. Contact support if the problem continues.',
    technical: errorName || 'Unknown error',
    severity: 'error',
  };
}

/**
 * Log errors to monitoring service (expand this later)
 */
export function logError(error: any, context?: string) {
  const errorInfo = parseError(error);
  
  console.error('Error occurred:', {
    context,
    title: errorInfo.title,
    message: errorInfo.message,
    technical: errorInfo.technical,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { contexts: { info: { context } } });
  // }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorMessage = error?.message || error?.toString() || '';
  
  const retryablePatterns = [
    'timeout',
    'network',
    'fetch failed',
    'service unavailable',
    '503',
    '502',
    '504',
    'ECONNRESET',
    'ETIMEDOUT',
  ];

  return retryablePatterns.some(pattern =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Format error for toast notification
 */
export function formatErrorForToast(error: any): {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
} {
  const errorInfo = parseError(error);
  
  return {
    title: errorInfo.title,
    message: errorInfo.action || errorInfo.message,
    type: errorInfo.severity === 'info' ? 'info' : errorInfo.severity === 'warning' ? 'warning' : 'error',
  };
}
