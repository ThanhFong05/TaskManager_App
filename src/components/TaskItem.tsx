import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton, Chip, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  const theme = useTheme();

  // Status colors suited for warm orange & cream beige theme
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Done':
        return { text: '#1E6F38', bg: '#EAF6ED' }; // Sage green
      case 'In Progress':
        return { text: '#C25E00', bg: '#FFF1E0' }; // Warm amber orange
      case 'To Do':
      default:
        return { text: '#6D5D52', bg: '#F1E9DF' }; // Warm beige slate
    }
  };

  // Priority colors suited for warm theme
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return { text: '#C5221F', bg: '#FDECEB' }; // Coral Red
      case 'Medium':
        return { text: '#D96500', bg: '#FFF0DE' }; // Orange
      case 'Low':
      default:
        return { text: '#28795A', bg: '#E7F5EE' }; // Soft green
    }
  };

  const statusStyle = getStatusStyle(task.status);
  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      {/* Top bar with Team / Personal Badge and Action Buttons */}
      <View style={styles.topRow}>
        {task.teamName ? (
          <View style={[styles.teamBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="account-group" size={14} color={theme.colors.primary} />
            <Text variant="labelSmall" style={[styles.teamText, { color: theme.colors.primary }]}>
              {task.teamName}
            </Text>
          </View>
        ) : (
          <View style={[styles.teamBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="account" size={14} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelSmall" style={[styles.teamText, { color: theme.colors.onSurfaceVariant }]}>
              Personal
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <IconButton
            icon="pencil-outline"
            size={18}
            iconColor={theme.colors.primary}
            onPress={() => onEdit(task)}
            style={styles.iconButton}
          />
          <IconButton
            icon="delete-outline"
            size={18}
            iconColor={theme.colors.error}
            onPress={() => onDelete(task.id)}
            style={styles.iconButton}
          />
        </View>
      </View>

      {/* Task Title */}
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
        {task.title}
      </Text>

      {/* Task Description */}
      {task.description ? (
        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      {/* Assignee Badge */}
      {task.assigneeName ? (
        <View style={[styles.assigneeContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="account-circle" size={16} color={theme.colors.primary} />
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 6 }}>
            Assignee: <Text style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>{task.assigneeName}</Text>
          </Text>
        </View>
      ) : null}

      {/* Footer Chips */}
      <View style={styles.footer}>
        <View style={[styles.customChip, { backgroundColor: statusStyle.bg }]}>
          <Text variant="labelSmall" style={[styles.chipText, { color: statusStyle.text }]}>
            {task.status}
          </Text>
        </View>

        <View style={[styles.customChip, { backgroundColor: priorityStyle.bg }]}>
          <Text variant="labelSmall" style={[styles.chipText, { color: priorityStyle.text }]}>
            {task.priority}
          </Text>
        </View>

        {task.dueDate && (
          <Text variant="bodySmall" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  teamText: {
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    margin: 0,
    width: 32,
    height: 32,
  },
  description: {
    marginBottom: 10,
    lineHeight: 19,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  customChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  date: {
    marginLeft: 'auto',
    fontSize: 12,
  },
});

export default TaskItem;
