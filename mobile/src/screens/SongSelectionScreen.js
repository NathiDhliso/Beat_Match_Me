import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_SONGS = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', duration: '3:20' },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', genre: 'Dance', duration: '3:23' },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', genre: 'Pop', duration: '3:35' },
  { id: '4', title: 'Good 4 U', artist: 'Olivia Rodrigo', genre: 'Pop Rock', duration: '2:58' },
  { id: '5', title: 'Peaches', artist: 'Justin Bieber', genre: 'R&B', duration: '3:18' },
  { id: '6', title: 'Montero', artist: 'Lil Nas X', genre: 'Hip Hop', duration: '2:17' },
  { id: '7', title: 'Kiss Me More', artist: 'Doja Cat', genre: 'Pop', duration: '3:28' },
  { id: '8', title: 'Stay', artist: 'The Kid LAROI', genre: 'Pop', duration: '2:21' },
];

export default function SongSelectionScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const genres = ['All', 'Pop', 'Dance', 'R&B', 'Hip Hop', 'Pop Rock'];

  const filteredSongs = MOCK_SONGS.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songCard}
      onPress={() => navigation.navigate('RequestConfirmation', { song: item })}
    >
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        <Text style={styles.songMeta}>{item.genre} · {item.duration}</Text>
      </View>
      <Text style={styles.requestButton}>Request →</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs or artists..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Genre Filters */}
      <View style={styles.genreContainer}>
        <FlatList
          horizontal
          data={genres}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.genreChip,
                selectedGenre === item && styles.genreChipActive
              ]}
              onPress={() => setSelectedGenre(item)}
            >
              <Text style={[
                styles.genreText,
                selectedGenre === item && styles.genreTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Song List */}
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        contentContainerStyle={styles.songList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No songs found</Text>
        }
      />

      {/* Feeling Lucky Button */}
      <TouchableOpacity
        style={styles.luckyButton}
        onPress={() => {
          const randomSong = MOCK_SONGS[Math.floor(Math.random() * MOCK_SONGS.length)];
          navigation.navigate('RequestConfirmation', { song: randomSong });
        }}
      >
        <Text style={styles.luckyButtonText}>🎲 Feeling Lucky</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#374151',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  genreContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  genreChip: {
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  genreChipActive: {
    backgroundColor: '#8b5cf6',
  },
  genreText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  genreTextActive: {
    color: '#fff',
  },
  songList: {
    padding: 15,
  },
  songCard: {
    backgroundColor: '#374151',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songArtist: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  songMeta: {
    color: '#6b7280',
    fontSize: 12,
  },
  requestButton: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  luckyButton: {
    backgroundColor: '#ec4899',
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  luckyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
