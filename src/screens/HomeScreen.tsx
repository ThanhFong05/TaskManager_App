import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { FAB, Text, SegmentedButtons } from 'react-native-paper';
import { Task, TaskStatus } from '../types';
import { subscribeToTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import TaskItem from '../components/TaskItem';
import TaskFormModal from '../components/TaskFormModal';

const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToTasks((fetchedTasks) => {
      setTasks(fetchedTasks);
      setLoading(false);
    });

    // Cleanup subscription on unmount
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

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    return task.status === filter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Task Manager</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Organize your work effectively</Text>
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'All', label: 'All' },
            { value: 'To Do', label: 'To Do' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Done', label: 'Done' },
          ]}
          density="small"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6200ee" />
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
              <Text variant="bodyLarge" style={styles.emptyText}>
                No tasks found. Create one!
              </Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 80, // Space for FAB
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#888',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default HomeScreen;
