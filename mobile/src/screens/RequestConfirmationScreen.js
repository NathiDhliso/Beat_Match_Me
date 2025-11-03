import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function RequestConfirmationScreen({ route, navigation }) {
  const { song } = route.params;
  const [requestType, setRequestType] = useState('standard');
  const [dedication, setDedication] = useState('');
  const [shoutout, setShoutout] = useState('');
  const [showDedication, setShowDedication] = useState(false);
  const [showShoutout, setShowShoutout] = useState(false);

  const basePrice = 20;
  const spotlightMultiplier = 2.5;
  const dedicationPrice = 10;
  const shoutoutPrice = 15;

  const calculateTotal = () => {
    let total = basePrice;
    if (requestType === 'spotlight') total *= spotlightMultiplier;
    if (showDedication) total += dedicationPrice;
    if (showShoutout) total += shoutoutPrice;
    return total;
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Request Submitted!',
      `Your request for "${song.title}" has been submitted.`,
      [
        {
          text: 'Track Request',
          onPress: () => navigation.navigate('RequestTracking', { song, requestType }),
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Song Info */}
        <View style={styles.songCard}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songArtist}>{song.artist}</Text>
          <Text style={styles.songMeta}>{song.genre} · {song.duration}</Text>
        </View>

        {/* Request Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Type</Text>
          
          <TouchableOpacity
            style={[styles.typeButton, requestType === 'standard' && styles.typeButtonActive]}
            onPress={() => setRequestType('standard')}
          >
            <Text style={styles.typeTitle}>Standard Request</Text>
            <Text style={styles.typePrice}>R{basePrice}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, requestType === 'spotlight' && styles.typeButtonActive]}
            onPress={() => setRequestType('spotlight')}
          >
            <Text style={styles.typeTitle}>⭐ Spotlight Slot</Text>
            <Text style={styles.typePrice}>R{basePrice * spotlightMultiplier}</Text>
            <Text style={styles.typeDesc}>Jump to front of queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, requestType === 'group' && styles.typeButtonActive]}
            onPress={() => setRequestType('group')}
          >
            <Text style={styles.typeTitle}>👥 Group Request</Text>
            <Text style={styles.typeDesc}>Split cost with friends</Text>
          </TouchableOpacity>
        </View>

        {/* Add-ons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add-ons</Text>

          <TouchableOpacity
            style={styles.addonToggle}
            onPress={() => setShowDedication(!showDedication)}
          >
            <Text style={styles.addonText}>💝 Dedication (+R{dedicationPrice})</Text>
            <View style={[styles.checkbox, showDedication && styles.checkboxActive]}>
              {showDedication && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          {showDedication && (
            <TextInput
              style={styles.textInput}
              placeholder="Your dedication message (140 chars)"
              placeholderTextColor="#9ca3af"
              value={dedication}
              onChangeText={setDedication}
              maxLength={140}
              multiline
            />
          )}

          <TouchableOpacity
            style={styles.addonToggle}
            onPress={() => setShowShoutout(!showShoutout)}
          >
            <Text style={styles.addonText}>📢 Shout-out (+R{shoutoutPrice})</Text>
            <View style={[styles.checkbox, showShoutout && styles.checkboxActive]}>
              {showShoutout && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          {showShoutout && (
            <TextInput
              style={styles.textInput}
              placeholder="Your shout-out (60 chars)"
              placeholderTextColor="#9ca3af"
              value={shoutout}
              onChangeText={setShoutout}
              maxLength={60}
            />
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceAmount}>R{calculateTotal()}</Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  songCard: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  songTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  songArtist: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 4,
  },
  songMeta: {
    color: '#6b7280',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typeButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#4c1d95',
  },
  typeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typePrice: {
    color: '#8b5cf6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  typeDesc: {
    color: '#9ca3af',
    fontSize: 14,
  },
  addonToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  addonText: {
    color: '#fff',
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  priceCard: {
    backgroundColor: '#8b5cf6',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    color: '#fff',
    fontSize: 18,
  },
  priceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#374151',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
});
