import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface RevenueViewProps {
  totalRevenue: number;
  queueRequests: any[];
  acceptedRequests: any[];
  pendingRequests: any[];
  event?: any;
}

export const RevenueView: React.FC<RevenueViewProps> = ({
  totalRevenue,
  queueRequests,
  acceptedRequests,
  pendingRequests,
  event,
}) => {
  const { currentTheme } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.statsCard, { borderColor: currentTheme.primary + '30' }]}>
        <Text style={[styles.statsTitle, { color: currentTheme.primary }]}>
          💰 Revenue Overview
        </Text>
        
        <View style={[styles.revenueCard, { backgroundColor: currentTheme.primary + '20' }]}>
          <Text style={styles.revenueLabel}>Total Earnings</Text>
          <Text style={[styles.revenueAmount, { color: currentTheme.accent }]}>
            R{totalRevenue.toFixed(2)}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Requests</Text>
            <Text style={[styles.statValue, { color: currentTheme.primary }]}>
              {queueRequests.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Accepted</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              {acceptedRequests.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>
              {pendingRequests.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg Price</Text>
            <Text style={[styles.statValue, { color: currentTheme.accent }]}>
              R{queueRequests.length > 0 ? (totalRevenue / queueRequests.length).toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>
      </View>

      {event && (
        <View style={[styles.statsCard, { borderColor: currentTheme.secondary + '30' }]}>
          <Text style={[styles.statsTitle, { color: currentTheme.secondary }]}>
            🎵 Event Details
          </Text>
          <View style={styles.eventInfo}>
            <View style={styles.eventRow}>
              <Text style={styles.eventLabel}>Venue</Text>
              <Text style={styles.eventValue}>{event.venueName}</Text>
            </View>
            <View style={styles.eventRow}>
              <Text style={styles.eventLabel}>Status</Text>
              <Text style={[styles.eventValue, { color: event.status === 'LIVE' ? '#10b981' : '#6b7280' }]}>
                {event.status}
              </Text>
            </View>
            {event.totalRevenue !== undefined && (
              <View style={styles.eventRow}>
                <Text style={styles.eventLabel}>Event Total</Text>
                <Text style={[styles.eventValue, { color: currentTheme.accent }]}>
                  R{event.totalRevenue.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  revenueCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  revenueLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  eventInfo: {
    gap: 12,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  eventValue: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '600',
  },
});
