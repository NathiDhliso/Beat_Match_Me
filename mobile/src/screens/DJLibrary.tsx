/**
 * DJ Library Screen - React Native
 * Manage tracklist, enable/disable songs, set pricing
 * REUSES: useTracklist hook, submitUploadTracklist, useTheme, search patterns
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import { Search, Music, DollarSign, ToggleLeft, ToggleRight, Plus } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useTracklist, Song } from '../hooks/useTracklist';
import { submitUploadTracklist } from '../services/graphql';

interface DJLibraryScreenProps {
  eventId: string;
  performerId: string;
}

export const DJLibraryScreen: React.FC<DJLibraryScreenProps> = ({ eventId, performerId }) => {
  const { currentTheme } = useTheme();
  const { tracklist, genres, loading } = useTracklist(eventId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [localTracks, setLocalTracks] = useState<Song[]>([]);

  // Use local tracks if available, otherwise use fetched tracklist
  const tracks = localTracks.length > 0 ? localTracks : tracklist;

  // REUSED: Filter pattern from UserPortal
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      const matchesSearch = 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || track.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [tracks, searchQuery, selectedGenre]);

  const allGenres = ['all', ...genres];

  // Toggle track enabled/disabled
  const handleToggleTrack = (trackId: string) => {
    setLocalTracks(prev => {
      const updated = prev.length > 0 ? prev : [...tracks];
      return updated.map(t => 
        t.id === trackId ? { ...t, isEnabled: !t.isEnabled } : t
      );
    });
  };

  // Update track price
  const handleUpdatePrice = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    Alert.prompt(
      'Update Price',
      `Current price: R${track.basePrice}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: (newPrice) => {
            const price = parseFloat(newPrice || '0');
            if (isNaN(price) || price < 0) {
              Alert.alert('Error', 'Invalid price');
              return;
            }
            setLocalTracks(prev => {
              const updated = prev.length > 0 ? prev : [...tracks];
              return updated.map(t => 
                t.id === trackId ? { ...t, basePrice: price } : t
              );
            });
          },
        },
      ],
      'plain-text',
      track.basePrice.toString()
    );
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (localTracks.length === 0) {
      Alert.alert('No Changes', 'No changes to save');
      return;
    }

    try {
      const songs = localTracks.map(t => ({
        title: t.title,
        artist: t.artist,
        genre: t.genre,
        basePrice: t.basePrice,
        duration: t.duration,
        albumArt: t.albumArt,
      }));

      await submitUploadTracklist(performerId, songs);
      Alert.alert('Success', 'Tracklist updated successfully');
      setLocalTracks([]);
    } catch (error: any) {
      console.error('[DJLibrary] Save failed:', error);
      Alert.alert('Error', error.message || 'Failed to save changes');
    }
  };

  // Render track item
  const renderTrack = ({ item }: { item: Song }) => {
    const isEnabled = item.isEnabled !== false;

    return (
      <View style={[styles.trackCard, { borderColor: currentTheme.primary + '30' }]}>
        <View style={styles.trackHeader}>
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {item.artist}
            </Text>
            <Text style={[styles.trackGenre, { color: currentTheme.accent }]}>
              {item.genre}
            </Text>
          </View>

          {/* Toggle Button */}
          <TouchableOpacity
            onPress={() => handleToggleTrack(item.id)}
            style={styles.toggleButton}
          >
            {isEnabled ? (
              <ToggleRight size={32} color={currentTheme.primary} />
            ) : (
              <ToggleLeft size={32} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Price Section */}
        <TouchableOpacity
          style={[styles.priceSection, { backgroundColor: currentTheme.primary + '20' }]}
          onPress={() => handleUpdatePrice(item.id)}
        >
          <DollarSign size={16} color={currentTheme.accent} />
          <Text style={[styles.priceText, { color: currentTheme.accent }]}>
            R{item.basePrice.toFixed(2)}
          </Text>
          <Text style={styles.priceLabel}>Tap to edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={styles.loadingText}>Loading library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.primary + '20' }]}>
        <Music size={24} color={currentTheme.primary} />
        <Text style={[styles.headerTitle, { color: currentTheme.primary }]}>
          DJ Library
        </Text>
        <Text style={styles.trackCount}>{tracks.length} tracks</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tracks..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Genre Filter */}
      <View style={styles.genreContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreScrollContent}
        >
          {allGenres.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.genreChip,
                selectedGenre === item && { backgroundColor: currentTheme.primary },
              ]}
              onPress={() => setSelectedGenre(item)}
            >
              <Text
                style={[
                  styles.genreText,
                  selectedGenre === item && styles.genreTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Track List */}
      <FlatList
        data={filteredTracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Music size={48} color="#6B7280" />
            <Text style={styles.emptyText}>No tracks found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Upload tracks to get started'}
            </Text>
          </View>
        }
      />

      {/* Save Button */}
      {localTracks.length > 0 && (
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: currentTheme.primary }]}
          onPress={handleSaveChanges}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
    gap: 16,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  trackCount: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F3F4F6',
    fontSize: 16,
    paddingVertical: 12,
  },
  genreContainer: {
    height: 50,
    marginBottom: 8,
  },
  genreScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  genreChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginLeft: 12,
  },
  genreText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  genreTextActive: {
    color: '#FFFFFF',
  },
  trackCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  trackGenre: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButton: {
    padding: 4,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 'auto',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DJLibraryScreen;
