/**
 * Circular Queue Visualizer - React Native
 * Circular display of queue requests with swipe gestures
 * Ported from web/src/components/OrbitalInterface.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, Heart, Zap } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORBITAL_RADIUS = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.35;

interface Request {
  id: string;
  songTitle: string;
  artistName: string;
  albumArt?: string;
  type: 'standard' | 'spotlight' | 'dedication';
  position: number;
  userName?: string;
  userTier?: string;
  price?: number;
  dedication?: string;
}

interface CircularQueueVisualizerProps {
  requests: Request[];
  onRequestTap?: (request: Request) => void;
  onAccept?: (id: string) => void;
  onVeto: (id: string) => void;
}

export const CircularQueueVisualizer: React.FC<CircularQueueVisualizerProps> = ({
  requests,
  onRequestTap,
  onAccept,
  onVeto,
}) => {
  const { currentTheme } = useTheme();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const nextRequests = requests.slice(0, 5);

  const getRequestPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * ORBITAL_RADIUS;
    const y = Math.sin(angle) * ORBITAL_RADIUS;
    return { x, y, angle };
  };

  const handleGestureStateChange = (requestId: string, event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      
      if (translationY < -100) {
        // Swipe up - Accept
        onAccept?.(requestId);
      } else if (translationY > 100) {
        // Swipe down - Veto
        onVeto(requestId);
      }
      
      setDraggedId(null);
    } else if (event.nativeEvent.state === State.ACTIVE) {
      setDraggedId(requestId);
    }
  };

  if (nextRequests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Music size={64} color={currentTheme.primary} />
        <Text style={[styles.emptyText, { color: currentTheme.primary }]}>
          No requests in queue
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Orbital Ring */}
      <LinearGradient
        colors={[currentTheme.primary, currentTheme.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.orbitalRing,
          {
            width: ORBITAL_RADIUS * 2,
            height: ORBITAL_RADIUS * 2,
            borderRadius: ORBITAL_RADIUS,
          },
        ]}
      />

      {/* Request Cards */}
      {nextRequests.map((request, index) => {
        const { x, y } = getRequestPosition(index, nextRequests.length);
        const isFirst = index === 0;

        return (
          <PanGestureHandler
            key={request.id}
            onHandlerStateChange={(event) => handleGestureStateChange(request.id, event)}
          >
            <View
              style={[
                styles.requestCard,
                {
                  transform: [
                    { translateX: x },
                    { translateY: y },
                  ],
                },
                isFirst && styles.firstRequest,
              ]}
            >
              <TouchableOpacity
                onPress={() => onRequestTap?.(request)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.cardContent,
                    {
                      borderColor: isFirst ? currentTheme.accent : currentTheme.primary + '50',
                    },
                  ]}
                >
                  {/* Album Art */}
                  {request.albumArt ? (
                    <Image
                      source={{ uri: request.albumArt }}
                      style={styles.albumArt}
                    />
                  ) : (
                    <View style={[styles.albumArtPlaceholder, { backgroundColor: currentTheme.primary }]}>
                      <Music size={24} color="#FFFFFF" />
                    </View>
                  )}

                  {/* Song Info */}
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>
                      {request.songTitle}
                    </Text>
                    <Text style={styles.artistName} numberOfLines={1}>
                      {request.artistName}
                    </Text>
                  </View>

                  {/* Position Badge */}
                  <View
                    style={[
                      styles.positionBadge,
                      { backgroundColor: isFirst ? currentTheme.accent : currentTheme.primary },
                    ]}
                  >
                    <Text style={styles.positionText}>{request.position}</Text>
                  </View>

                  {/* Type Indicator */}
                  {request.type === 'spotlight' && (
                    <Zap size={16} color="#FCD34D" style={styles.typeIcon} />
                  )}
                  {request.type === 'dedication' && (
                    <Heart size={16} color="#F472B6" style={styles.typeIcon} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </PanGestureHandler>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitalRing: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.2,
  },
  requestCard: {
    position: 'absolute',
  },
  firstRequest: {
    transform: [{ scale: 1.1 }],
  },
  cardContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  albumArt: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumArtPlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    marginBottom: 4,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  artistName: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  positionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
