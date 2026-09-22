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
        return '#4CAF50';
      case 'In Progress':
        return '#2196F3';
      case 'To Do':
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#F44336';
      case 'Medium':
        return '#FF9800';
      case 'Low':
      default:
        return '#4CAF50';
    }
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
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
          <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
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
            <Text variant="bodySmall" style={styles.date}>
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
    backgroundColor: '#fff',
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
    color: '#666',
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
    color: '#888',
    marginLeft: 'auto',
  },
});

export default TaskItem;
