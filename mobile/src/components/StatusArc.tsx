/**
 * Status Arc Component - React Native
 * Top and bottom gradient arcs with revenue/request counters
 * Ported from web/src/components/OrbitalInterface.tsx
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, DollarSign } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface StatusArcProps {
  revenue: number;
  requestCount: number;
}

export const StatusArc: React.FC<StatusArcProps> = React.memo(({ revenue, requestCount }) => {
  const { currentTheme } = useTheme();

  return (
    <>
      {/* Top Arc */}
      <View style={styles.topArc}>
        <LinearGradient
          colors={[
            currentTheme.primary,
            currentTheme.secondary,
            currentTheme.accent,
            currentTheme.secondary,
            currentTheme.primary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.arcGradient}
        />
      </View>

      {/* Counters - Top Left */}
      <View style={styles.countersContainer}>
        {/* Request Counter */}
        <View
          style={[
            styles.counter,
            {
              borderColor: currentTheme.primary + '80',
              shadowColor: currentTheme.primary,
            },
          ]}
        >
          <Music size={20} color={currentTheme.primary} />
          <Text style={[styles.counterText, { color: currentTheme.primary }]}>
            {requestCount}
          </Text>
        </View>

        {/* Revenue Counter */}
        <View
          style={[
            styles.counter,
            {
              borderColor: currentTheme.accent + '80',
              shadowColor: currentTheme.accent,
            },
          ]}
        >
          <DollarSign size={20} color={currentTheme.accent} />
          <Text style={[styles.counterText, { color: currentTheme.accent }]}>
            R{revenue.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Bottom Arc */}
      <View style={styles.bottomArc}>
        <LinearGradient
          colors={[
            currentTheme.primary,
            currentTheme.secondary,
            currentTheme.accent,
            currentTheme.secondary,
            currentTheme.primary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.arcGradient}
        />
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  topArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    zIndex: 40,
  },
  bottomArc: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    zIndex: 40,
  },
  arcGradient: {
    flex: 1,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  countersContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 40,
    flexDirection: 'row',
    gap: 12,
  },
  counter: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  counterText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
});
