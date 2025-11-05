// Common type definitions for the application

// GraphQL and API types
export type GraphQLError = {
  message: string;
  extensions?: Record<string, unknown>;
};

export type GraphQLResponse<T = unknown> = {
  data?: T;
  errors?: GraphQLError[];
};

// Amplify Auth types
export interface AuthUser {
  username: string;
  userId: string;
  attributes?: Record<string, string>;
}

export interface CognitoError {
  code?: string;
  message: string;
  name?: string;
}

// Event and error handlers
export type ErrorHandler = (error: Error | CognitoError | unknown) => void;
export type SuccessHandler<T = void> = (data: T) => void;

// Analytics types
export interface AnalyticsEvent {
  category: string;
  action?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

// DOM Event types
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;

// Audio types
export interface AudioAnalyserData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  averageFrequency: number;
}

// Backend validation
export interface BackendStatus {
  healthy: boolean;
  message?: string;
  timestamp: number;
}

// Generic record type for unknown objects
export type UnknownRecord = Record<string, unknown>;
