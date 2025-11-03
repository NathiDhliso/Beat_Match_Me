import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Confetti = ({ delay, color }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(Math.random() * width);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(height + 50, {
      duration: 3000 + Math.random() * 2000,
      easing: Easing.linear,
    });

    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );

    opacity.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 2500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

export default function ConfettiEffect({ show = true }) {
  if (!show) return null;

  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd'];
  const confettiCount = 50;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: confettiCount }).map((_, index) => (
        <Confetti
          key={index}
          delay={index * 50}
          color={colors[index % colors.length]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
