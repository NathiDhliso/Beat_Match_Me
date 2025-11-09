// Polyfills must be imported FIRST
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client';
import { Amplify } from 'aws-amplify';
import awsConfig from './src/config/aws-exports';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import apolloClient from './src/services/api';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: awsConfig.aws_user_pools_id,
      userPoolClientId: awsConfig.aws_user_pools_web_client_id,
      region: awsConfig.aws_cognito_region,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
      },
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        },
      },
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}
