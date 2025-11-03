import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const TIER_CONFIG = {
  bronze: { colors: ['#cd7f32', '#8b4513'], emoji: '🥉', glow: '#cd7f32' },
  silver: { colors: ['#c0c0c0', '#808080'], emoji: '🥈', glow: '#c0c0c0' },
  gold: { colors: ['#ffd700', '#ff8c00'], emoji: '🥇', glow: '#ffd700' },
  platinum: { colors: ['#e5e4e2', '#b9f2ff'], emoji: '💎', glow: '#b9f2ff' },
  diamond: { colors: ['#b9f2ff', '#4169e1'], emoji: '💠', glow: '#4169e1' },
};

export default function TierBadge({ tier = 'bronze', size = 'medium' }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const config = TIER_CONFIG[tier] || TIER_CONFIG.bronze;

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const sizeStyles = {
    small: { width: 40, height: 40, fontSize: 16 },
    medium: { width: 60, height: 60, fontSize: 24 },
    large: { width: 80, height: 80, fontSize: 32 },
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle]}>
        <LinearGradient
          colors={config.colors}
          style={[
            styles.badge,
            {
              width: sizeStyles[size].width,
              height: sizeStyles[size].height,
              shadowColor: config.glow,
            },
          ]}
        >
          <Text style={[styles.emoji, { fontSize: sizeStyles[size].fontSize }]}>
            {config.emoji}
          </Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  emoji: {
    textAlign: 'center',
  },
});
