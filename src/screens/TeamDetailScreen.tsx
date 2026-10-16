import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Chip,
  Button,
  FAB,
  useTheme,
  ActivityIndicator,
  SegmentedButtons,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TeamMember, Task, Team } from '../types';
import {
  subscribeToTeamMembers,
  subscribeToTeamTasks,
} from '../services/teamService';
import { createTask, updateTask, deleteTask } from '../services/taskService';
import TaskItem from '../components/TaskItem';
import TaskFormModal from '../components/TaskFormModal';
import { useAuth } from '../context/AuthContext';

interface TeamDetailScreenProps {
  route: any;
  navigation: any;
}

const TeamDetailScreen: React.FC<TeamDetailScreenProps> = ({ route, navigation }) => {
  const { teamId, teamName, teamCode } = route.params;
  const theme = useTheme();
  const { user } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');

  // Task modal state
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const displayCode = teamCode || teamId.substring(0, 6).toUpperCase();

  useEffect(() => {
    navigation.setOptions({
      title: teamName || 'Team Details',
      headerRight: () => (
        <Button
          mode="contained"
          compact
          icon="chat"
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          onPress={() => navigation.navigate('Chat', { teamId, teamName })}
          style={{ marginRight: 8, borderRadius: 20 }}
        >
          Chat
        </Button>
      ),
    });
  }, [navigation, teamId, teamName, theme]);

  // Subscribe to members
  useEffect(() => {
    const unsub = subscribeToTeamMembers(teamId, (teamMembers) => {
      setMembers(teamMembers);
      setLoading(false);
    });
    return () => unsub();
  }, [teamId]);

  // Subscribe to team tasks
  useEffect(() => {
    const unsub = subscribeToTeamTasks(teamId, (teamTasks) => {
      setTasks(teamTasks);
    });
    return () => unsub();
  }, [teamId]);

  const copyTeamCode = () => {
    Alert.alert(
      'Short Team Code',
      `Code: ${displayCode}\n\nShare this short code with your teammates so they can join easily!`
    );
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await createTask({
        ...taskData,
        creatorId: taskData.creatorId || user?.uid || null,
        teamId,
        teamName,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!selectedTask) return;
    try {
      await updateTask(selectedTask.id, taskData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
    } catch (error) {
      console.error(error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Team Header Card */}
      <Surface style={[styles.headerCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
              {teamName}
            </Text>
            <View style={styles.codeRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Team Code:{' '}
              </Text>
              <Surface
                style={[styles.codeBadge, { backgroundColor: theme.colors.primaryContainer }]}
                elevation={0}
              >
                <Text variant="labelLarge" style={[styles.codeText, { color: theme.colors.primary }]}>
                  {displayCode}
                </Text>
              </Surface>
            </View>
          </View>
          <Button
            mode="contained-tonal"
            compact
            icon="content-copy"
            buttonColor={theme.colors.surfaceVariant}
            textColor={theme.colors.primary}
            onPress={copyTeamCode}
            style={{ borderRadius: 10 }}
          >
            Copy
          </Button>
        </View>

        <View style={styles.actionRow}>
          <Button
            mode="contained"
            icon="chat-processing-outline"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            onPress={() => navigation.navigate('Chat', { teamId, teamName })}
            style={styles.chatButton}
            contentStyle={{ paddingVertical: 4 }}
          >
            Open Team Real-Time Chat
          </Button>
        </View>
      </Surface>

      {/* Segmented Tabs: Tasks vs Members */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'tasks' | 'members')}
          buttons={[
            { value: 'tasks', label: `Tasks (${tasks.length})` },
            { value: 'members', label: `Members (${members.length})` },
          ]}
          density="small"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : activeTab === 'tasks' ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onEdit={(task) => {
                setSelectedTask(task);
                setModalVisible(true);
              }}
              onDelete={handleDeleteTask}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={56} color={theme.colors.outline} />
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginTop: 12, fontWeight: 'bold' }}>
                No tasks yet for this team
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
                Tap the + button below to create and assign a task to members.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Surface style={[styles.memberCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <View style={styles.memberRow}>
                <Avatar.Text
                  size={46}
                  label={getInitials(item.userName || 'User')}
                  style={{ backgroundColor: theme.colors.primary }}
                  color={theme.colors.onPrimary}
                />
                <View style={styles.memberInfo}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {item.userName}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.userEmail}
                  </Text>
                </View>
                <Chip
                  compact
                  style={{
                    backgroundColor: item.role === 'owner' ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                    borderRadius: 8,
                  }}
                  textStyle={{
                    color: item.role === 'owner' ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                    fontSize: 11,
                    fontWeight: 'bold',
                  }}
                >
                  {item.role === 'owner' ? 'Owner' : 'Member'}
                </Chip>
              </View>
            </Surface>
          )}
        />
      )}

      {/* FAB to add a task to this team */}
      {activeTab === 'tasks' && (
        <FAB
          icon="plus"
          label="New Task"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => {
            setSelectedTask(null);
            setModalVisible(true);
          }}
        />
      )}

      {/* Task Creation / Edit Modal */}
      <TaskFormModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        initialData={selectedTask}
        defaultTeamId={teamId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeText: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  actionRow: {
    marginTop: 14,
  },
  chatButton: {
    borderRadius: 12,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 90,
  },
  memberCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
    elevation: 4,
  },
});

export default TeamDetailScreen;
