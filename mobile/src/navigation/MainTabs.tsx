import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import DJPortalScreen from '../screens/DJPortal';
import UserPortalScreen from '../screens/UserPortal';
import { useAuth } from '../context/AuthContext';

export type MainTabsParamList = {
  DJPortal: undefined;
  UserPortal: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

// Icon components (simple text-based icons for now)
const DJIcon: React.FC<{ focused: boolean }> = ({ focused }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, focused && styles.iconTextActive]}>
      🎧
    </Text>
  </View>
);

const UserIcon: React.FC<{ focused: boolean }> = ({ focused }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, focused && styles.iconTextActive]}>
      🎵
    </Text>
  </View>
);

const MainTabs: React.FC = () => {
  const { user } = useAuth();
  const isPerformer = user?.role === 'PERFORMER';

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#A855F7',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      {isPerformer && (
        <Tab.Screen
          name="DJPortal"
          component={DJPortalScreen}
          options={{
            tabBarLabel: 'DJ Portal',
            tabBarIcon: ({ focused }) => <DJIcon focused={focused} />,
          }}
        />
      )}
      <Tab.Screen
        name="UserPortal"
        component={UserPortalScreen}
        options={{
          tabBarLabel: 'Audience',
          tabBarIcon: ({ focused }) => <UserIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1E293B',
    borderTopColor: '#334155',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabIcon: {
    marginBottom: -4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  iconText: {
    fontSize: 24,
    opacity: 0.6,
  },
  iconTextActive: {
    opacity: 1,
  },
});

export default MainTabs;
