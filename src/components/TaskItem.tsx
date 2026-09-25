import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, Chip, useTheme } from 'react-native-paper';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return '#81C784'; // Lighter green for dark mode
      case 'In Progress':
        return '#64B5F6'; // Lighter blue
      case 'To Do':
      default:
        return '#E0E0E0'; // Light gray
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#E57373'; // Lighter red
      case 'Medium':
        return '#FFB74D'; // Lighter orange
      case 'Low':
      default:
        return '#81C784';
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {task.title}
          </Text>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.colors.primary}
              onPress={() => onEdit(task)}
              style={styles.iconButton}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => onDelete(task.id)}
              style={styles.iconButton}
            />
          </View>
        </View>
        
        {task.description ? (
          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Chip
            style={[styles.chip, { backgroundColor: getStatusColor(task.status) + '20' }]}
            textStyle={{ color: getStatusColor(task.status) }}
            compact
          >
            {task.status}
          </Chip>
          
          <Chip
            style={[styles.chip, { backgroundColor: getPriorityColor(task.priority) + '20' }]}
            textStyle={{ color: getPriorityColor(task.priority) }}
            compact
          >
            {task.priority}
          </Chip>
          
          {task.dueDate && (
            <Text variant="bodySmall" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    margin: 0,
  },
  description: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 4,
  },
  date: {
    marginLeft: 'auto',
  },
});

export default TaskItem;
