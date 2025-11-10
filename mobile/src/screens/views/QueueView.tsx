import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { StatusArc, CircularQueueVisualizer } from '../../components/OrbitalInterface';

interface QueueViewProps {
  queueRequests: any[];
  totalRevenue: number;
  viewMode: 'list' | 'orbital';
  setViewMode: (mode: 'list' | 'orbital') => void;
  refreshing: boolean;
  onRefresh: () => void;
  currentlyPlaying: any;
  onAcceptRequest: (request: any) => void;
  onVetoRequest: (request: any) => void;
  onMarkPlaying: (request: any) => void;
}

export const QueueView: React.FC<QueueViewProps> = ({
  queueRequests,
  totalRevenue,
  viewMode,
  setViewMode,
  refreshing,
  onRefresh,
  currentlyPlaying,
  onAcceptRequest,
  onVetoRequest,
  onMarkPlaying,
}) => {
  const renderQueueItem = (request: any) => {
    const isPending = request.status === 'PENDING';
    const isAccepted = request.status === 'ACCEPTED';

    return (
      <View key={request.requestId} style={styles.queueItem}>
        <View style={styles.queueItemHeader}>
          <View style={styles.queuePosition}>
            <Text style={styles.queuePositionText}>#{request.queuePosition}</Text>
          </View>
          <View style={styles.queueItemInfo}>
            <Text style={styles.songTitle}>{request.songTitle}</Text>
            <Text style={styles.artistName}>{request.artistName}</Text>
            {request.userName && (
              <Text style={styles.requestedBy}>Requested by: {request.userName}</Text>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              isPending && styles.statusPending,
              isAccepted && styles.statusAccepted,
            ]}
          >
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {isPending && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => onAcceptRequest(request)}
              >
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.vetoButton]}
                onPress={() => onVetoRequest(request)}
              >
                <Text style={styles.actionButtonText}>Veto</Text>
              </TouchableOpacity>
            </>
          )}
          {isAccepted && request.queuePosition === 1 && !currentlyPlaying && (
            <TouchableOpacity
              style={[styles.actionButton, styles.playButton]}
              onPress={() => onMarkPlaying(request)}
            >
              <Text style={styles.actionButtonText}>Mark as Playing</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusArc revenue={totalRevenue} requestCount={queueRequests.length} />

      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'orbital' && styles.viewModeActive]}
          onPress={() => setViewMode('orbital')}
        >
          <Text style={[styles.viewModeText, viewMode === 'orbital' && styles.viewModeTextActive]}>
            Orbital
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>
            List
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'orbital' ? (
        <CircularQueueVisualizer
          requests={queueRequests}
          onAccept={async (id) => {
            const req = queueRequests.find((r: any) => r.requestId === id);
            if (req) await onAcceptRequest(req);
          }}
          onVeto={async (id) => {
            const req = queueRequests.find((r: any) => r.requestId === id);
            if (req) await onVetoRequest(req);
          }}
          onRequestTap={(req) => {
            Alert.alert(
              req.songTitle,
              `${req.artistName}\nRequested by: ${req.userName || 'Unknown'}\nPrice: R${req.price || 0}`
            );
          }}
        />
      ) : (
        <ScrollView
          style={styles.queueList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {queueRequests.length === 0 ? (
            <View style={styles.emptyQueue}>
              <Text style={styles.emptyQueueText}>No requests yet</Text>
              <Text style={styles.emptyQueueSubtext}>
                Share your QR code with patrons to receive requests
              </Text>
            </View>
          ) : (
            queueRequests.map(renderQueueItem)
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  viewModeToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 70,
    marginBottom: 8,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  viewModeActive: {
    backgroundColor: '#8b5cf6',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  viewModeTextActive: {
    color: '#ffffff',
  },
  queueList: {
    flex: 1,
  },
  queueItem: {
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  queueItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  queuePosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  queuePositionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  queueItemInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  artistName: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  requestedBy: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusAccepted: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  vetoButton: {
    backgroundColor: '#ef4444',
  },
  playButton: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyQueue: {
    padding: 32,
    alignItems: 'center',
  },
  emptyQueueText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
  },
  emptyQueueSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
