import React, { useRef } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PEEK_AMOUNT = 40;
const PAGE_WIDTH = SCREEN_WIDTH - PEEK_AMOUNT;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 500;

interface HorizontalPagerProps {
  pages: React.ReactNode[];
  initialPage?: number;
  onPageChange?: (index: number) => void;
}

export const HorizontalPager: React.FC<HorizontalPagerProps> = ({
  pages,
  initialPage = 0,
  onPageChange,
}) => {
  const currentIndex = useSharedValue(initialPage);
  const translateX = useSharedValue(-initialPage * PAGE_WIDTH);
  const startX = useSharedValue(0);
  const lastPageIndex = useRef(initialPage);

  const notifyPageChange = (index: number) => {
    if (lastPageIndex.current !== index && onPageChange) {
      lastPageIndex.current = index;
      onPageChange(index);
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
    })
    .onEnd((event) => {
      const offset = event.translationX;
      const velocity = event.velocityX;

      let targetIndex = currentIndex.value;

      if (offset < -SWIPE_THRESHOLD || velocity < -VELOCITY_THRESHOLD) {
        targetIndex = Math.min(currentIndex.value + 1, pages.length - 1);
      } else if (offset > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        targetIndex = Math.max(currentIndex.value - 1, 0);
      }

      currentIndex.value = targetIndex;
      translateX.value = withSpring(-targetIndex * PAGE_WIDTH, {
        damping: 20,
        stiffness: 90,
        mass: 0.5,
      });

      runOnJS(notifyPageChange)(targetIndex);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.viewport}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.track, animatedStyle]}>
          {pages.map((page, index) => (
            <View key={index} style={styles.page}>
              {page}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
  },
  page: {
    width: PAGE_WIDTH,
    marginRight: PEEK_AMOUNT,
  },
});
