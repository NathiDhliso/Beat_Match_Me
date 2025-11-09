import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { X, User, Music, DollarSign, Clock, MessageCircle } from 'lucide-react-native';

interface RequestDetailModalProps {
  visible: boolean;
  request: any;
  onClose: () => void;
  onAccept?: () => void;
  onVeto?: () => void;
  onRefund?: () => void;
  theme: any;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  visible,
  request,
  onClose,
  onAccept,
  onVeto,
  onRefund,
  theme,
}) => {
  if (!request) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'VETOED':
        return '#EF4444';
      case 'COMPLETED':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Request Details
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Song Info */}
            <View style={[styles.section, { borderColor: theme.primary + '30' }]}>
              <View style={styles.iconRow}>
                <Music size={20} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                  Song
                </Text>
              </View>
              <Text style={[styles.songTitle, { color: theme.text }]}>
                {request.songTitle}
              </Text>
              <Text style={[styles.artist, { color: theme.textSecondary }]}>
                {request.artistName}
              </Text>
              {request.genre && (
                <View style={styles.genreBadge}>
                  <Text style={styles.genreText}>{request.genre}</Text>
                </View>
              )}
            </View>

            {/* User Info */}
            <View style={[styles.section, { borderColor: theme.secondary + '30' }]}>
              <View style={styles.iconRow}>
                <User size={20} color={theme.secondary} />
                <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
                  Requested By
                </Text>
              </View>
              <Text style={[styles.userName, { color: theme.text }]}>
                {request.userName}
              </Text>
              {request.userTier && (
                <View style={[styles.tierBadge, { backgroundColor: theme.accent + '20' }]}>
                  <Text style={[styles.tierText, { color: theme.accent }]}>
                    {request.userTier}
                  </Text>
                </View>
              )}
            </View>

            {/* Price & Status */}
            <View style={styles.row}>
              <View style={[styles.halfSection, { borderColor: theme.accent + '30' }]}>
                <View style={styles.iconRow}>
                  <DollarSign size={20} color={theme.accent} />
                  <Text style={[styles.sectionTitle, { color: theme.accent }]}>
                    Price
                  </Text>
                </View>
                <Text style={[styles.price, { color: theme.accent }]}>
                  R{request.price.toFixed(2)}
                </Text>
              </View>

              <View style={[styles.halfSection, { borderColor: getStatusColor(request.status) + '30' }]}>
                <View style={styles.iconRow}>
                  <Clock size={20} color={getStatusColor(request.status)} />
                  <Text style={[styles.sectionTitle, { color: getStatusColor(request.status) }]}>
                    Status
                  </Text>
                </View>
                <Text style={[styles.status, { color: getStatusColor(request.status) }]}>
                  {request.status}
                </Text>
              </View>
            </View>

            {/* Dedication Message */}
            {request.dedicationMessage && (
              <View style={[styles.section, { borderColor: theme.primary + '30' }]}>
                <View style={styles.iconRow}>
                  <MessageCircle size={20} color={theme.primary} />
                  <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                    Dedication
                  </Text>
                </View>
                <Text style={[styles.dedication, { color: theme.text }]}>
                  "{request.dedicationMessage}"
                </Text>
              </View>
            )}

            {/* Timestamps */}
            <View style={[styles.section, { borderColor: theme.textSecondary + '30' }]}>
              <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
                Requested: {new Date(request.timestamp).toLocaleString()}
              </Text>
              {request.queuePosition && (
                <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
                  Queue Position: #{request.queuePosition}
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          {request.status === 'PENDING' && (
            <View style={styles.actions}>
              {onVeto && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.vetoButton]}
                  onPress={onVeto}
                >
                  <Text style={styles.actionButtonText}>Veto</Text>
                </TouchableOpacity>
              )}
              {onAccept && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={onAccept}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {request.status === 'ACCEPTED' && onRefund && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.refundButton]}
                onPress={onRefund}
              >
                <Text style={styles.actionButtonText}>Refund</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    marginBottom: 8,
  },
  genreBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  genreText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfSection: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dedication: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  vetoButton: {
    backgroundColor: '#EF4444',
  },
  refundButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
