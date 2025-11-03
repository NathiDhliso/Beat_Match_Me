import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import './src/config/amplify';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import SongSelectionScreen from './src/screens/SongSelectionScreen';
import RequestConfirmationScreen from './src/screens/RequestConfirmationScreen';
import QueueScreen from './src/screens/QueueScreen';
import RequestTrackingScreen from './src/screens/RequestTrackingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
