/**
 * Floating Action Bubble - React Native
 * Draggable floating menu button with radial menu expansion
 * Ported from web/src/components/OrbitalInterface.tsx
 */

import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { PanGestureHandler, State, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Music } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface MenuOption {
  icon: React.ReactNode;
  label: string;
  angle: number;
  color: readonly string[];
  onPress: () => void;
}

interface FloatingActionBubbleProps {
  onMenuToggle: () => void;
  isExpanded: boolean;
  menuOptions?: MenuOption[];
}

export const FloatingActionBubble: React.FC<FloatingActionBubbleProps> = ({
  onMenuToggle,
  isExpanded,
  menuOptions = [],
}) => {
  const { currentTheme } = useTheme();
  const [position] = useState(new Animated.ValueXY({ x: 300, y: 600 }));
  const [scale] = useState(new Animated.Value(1));

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Snap to edges if needed
      Animated.spring(position, {
        toValue: { x: event.nativeEvent.translationX, y: event.nativeEvent.translationY },
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onMenuToggle();
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { scale },
            ],
          },
        ]}
      >
        {/* Main Bubble */}
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <LinearGradient
            colors={[currentTheme.primary, currentTheme.secondary, currentTheme.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bubble}
          >
            <Music size={32} color="#FFFFFF" />
            
            {/* Pulse Ring */}
            <View style={[styles.pulseRing, { borderColor: currentTheme.primary + '50' }]} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Radial Menu Items */}
        {isExpanded && menuOptions.map((option, index) => (
          <RadialMenuItem
            key={index}
            icon={option.icon}
            label={option.label}
            angle={option.angle}
            distance={100}
            colors={option.color}
            onPress={option.onPress}
          />
        ))}
      </Animated.View>
    </PanGestureHandler>
  );
};

interface RadialMenuItemProps {
  icon: React.ReactNode;
  label: string;
  angle: number;
  distance: number;
  colors: readonly string[];
  onPress: () => void;
}

const RadialMenuItem: React.FC<RadialMenuItemProps> = ({
  icon,
  angle,
  distance,
  colors,
  onPress,
}) => {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <Animated.View
      style={[
        styles.menuItem,
        {
          transform: [{ translateX: x }, { translateY: y }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={colors as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.menuItemBubble}
        >
          {icon}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 50,
  },
  bubble: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pulseRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    opacity: 0.3,
  },
  menuItem: {
    position: 'absolute',
    top: 35,
    left: 35,
  },
  menuItemBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
