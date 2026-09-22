import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Portal, Modal, TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { Task, TaskStatus, TaskPriority } from '../types';

interface TaskFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  initialData?: Task | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setStatus(initialData.status);
        setPriority(initialData.priority);
      } else {
        // Reset form for new task
        setTitle('');
        setDescription('');
        setStatus('To Do');
        setPriority('Medium');
      }
      setError('');
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      teamId: null,
      assigneeId: null,
      // Setting a dummy due date for now, could be enhanced with a date picker
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), 
    });
    
    onDismiss();
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text variant="headlineSmall" style={styles.header}>
            {initialData ? 'Edit Task' : 'Create Task'}
          </Text>

          <TextInput
            label="Title *"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError('');
            }}
            mode="outlined"
            style={styles.input}
            error={!!error}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Text variant="titleMedium" style={styles.label}>Status</Text>
          <SegmentedButtons
            value={status}
            onValueChange={(val) => setStatus(val as TaskStatus)}
            buttons={[
              { value: 'To Do', label: 'To Do' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Done', label: 'Done' },
            ]}
            style={styles.segmented}
          />

          <Text variant="titleMedium" style={styles.label}>Priority</Text>
          <SegmentedButtons
            value={priority}
            onValueChange={(val) => setPriority(val as TaskPriority)}
            buttons={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
            ]}
            style={styles.segmented}
          />

          <View style={styles.buttonContainer}>
            <Button mode="text" onPress={onDismiss} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
              {initialData ? 'Update' : 'Create'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  header: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default TaskFormModal;
