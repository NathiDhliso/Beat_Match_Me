import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  threshold = 100 
}) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      opacity.value = 1 - Math.abs(event.translationX) / 300;
    })
    .onEnd((event) => {
      if (event.translationX > threshold) {
        runOnJS(triggerHaptic)();
        if (onSwipeRight) runOnJS(onSwipeRight)();
        translateX.value = withSpring(500);
      } else if (event.translationX < -threshold) {
        runOnJS(triggerHaptic)();
        if (onSwipeLeft) runOnJS(onSwipeLeft)();
        translateX.value = withSpring(-500);
      } else {
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
