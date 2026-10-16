import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Avatar,
  Card,
  useTheme,
  Divider,
  List,
  Dialog,
  Portal,
  Surface,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const theme = useTheme();
  const { user, profile, logout } = useAuth();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
      setLogoutDialogVisible(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : 'Recently';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header Card */}
      <Surface style={[styles.profileCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={styles.cardContent}>
          <Avatar.Text
            size={84}
            label={getInitials(profile?.name || user?.displayName || 'User')}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            color={theme.colors.onPrimary}
          />
          <Text variant="headlineSmall" style={[styles.userName, { color: theme.colors.onSurface }]}>
            {profile?.name || user?.displayName || 'Anonymous User'}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {profile?.email || user?.email || 'No email'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              ACTIVE MEMBER
            </Text>
          </View>
        </View>
      </Surface>

      {/* Account Info Card */}
      <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            Account Details
          </List.Subheader>
          <List.Item
            title="User ID"
            description={user?.uid || 'Unknown'}
            left={(props) => <List.Icon {...props} icon="identifier" color={theme.colors.primary} />}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <Divider style={{ backgroundColor: '#F3E8DC' }} />
          <List.Item
            title="Email"
            description={user?.email || 'Unknown'}
            left={(props) => <List.Icon {...props} icon="email-outline" color={theme.colors.primary} />}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
          <Divider style={{ backgroundColor: '#F3E8DC' }} />
          <List.Item
            title="Member Since"
            description={formattedDate}
            left={(props) => <List.Icon {...props} icon="calendar-check-outline" color={theme.colors.primary} />}
            titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </List.Section>
      </Surface>

      {/* Logout Action */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained-tonal"
          icon="logout"
          buttonColor={theme.colors.errorContainer}
          textColor={theme.colors.error}
          onPress={() => setLogoutDialogVisible(true)}
          style={styles.logoutButton}
          contentStyle={styles.buttonContent}
          labelStyle={{ fontWeight: 'bold' }}
        >
          Sign Out of TaFo
        </Button>
      </View>

      {/* Logout Dialog */}
      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface, borderRadius: 20 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
            Confirm Logout
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Are you sure you want to sign out of TaFo? You can log back in at any time.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)} textColor={theme.colors.onSurfaceVariant}>
              Cancel
            </Button>
            <Button
              onPress={handleLogout}
              loading={loggingOut}
              textColor={theme.colors.error}
            >
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 20,
    paddingVertical: 12,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 14,
    elevation: 3,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  logoutButton: {
    borderRadius: 14,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ProfileScreen;
