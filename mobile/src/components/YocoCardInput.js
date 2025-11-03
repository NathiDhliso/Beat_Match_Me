import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function YocoCardInput({ amount, onSuccess, onError, publicKey }) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // In production, you would integrate with Yoco's mobile SDK or webview
      // For now, we'll use a web browser integration
      
      const paymentUrl = `https://your-backend.com/payment/create?amount=${amount}`;
      
      Alert.alert(
        'Payment',
        `Complete payment of R${amount.toFixed(2)} securely`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setProcessing(false);
              onError('Payment cancelled');
            },
          },
          {
            text: 'Pay Now',
            onPress: async () => {
              // Mock payment success for demo
              // In production, use Yoco SDK
              setTimeout(() => {
                const mockToken = `tok_${Date.now()}`;
                onSuccess(mockToken);
                setProcessing(false);
              }, 2000);
            },
          },
        ]
      );
    } catch (error) {
      onError(error.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>💳 Payment Details</Text>
          <View style={styles.secureBadge}>
            <Text style={styles.secureText}>🔒 Secure</Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>R{amount.toFixed(2)}</Text>
        </View>

        <Text style={styles.poweredBy}>
          Powered by Yoco - South Africa's leading payment gateway
        </Text>

        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          <Text style={styles.payButtonText}>
            {processing ? 'Processing...' : `Pay R${amount.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trustBadges}>
        <Text style={styles.badge}>🔒 Secure Payment</Text>
        <Text style={styles.badge}>💳 Visa & Mastercard</Text>
        <Text style={styles.badge}>✓ Instant Refunds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  secureBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  secureText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  amountCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  amountLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  amountValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  poweredBy: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  badge: {
    color: '#6b7280',
    fontSize: 11,
  },
});
