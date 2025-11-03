import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_QUEUE = [
  { id: '1', songTitle: 'Blinding Lights', artistName: 'The Weeknd', userName: 'Sarah M.', upvotes: 15, position: 1 },
  { id: '2', songTitle: 'Levitating', artistName: 'Dua Lipa', userName: 'John D.', upvotes: 23, position: 2 },
  { id: '3', songTitle: 'Save Your Tears', artistName: 'The Weeknd', userName: 'Mike R.', upvotes: 8, position: 3 },
  { id: '4', songTitle: 'Good 4 U', artistName: 'Olivia Rodrigo', userName: 'Emma W.', upvotes: 31, position: 4 },
  { id: '5', songTitle: 'Peaches', artistName: 'Justin Bieber', userName: 'Chris P.', upvotes: 12, position: 5 },
];

export default function QueueScreen() {
  const renderQueueItem = ({ item }) => (
    <View style={styles.queueCard}>
      <View style={styles.positionBadge}>
        <Text style={styles.positionText}>#{item.position}</Text>
      </View>
      
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.songTitle}</Text>
        <Text style={styles.songArtist}>{item.artistName}</Text>
        <Text style={styles.userName}>Requested by {item.userName}</Text>
      </View>

      <TouchableOpacity style={styles.upvoteButton}>
        <Text style={styles.upvoteIcon}>❤️</Text>
        <Text style={styles.upvoteCount}>{item.upvotes}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
      {/* Now Playing */}
      <View style={styles.nowPlayingCard}>
        <Text style={styles.nowPlayingLabel}>🎵 NOW PLAYING</Text>
        <Text style={styles.nowPlayingTitle}>Montero</Text>
        <Text style={styles.nowPlayingArtist}>Lil Nas X</Text>
      </View>

      {/* Queue List */}
      <View style={styles.queueHeader}>
        <Text style={styles.queueTitle}>Up Next ({MOCK_QUEUE.length})</Text>
      </View>

      <FlatList
        data={MOCK_QUEUE}
        keyExtractor={(item) => item.id}
        renderItem={renderQueueItem}
        contentContainerStyle={styles.queueList}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nowPlayingCard: {
    backgroundColor: '#8b5cf6',
    padding: 24,
    margin: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  nowPlayingLabel: {
    color: '#e9d5ff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nowPlayingTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nowPlayingArtist: {
    color: '#e9d5ff',
    fontSize: 18,
  },
  queueHeader: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  queueTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  queueList: {
    padding: 15,
  },
  queueCard: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionBadge: {
    backgroundColor: '#1f2937',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  positionText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songArtist: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    color: '#6b7280',
    fontSize: 12,
  },
  upvoteButton: {
    alignItems: 'center',
    padding: 8,
  },
  upvoteIcon: {
    fontSize: 24,
  },
  upvoteCount: {
    color: '#ec4899',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
