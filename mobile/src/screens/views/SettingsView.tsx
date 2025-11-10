import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../theme/tokens';
import type { ThemeMode } from '../../theme/tokens';
import QRCode from 'react-native-qrcode-svg';
import { LogOut } from 'lucide-react-native';

interface SettingsViewProps {
  currentEventId: string | null;
  connectionStatus: string;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentEventId,
  connectionStatus,
  onLogout,
}) => {
  const { currentTheme, themeMode, setThemeMode, isDark, toggleDarkMode } = useTheme();

  const renderConnectionStatus = () => {
    let statusColor = '#gray';
    let statusText = 'Disconnected';

    if (connectionStatus === 'connected') {
      statusColor = '#10b981';
      statusText = 'Live';
    } else if (connectionStatus === 'connecting') {
      statusColor = '#f59e0b';
      statusText = 'Connecting...';
    }

    return (
      <View style={styles.connectionStatus}>
        <View style={[styles.connectionDot, { backgroundColor: statusColor }]} />
        <Text style={styles.connectionText}>{statusText}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.statsCard, { borderColor: currentTheme.accent + '30' }]}>
        <Text style={[styles.statsTitle, { color: currentTheme.accent }]}>
          📡 Connection Status
        </Text>
        <View style={styles.connectionInfo}>
          {renderConnectionStatus()}
          <Text style={styles.connectionDescription}>
            {connectionStatus === 'connected' 
              ? 'Real-time updates active' 
              : connectionStatus === 'connecting'
              ? 'Establishing connection...'
              : 'Offline - Pull to refresh'}
          </Text>
        </View>
      </View>

      <View style={[styles.statsCard, { borderColor: currentTheme.primary + '30' }]}>
        <Text style={[styles.statsTitle, { color: currentTheme.primary }]}>
          🎨 Theme
        </Text>
        
        <View style={styles.themeOptions}>
          {(['BeatMatchMe', 'gold', 'platinum'] as ThemeMode[]).map((theme) => (
            <TouchableOpacity
              key={theme}
              style={[
                styles.themeOption,
                themeMode === theme && { 
                  borderColor: currentTheme.primary,
                  borderWidth: 3 
                }
              ]}
              onPress={() => setThemeMode(theme)}
            >
              <View style={[
                styles.themePreview,
                { backgroundColor: getTheme(theme).primary }
              ]} />
              <Text style={styles.themeLabel}>{theme}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.darkModeRow}>
          <Text style={styles.darkModeLabel}>Dark Mode</Text>
          <TouchableOpacity onPress={toggleDarkMode}>
            <Text style={{ fontSize: 32, color: isDark ? currentTheme.primary : '#6B7280' }}>
              {isDark ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentEventId && (
        <View style={[styles.statsCard, { borderColor: currentTheme.accent + '30' }]}>
          <Text style={[styles.statsTitle, { color: currentTheme.accent }]}>
            📱 Event QR Code
          </Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={`beatmatchme://event/${currentEventId}`}
              size={200}
              color={currentTheme.primary}
              backgroundColor="#FFFFFF"
            />
            <Text style={styles.qrText}>
              Scan to join this event
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: onLogout
              }
            ]
          );
        }}
      >
        <LogOut size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
  connectionInfo: {
    alignItems: 'center',
    gap: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '600',
  },
  connectionDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  themeLabel: {
    color: '#F3F4F6',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  darkModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  darkModeLabel: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 16,
  },
  qrText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    marginTop: 24,
    marginBottom: 48,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
