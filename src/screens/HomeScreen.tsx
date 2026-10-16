import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { FAB, Text, SegmentedButtons, useTheme, Chip, Surface, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, Team } from '../types';
import { subscribeToTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { subscribeToUserTeams } from '../services/teamService';
import { useAuth } from '../context/AuthContext';
import TaskItem from '../components/TaskItem';
import TaskFormModal from '../components/TaskFormModal';

const HomeScreen = () => {
  const theme = useTheme();
  const { user, profile } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Subscribe to user teams
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserTeams(user.uid, (teams) => {
      setUserTeams(teams);
    });
    return () => unsub();
  }, [user]);

  // Subscribe to all tasks
  useEffect(() => {
    const unsubscribe = subscribeToTasks((fetchedTasks) => {
      setTasks(fetchedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await createTask(taskData);
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

  const openCreateModal = () => {
    setSelectedTask(null);
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const userTeamIds = userTeams.map((t) => t.id);

  // Identify legacy tasks from Assignment 1 (created before auth: no creatorId and no teamId)
  const legacyTasks = tasks.filter((t) => !t.creatorId && !t.teamId);

  // Relevant tasks for the currently logged-in user
  const relevantTasks = tasks.filter((task) => {
    // 1. If assigned to this user -> show
    if (task.assigneeId && task.assigneeId === user?.uid) return true;

    // 2. If belongs to a team -> show ONLY if user is a member of that team
    if (task.teamId) {
      return userTeamIds.includes(task.teamId);
    }

    // 3. Personal task with creatorId -> show ONLY if current user created it
    if (task.creatorId) {
      return task.creatorId === user?.uid;
    }

    // 4. Do not leak legacy/unassigned personal tasks to other accounts
    return false;
  });

  const filteredTasks = relevantTasks.filter((task) => {
    if (statusFilter !== 'All' && task.status !== statusFilter) {
      return false;
    }
    if (teamFilter === 'personal') {
      return !task.teamId;
    }
    if (teamFilter !== 'all') {
      return task.teamId === teamFilter;
    }
    return true;
  });

  const userName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';

  // Task Statistics
  const totalCount = relevantTasks.length;
  const inProgressCount = relevantTasks.filter((t) => t.status === 'In Progress').length;
  const doneCount = relevantTasks.filter((t) => t.status === 'Done').length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Welcome Surface */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.headerRow}>
          <View>
            <View style={styles.brandRow}>
              <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                TaFo WORKSPACE
              </Text>
            </View>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              Hello, {userName}! 👋
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found • {userTeams.length} teams connected
            </Text>
          </View>
        </View>
      </Surface>

      {/* Task Summary Dashboard Card */}
      <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <View style={styles.statsRow}>
          {/* Total */}
          <View style={styles.statCol}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: theme.colors.onSurface }]}>
              {totalCount}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
              Total
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: '#F3E8DC' }]} />

          {/* In Progress */}
          <View style={styles.statCol}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>
              {inProgressCount}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
              In Progress
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: '#F3E8DC' }]} />

          {/* Done */}
          <View style={styles.statCol}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: '#2E7D32' }]}>
              {doneCount}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
              Done
            </Text>
          </View>
        </View>

        {/* Progress Bar & Percentage */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={totalCount > 0 ? doneCount / totalCount : 0}
            color={theme.colors.primary}
            style={[styles.progressBar, { backgroundColor: '#F3E8DC' }]}
          />
          <Text variant="labelSmall" style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
            {progressPercent}% complete
          </Text>
        </View>
      </Surface>

      {/* Legacy Tasks Banner (from Assignment 1) */}
      {legacyTasks.length > 0 && (
        <Surface style={[styles.legacyBanner, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <View style={styles.legacyHeader}>
            <MaterialCommunityIcons name="history" size={20} color={theme.colors.primary} />
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: 'bold', marginLeft: 6 }}>
              {legacyTasks.length} Legacy Task from Assignment 1
            </Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2, marginBottom: 8 }}>
            "{legacyTasks[0].title}" was created before user accounts existed. Claim it to your account or delete it.
          </Text>
          <View style={styles.legacyActionRow}>
            <Button
              compact
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              style={{ borderRadius: 8 }}
              onPress={async () => {
                for (const lt of legacyTasks) {
                  await updateTask(lt.id, { creatorId: user?.uid });
                }
              }}
            >
              Claim to this account
            </Button>
            <Button
              compact
              mode="outlined"
              textColor={theme.colors.error}
              style={{ borderColor: theme.colors.error, borderRadius: 8 }}
              onPress={async () => {
                for (const lt of legacyTasks) {
                  await deleteTask(lt.id);
                }
              }}
            >
              Delete
            </Button>
          </View>
        </Surface>
      )}

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'All', label: 'All' },
            { value: 'To Do', label: 'To Do' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Done', label: 'Done' },
          ]}
          density="small"
        />
      </View>

      {/* Team Filter Chips */}
      {userTeams.length > 0 && (
        <View style={styles.teamChipRow}>
          <Chip
            selected={teamFilter === 'all'}
            onPress={() => setTeamFilter('all')}
            style={[styles.chip, teamFilter === 'all' && { backgroundColor: theme.colors.primaryContainer }]}
            textStyle={{ color: teamFilter === 'all' ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: 'bold' }}
            compact
          >
            All Teams
          </Chip>
          <Chip
            selected={teamFilter === 'personal'}
            onPress={() => setTeamFilter('personal')}
            style={[styles.chip, teamFilter === 'personal' && { backgroundColor: theme.colors.primaryContainer }]}
            textStyle={{ color: teamFilter === 'personal' ? theme.colors.primary : theme.colors.onSurfaceVariant }}
            compact
          >
            Personal
          </Chip>
          {userTeams.map((team) => (
            <Chip
              key={team.id}
              selected={teamFilter === team.id}
              onPress={() => setTeamFilter(team.id)}
              style={[styles.chip, teamFilter === team.id && { backgroundColor: theme.colors.primaryContainer }]}
              textStyle={{ color: teamFilter === team.id ? theme.colors.primary : theme.colors.onSurfaceVariant }}
              compact
            >
              {team.name}
            </Chip>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onEdit={openEditModal}
              onDelete={handleDeleteTask}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <View style={[styles.emptyCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
                <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color={theme.colors.primary} />
              </View>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold', marginTop: 12 }}>
                No tasks found
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                Tap the + button to create a new task.
              </Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={openCreateModal}
      />

      <TaskFormModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        initialData={selectedTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DC',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: '800',
    fontSize: 26,
    marginBottom: 2,
  },
  statDivider: {
    width: 1,
    height: 38,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 7,
    borderRadius: 6,
  },
  progressText: {
    textAlign: 'right',
    marginTop: 6,
    fontWeight: '600',
    fontSize: 11,
  },
  legacyBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  legacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legacyActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  teamChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  chip: {
    borderRadius: 8,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 90,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    elevation: 4,
  },
});

export default HomeScreen;
