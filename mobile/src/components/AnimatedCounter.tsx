import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  style?: TextStyle;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1000,
  style,
}) => {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(value.toFixed(decimals));

  const updateDisplayValue = (val: number) => {
    setDisplayValue(val.toFixed(decimals));
  };

  useAnimatedReaction(
    () => animatedValue.value,
    (currentValue) => {
      runOnJS(updateDisplayValue)(currentValue);
    }
  );

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration]);

  return (
    <Animated.Text style={style}>
      {prefix}{displayValue}{suffix}
    </Animated.Text>
  );
};
