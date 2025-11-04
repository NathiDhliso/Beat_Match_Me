import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Modal, Image, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import YocoCardInput from '../components/YocoCardInput';

export default function RequestConfirmationScreen({ route, navigation }) {
  const { song, userTier = 'BRONZE', eventName = 'Event Name' } = route.params;
  const [requestType, setRequestType] = useState('standard');
  const [dedication, setDedication] = useState('');
  const [showDedication, setShowDedication] = useState(false);
  const [showFairPlayModal, setShowFairPlayModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Tier multipliers (discount)
  const tierMultipliers = {
    BRONZE: 1.0,
    SILVER: 0.9,  // 10% off
    GOLD: 0.8,    // 20% off
    PLATINUM: 0.7 // 30% off
  };

  const basePrice = song.basePrice || 50;
  const spotlightPrice = 75;
  const dedicationPrice = 10;
  const tierMultiplier = tierMultipliers[userTier] || 1.0;
  const estimatedQueuePosition = 8;
  const estimatedWaitTime = '~25 minutes';

  const calculateTotal = () => {
    let subtotal = basePrice;
    if (requestType === 'spotlight') subtotal += spotlightPrice;
    if (showDedication) subtotal += dedicationPrice;
    
    // Apply tier discount to base price only, not add-ons
    const discountedBase = basePrice * tierMultiplier;
    const total = discountedBase + (requestType === 'spotlight' ? spotlightPrice : 0) + (showDedication ? dedicationPrice : 0);
    
    return total;
  };

  const calculateBreakdown = () => {
    const discountedBase = basePrice * tierMultiplier;
    return {
      basePrice,
      tierMultiplier,
      discountedBase,
      spotlight: requestType === 'spotlight' ? spotlightPrice : 0,
      dedication: showDedication ? dedicationPrice : 0,
      total: calculateTotal()
    };
  };

  const getTierBadgeColor = () => {
    switch(userTier) {
      case 'BRONZE': return '#cd7f32';
      case 'SILVER': return '#c0c0c0';
      case 'GOLD': return '#ffd700';
      case 'PLATINUM': return '#e5e4e2';
      default: return '#cd7f32';
    }
  };

  const validateDedication = (text) => {
    const inappropriateWords = ['badword1', 'badword2']; // Add actual filter list
    const containsInappropriate = inappropriateWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
    return containsInappropriate;
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentToken) => {
    setShowPaymentModal(false);
    setShowSuccessAnimation(true);
    
    // Haptic success pattern (3 quick vibrations)
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 0);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
    
    setTimeout(() => {
      setShowSuccessAnimation(false);
      navigation.navigate('RequestTracking', { 
        song, 
        requestType,
        queuePosition: estimatedQueuePosition,
        requestId: `REQ-${Date.now()}` 
      });
    }, 2000);
  };

  const handlePaymentError = (error) => {
    Alert.alert('Payment Failed', error, [{ text: 'Try Again' }]);
  };

  return (
    <LinearGradient colors={['#1f2937', '#111827']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Song Info with Album Art */}
        <View style={styles.songCard}>
          {song.albumArt ? (
            <Image source={{ uri: song.albumArt }} style={styles.albumArt} />
          ) : (
            <View style={styles.albumArtPlaceholder}>
              <Text style={styles.albumArtIcon}>🎵</Text>
            </View>
          )}
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songArtist}>{song.artist}</Text>
          <View style={styles.songMetaRow}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreText}>{song.genre || 'Pop'}</Text>
            </View>
            <Text style={styles.songDuration}>{song.duration || '3:45'}</Text>
          </View>
          <Text style={styles.basePriceText}>Base Price: R{basePrice}</Text>
        </View>

        {/* User Tier Badge */}
        <View style={[styles.tierBadge, { backgroundColor: getTierBadgeColor() }]}>
          <Text style={styles.tierText}>{userTier} MEMBER</Text>
          <Text style={styles.tierDiscount}>
            {tierMultiplier < 1 ? `${Math.round((1 - tierMultiplier) * 100)}% OFF` : 'No Discount'}
          </Text>
        </View>

        {/* Estimated Queue Position */}
        <View style={styles.estimateCard}>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Estimated Queue Position:</Text>
            <Text style={styles.estimateValue}>#{estimatedQueuePosition}</Text>
          </View>
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Estimated Wait Time:</Text>
            <Text style={styles.estimateValue}>{estimatedWaitTime}</Text>
          </View>
        </View>

        {/* Fair-Play Promise */}
        <TouchableOpacity 
          style={styles.fairPlayBadge}
          onPress={() => setShowFairPlayModal(true)}
        >
          <Text style={styles.fairPlayIcon}>🛡️</Text>
          <View style={styles.fairPlayTextContainer}>
            <Text style={styles.fairPlayTitle}>Fair-Play Promise</Text>
            <Text style={styles.fairPlaySubtitle}>Full refund if DJ vetoes</Text>
          </View>
          <Text style={styles.infoIcon}>ⓘ</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Request Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Type</Text>
          
          <TouchableOpacity
            style={[styles.typeButton, requestType === 'standard' && styles.typeButtonActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRequestType('standard');
            }}
          >
            <Text style={styles.typeTitle}>Standard Request</Text>
            <Text style={styles.typePrice}>R{(basePrice * tierMultiplier).toFixed(2)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, requestType === 'spotlight' && styles.typeButtonActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRequestType('spotlight');
            }}
          >
            <Text style={styles.typeTitle}>⭐ Spotlight Slot</Text>
            <Text style={styles.typePrice}>+R{spotlightPrice}</Text>
            <Text style={styles.typeDesc}>Skip to priority queue</Text>
          </TouchableOpacity>
        </View>

        {/* Add-ons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optional Add-ons</Text>

          <TouchableOpacity
            style={styles.addonToggle}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowDedication(!showDedication);
            }}
          >
            <Text style={styles.addonText}>💝 Dedication Message (+R{dedicationPrice})</Text>
            <View style={[styles.checkbox, showDedication && styles.checkboxActive]}>
              {showDedication && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          {showDedication && (
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  dedication.length > 100 && styles.textInputError,
                  validateDedication(dedication) && styles.textInputWarning
                ]}
                placeholder="Your dedication message (max 100 characters)"
                placeholderTextColor="#9ca3af"
                value={dedication}
                onChangeText={setDedication}
                maxLength={100}
                multiline
              />
              <View style={styles.characterCountRow}>
                <Text style={[
                  styles.characterCount,
                  dedication.length > 100 && styles.characterCountError
                ]}>
                  {dedication.length}/100
                </Text>
                {validateDedication(dedication) && (
                  <Text style={styles.warningText}>⚠️ Message may be rejected by DJ</Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Pricing Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Pricing Breakdown</Text>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base Price:</Text>
            <Text style={styles.breakdownValue}>R{basePrice}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Tier Multiplier ({userTier}):
            </Text>
            <Text style={styles.breakdownValue}>×{tierMultiplier.toFixed(1)}</Text>
          </View>
          
          {requestType === 'spotlight' && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Spotlight:</Text>
              <Text style={styles.breakdownValue}>+R{spotlightPrice}</Text>
            </View>
          )}
          
          {showDedication && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Dedication:</Text>
              <Text style={styles.breakdownValue}>+R{dedicationPrice}</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R{calculateTotal().toFixed(2)}</Text>
          </View>
        </View>

        {/* Confirm Button - Pulsing */}
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.confirmButtonGradient}
          >
            <Text style={styles.confirmButtonText}>
              Confirm & Pay R{calculateTotal().toFixed(2)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fair-Play Modal */}
      <Modal
        visible={showFairPlayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFairPlayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Money is Protected 🛡️</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalBullet}>✓</Text>
              <Text style={styles.modalText}>
                If DJ vetoes your request for any reason, you get an automatic full refund
              </Text>
            </View>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalBullet}>✓</Text>
              <Text style={styles.modalText}>
                Refunds process within 5-10 business days
              </Text>
            </View>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalBullet}>✓</Text>
              <Text style={styles.modalText}>
                No questions asked - your satisfaction is guaranteed
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowFairPlayModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalContent}>
            <Text style={styles.paymentModalTitle}>Complete Payment</Text>
            <YocoCardInput
              amount={calculateTotal()}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              publicKey="pk_test_ed3c54a6gOol69qa7f45"
            />
            <TouchableOpacity
              style={styles.cancelPaymentButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.cancelPaymentText}>Cancel Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Animation */}
      <Modal
        visible={showSuccessAnimation}
        transparent
        animationType="fade"
      >
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            {/* Checkmark */}
            <View style={styles.successCheckmark}>
              <Text style={styles.successCheckmarkText}>✓</Text>
            </View>
            
            {/* Confetti particles */}
            {[...Array(50)].map((_, i) => {
              const colors = ['#a855f7', '#ec4899', '#fbbf24'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              const randomLeft = Math.random() * 100;
              const randomDelay = Math.random() * 500;
              
              return (
                <View
                  key={i}
                  style={[
                    styles.confetti,
                    {
                      backgroundColor: randomColor,
                      left: `${randomLeft}%`,
                      animationDelay: `${randomDelay}ms`
                    }
                  ]}
                />
              );
            })}
            
            <Text style={styles.successTitle}>Locked In!</Text>
            <Text style={styles.successSong}>{song.title}</Text>
            <Text style={styles.successArtist}>{song.artist}</Text>
            <Text style={styles.successId}>Request ID: REQ-{Date.now().toString().slice(-5)}</Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  songCard: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  albumArtPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  albumArtIcon: {
    fontSize: 80,
  },
  songTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  songArtist: {
    color: '#9ca3af',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  songMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  genreBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  genreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  songDuration: {
    color: '#6b7280',
    fontSize: 14,
  },
  basePriceText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  tierBadge: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tierDiscount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  estimateCard: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  estimateLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  estimateValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fairPlayBadge: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fairPlayIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fairPlayTextContainer: {
    flex: 1,
  },
  fairPlayTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fairPlaySubtitle: {
    color: '#d1fae5',
    fontSize: 12,
  },
  infoIcon: {
    fontSize: 20,
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#4b5563',
    marginVertical: 16,
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
    marginTop: 4,
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
    marginBottom: 8,
    fontSize: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textInputError: {
    borderColor: '#ef4444',
  },
  textInputWarning: {
    borderColor: '#fbbf24',
  },
  characterCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  characterCount: {
    color: '#9ca3af',
    fontSize: 12,
  },
  characterCountError: {
    color: '#ef4444',
  },
  warningText: {
    color: '#fbbf24',
    fontSize: 12,
  },
  breakdownCard: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  breakdownTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  breakdownLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  breakdownValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  confirmButton: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmButtonGradient: {
    padding: 20,
    alignItems: 'center',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#374151',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalBullet: {
    color: '#10b981',
    fontSize: 20,
    marginRight: 12,
    fontWeight: 'bold',
  },
  modalText: {
    color: '#d1d5db',
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Payment Modal
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  paymentModalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 24,
  },
  paymentModalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelPaymentButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelPaymentText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  // Success Animation
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    position: 'relative',
  },
  successCheckmark: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successCheckmarkText: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: '50%',
  },
  successTitle: {
    color: '#fbbf24',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  successSong: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successArtist: {
    color: '#9ca3af',
    fontSize: 18,
    marginBottom: 16,
  },
  successId: {
    color: '#6b7280',
    fontSize: 14,
  },
});
