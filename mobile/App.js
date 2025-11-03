import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import './src/config/amplify';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import SongSelectionScreen from './src/screens/SongSelectionScreen';
import RequestConfirmationScreen from './src/screens/RequestConfirmationScreen';
import QueueScreen from './src/screens/QueueScreen';
import RequestTrackingScreen from './src/screens/RequestTrackingScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1f2937',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
              options={{ title: 'Reset Password' }}
            />
          </>
        ) : (
          // App screens
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'BeatMatchMe' }}
            />
            <Stack.Screen 
              name="SongSelection" 
              component={SongSelectionScreen}
              options={{ title: 'Select Song' }}
            />
            <Stack.Screen 
              name="RequestConfirmation" 
              component={RequestConfirmationScreen}
              options={{ title: 'Confirm Request' }}
            />
            <Stack.Screen 
              name="Queue" 
              component={QueueScreen}
              options={{ title: 'Queue' }}
            />
            <Stack.Screen 
              name="RequestTracking" 
              component={RequestTrackingScreen}
              options={{ title: 'Track Request' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
});
