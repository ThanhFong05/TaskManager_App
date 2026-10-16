import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  Dialog,
  Portal,
  TextInput,
  useTheme,
  ActivityIndicator,
  SegmentedButtons,
  Chip,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Team } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToUserTeams,
  createTeam,
  joinTeam,
  getAllTeams,
} from '../services/teamService';

interface TeamsScreenProps {
  navigation: any;
}

const TeamsScreen: React.FC<TeamsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user, profile } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [createVisible, setCreateVisible] = useState(false);
  const [joinVisible, setJoinVisible] = useState(false);

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Discoverable teams
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');

  useEffect(() => {
    if (!user) return;

    const unsub = subscribeToUserTeams(user.uid, (userTeams) => {
      setTeams(userTeams);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const loadAllTeams = async () => {
    try {
      const list = await getAllTeams();
      setAllTeams(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'explore') {
      loadAllTeams();
    }
  }, [activeTab]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setErrorMsg('Team name is required.');
      return;
    }
    if (!user) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      const creatorName = profile?.name || user.displayName || user.email?.split('@')[0] || 'User';
      const creatorEmail = profile?.email || user.email || '';

      const created = await createTeam(newTeamName, newTeamDesc, {
        id: user.uid,
        name: creatorName,
        email: creatorEmail,
      });

      setCreateVisible(false);
      setNewTeamName('');
      setNewTeamDesc('');
      navigation.navigate('TeamDetail', {
        teamId: created.id,
        teamName: created.name,
        teamCode: created.code,
      });
    } catch (error: any) {
      console.error('Error creating team:', error);
      setErrorMsg(error.message || 'Failed to create team.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async (codeOrIdToJoin?: string) => {
    const code = codeOrIdToJoin || joinCode;
    if (!code.trim()) {
      setErrorMsg('Please enter a team code (e.g. TF-8492).');
      return;
    }
    if (!user) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      const memberName = profile?.name || user.displayName || user.email?.split('@')[0] || 'User';
      const memberEmail = profile?.email || user.email || '';

      const res = await joinTeam(code, {
        id: user.uid,
        name: memberName,
        email: memberEmail,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      setJoinVisible(false);
      setJoinCode('');
      if (res.team) {
        navigation.navigate('TeamDetail', {
          teamId: res.team.id,
          teamName: res.team.name,
          teamCode: res.team.code,
        });
      }
    } catch (error: any) {
      console.error('Error joining team:', error);
      setErrorMsg(error.message || 'Failed to join team.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderTeamCard = ({ item }: { item: Team }) => {
    const isOwner = user?.uid === item.ownerId;
    const displayCode = item.code || item.id.substring(0, 6).toUpperCase();

    return (
      <Surface
        style={[styles.teamCard, { backgroundColor: theme.colors.surface }]}
        elevation={2}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('TeamDetail', {
              teamId: item.id,
              teamName: item.name,
              teamCode: displayCode,
            })
          }
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleWithIcon}>
              <View style={[styles.teamIconBox, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={[styles.teamTitle, { color: theme.colors.onSurface }]}>
                  {item.name}
                </Text>
                <View style={styles.codeRow}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Code:{' '}
                  </Text>
                  <View style={[styles.codeBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="labelSmall" style={[styles.codeText, { color: theme.colors.primary }]}>
                      {displayCode}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Chip
              compact
              style={[
                styles.roleChip,
                { backgroundColor: isOwner ? theme.colors.primaryContainer : theme.colors.surfaceVariant },
              ]}
              textStyle={{
                color: isOwner ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                fontSize: 11,
                fontWeight: 'bold',
              }}
            >
              {isOwner ? 'Owner' : 'Member'}
            </Chip>
          </View>

          {item.description ? (
            <Text
              variant="bodyMedium"
              style={[styles.teamDescription, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            <Button
              mode="contained-tonal"
              compact
              icon="chat"
              buttonColor={theme.colors.surfaceVariant}
              textColor={theme.colors.primary}
              onPress={() =>
                navigation.navigate('Chat', { teamId: item.id, teamName: item.name })
              }
            >
              Chat
            </Button>
            <Button
              mode="contained"
              compact
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              icon="arrow-right"
              contentStyle={{ flexDirection: 'row-reverse' }}
              onPress={() =>
                navigation.navigate('TeamDetail', {
                  teamId: item.id,
                  teamName: item.name,
                  teamCode: displayCode,
                })
              }
            >
              View
            </Button>
          </View>
        </TouchableOpacity>
      </Surface>
    );
  };

  const isUserInTeam = (teamId: string) => {
    return teams.some((t) => t.id === teamId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tab Switcher */}
      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'my' | 'explore')}
          buttons={[
            { value: 'my', label: `My Teams (${teams.length})` },
            { value: 'explore', label: 'Explore & Join' },
          ]}
          density="small"
        />
      </View>

      {activeTab === 'my' ? (
        loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={teams}
            keyExtractor={(item) => item.id}
            renderItem={renderTeamCard}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}>
                <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name="account-group-outline" size={48} color={theme.colors.primary} />
                </View>
                <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  No Teams Yet
                </Text>
                <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  Create your first team or enter a short Team Code to collaborate.
                </Text>
                <View style={styles.emptyButtons}>
                  <Button
                    mode="contained"
                    icon="plus"
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.onPrimary}
                    onPress={() => setCreateVisible(true)}
                  >
                    Create Team
                  </Button>
                  <Button
                    mode="outlined"
                    icon="account-plus"
                    textColor={theme.colors.primary}
                    style={{ borderColor: theme.colors.primary }}
                    onPress={() => setJoinVisible(true)}
                  >
                    Join via Code
                  </Button>
                </View>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={allTeams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const alreadyMember = isUserInTeam(item.id);
            const displayCode = item.code || item.id.substring(0, 6).toUpperCase();
            return (
              <Surface style={[styles.teamCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={[styles.teamTitle, { color: theme.colors.onSurface }]}>
                      {item.name}
                    </Text>
                    <View style={styles.codeRow}>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Code: </Text>
                      <Text variant="labelSmall" style={[styles.codeText, { color: theme.colors.primary }]}>
                        {displayCode}
                      </Text>
                    </View>
                  </View>
                  {alreadyMember ? (
                    <Chip compact style={{ backgroundColor: theme.colors.primaryContainer }}>
                      Joined
                    </Chip>
                  ) : (
                    <Button
                      mode="contained"
                      compact
                      buttonColor={theme.colors.primary}
                      textColor={theme.colors.onPrimary}
                      icon="account-plus"
                      onPress={() => handleJoinTeam(displayCode)}
                    >
                      Join
                    </Button>
                  )}
                </View>
                {item.description ? (
                  <Text variant="bodyMedium" style={[styles.teamDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {item.description}
                  </Text>
                ) : null}
              </Surface>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No public teams found.
              </Text>
            </View>
          }
        />
      )}

      {/* FABs */}
      <View style={styles.fabGroup}>
        <FAB
          icon="account-plus"
          label="Join"
          style={[styles.joinFab, { backgroundColor: theme.colors.surface }]}
          color={theme.colors.primary}
          onPress={() => {
            setErrorMsg('');
            setJoinVisible(true);
          }}
        />
        <FAB
          icon="plus"
          label="New Team"
          style={[styles.createFab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => {
            setErrorMsg('');
            setCreateVisible(true);
          }}
        />
      </View>

      {/* Dialog: Create Team */}
      <Portal>
        <Dialog
          visible={createVisible}
          onDismiss={() => setCreateVisible(false)}
          style={{ backgroundColor: theme.colors.surface, borderRadius: 20 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
            Create New Team
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Team Name *"
              value={newTeamName}
              onChangeText={setNewTeamName}
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={[styles.dialogInput, { backgroundColor: theme.colors.surface }]}
            />
            <TextInput
              label="Description (Optional)"
              value={newTeamDesc}
              onChangeText={setNewTeamDesc}
              mode="outlined"
              multiline
              numberOfLines={3}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={[styles.dialogInput, { backgroundColor: theme.colors.surface }]}
            />
            {errorMsg ? (
              <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                {errorMsg}
              </Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateVisible(false)} textColor={theme.colors.onSurfaceVariant}>
              Cancel
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              onPress={handleCreateTeam}
              loading={submitting}
              disabled={submitting}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Dialog: Join Team */}
      <Portal>
        <Dialog
          visible={joinVisible}
          onDismiss={() => setJoinVisible(false)}
          style={{ backgroundColor: theme.colors.surface, borderRadius: 20 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
            Join a Team
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              Enter the short Team Code (e.g. TF-8492) provided by the team owner:
            </Text>
            <TextInput
              label="Short Team Code *"
              value={joinCode}
              onChangeText={setJoinCode}
              mode="outlined"
              autoCapitalize="characters"
              placeholder="e.g. TF-8492"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={[styles.dialogInput, { backgroundColor: theme.colors.surface }]}
            />
            {errorMsg ? (
              <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                {errorMsg}
              </Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setJoinVisible(false)} textColor={theme.colors.onSurfaceVariant}>
              Cancel
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              onPress={() => handleJoinTeam()}
              loading={submitting}
              disabled={submitting}
            >
              Join
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  teamCard: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  teamIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  roleChip: {
    borderRadius: 8,
  },
  teamDescription: {
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3E8DC',
    paddingTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  fabGroup: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  joinFab: {
    borderRadius: 28,
    elevation: 3,
  },
  createFab: {
    borderRadius: 28,
    elevation: 4,
  },
  dialogInput: {
    marginBottom: 12,
  },
});

export default TeamsScreen;
