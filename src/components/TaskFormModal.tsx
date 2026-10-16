import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Portal,
  Modal,
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  useTheme,
  Chip,
  Divider,
} from 'react-native-paper';
import { Task, TaskStatus, TaskPriority, Team, TeamMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserTeams, subscribeToTeamMembers } from '../services/teamService';

interface TaskFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  initialData?: Task | null;
  defaultTeamId?: string | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  initialData,
  defaultTeamId,
}) => {
  const theme = useTheme();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [selectedAssigneeName, setSelectedAssigneeName] = useState<string | null>(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState('');

  // Subscribe to user teams
  useEffect(() => {
    if (!user || !visible) return;
    const unsub = subscribeToUserTeams(user.uid, (userTeams) => {
      setTeams(userTeams);
    });
    return () => unsub();
  }, [user, visible]);

  // Subscribe to members of selected team
  useEffect(() => {
    if (!selectedTeamId) {
      setTeamMembers([]);
      setSelectedAssigneeId(null);
      setSelectedAssigneeName(null);
      return;
    }
    const unsub = subscribeToTeamMembers(selectedTeamId, (members) => {
      setTeamMembers(members);
    });
    return () => unsub();
  }, [selectedTeamId]);

  // Reset or populate form
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setStatus(initialData.status);
        setPriority(initialData.priority);
        setSelectedTeamId(initialData.teamId || null);
        setSelectedTeamName(initialData.teamName || null);
        setSelectedAssigneeId(initialData.assigneeId || null);
        setSelectedAssigneeName(initialData.assigneeName || null);
      } else {
        setTitle('');
        setDescription('');
        setStatus('To Do');
        setPriority('Medium');
        setSelectedTeamId(defaultTeamId || null);
        setSelectedTeamName(null);
        setSelectedAssigneeId(null);
        setSelectedAssigneeName(null);
      }
      setError('');
    }
  }, [visible, initialData, defaultTeamId]);

  // Sync teamName
  useEffect(() => {
    if (selectedTeamId && teams.length > 0) {
      const found = teams.find((t) => t.id === selectedTeamId);
      if (found) {
        setSelectedTeamName(found.name);
      }
    }
  }, [selectedTeamId, teams]);

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
      creatorId: initialData?.creatorId || user?.uid || null,
      teamId: selectedTeamId,
      teamName: selectedTeamId ? selectedTeamName : null,
      assigneeId: selectedAssigneeId,
      assigneeName: selectedAssigneeName,
      dueDate: initialData?.dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
    });

    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <Text variant="headlineSmall" style={[styles.header, { color: theme.colors.onSurface }]}>
            {initialData ? 'Edit Task' : 'Create Task'}
          </Text>

          {/* Title */}
          <TextInput
            label="Title *"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError('');
            }}
            mode="outlined"
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            error={!!error}
          />
          {error ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text> : null}

          {/* Description */}
          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
          />

          {/* Status */}
          <Text variant="titleSmall" style={[styles.label, { color: theme.colors.onSurface }]}>Status</Text>
          <SegmentedButtons
            value={status}
            onValueChange={(val) => setStatus(val as TaskStatus)}
            buttons={[
              { value: 'To Do', label: 'To Do' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Done', label: 'Done' },
            ]}
            style={styles.segmentedButton}
          />

          {/* Priority */}
          <Text variant="titleSmall" style={[styles.label, { color: theme.colors.onSurface }]}>Priority</Text>
          <SegmentedButtons
            value={priority}
            onValueChange={(val) => setPriority(val as TaskPriority)}
            buttons={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
            ]}
            style={styles.segmentedButton}
          />

          {/* Team Selection */}
          <Text variant="titleSmall" style={[styles.label, { color: theme.colors.onSurface }]}>
            Assign to Team (Optional)
          </Text>
          <View style={styles.chipRow}>
            <Chip
              selected={selectedTeamId === null}
              onPress={() => {
                setSelectedTeamId(null);
                setSelectedTeamName(null);
                setSelectedAssigneeId(null);
                setSelectedAssigneeName(null);
              }}
              style={[
                styles.chip,
                selectedTeamId === null && { backgroundColor: theme.colors.primaryContainer },
              ]}
              textStyle={{
                color: selectedTeamId === null ? theme.colors.primary : theme.colors.onSurfaceVariant,
                fontWeight: selectedTeamId === null ? 'bold' : 'normal',
              }}
            >
              Personal (No Team)
            </Chip>
            {teams.map((team) => (
              <Chip
                key={team.id}
                selected={selectedTeamId === team.id}
                onPress={() => {
                  setSelectedTeamId(team.id);
                  setSelectedTeamName(team.name);
                }}
                style={[
                  styles.chip,
                  selectedTeamId === team.id && { backgroundColor: theme.colors.primaryContainer },
                ]}
                textStyle={{
                  color: selectedTeamId === team.id ? theme.colors.primary : theme.colors.onSurfaceVariant,
                  fontWeight: selectedTeamId === team.id ? 'bold' : 'normal',
                }}
              >
                {team.name}
              </Chip>
            ))}
          </View>

          {/* Assignee Selection */}
          {selectedTeamId && (
            <View style={styles.assigneeSection}>
              <Divider style={styles.divider} />
              <Text variant="titleSmall" style={[styles.label, { color: theme.colors.onSurface }]}>
                Assign to Team Member
              </Text>
              {teamMembers.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                  No members found in this team.
                </Text>
              ) : (
                <View style={styles.chipRow}>
                  <Chip
                    selected={selectedAssigneeId === null}
                    onPress={() => {
                      setSelectedAssigneeId(null);
                      setSelectedAssigneeName(null);
                    }}
                    style={[
                      styles.chip,
                      selectedAssigneeId === null && { backgroundColor: theme.colors.primaryContainer },
                    ]}
                    textStyle={{
                      color: selectedAssigneeId === null ? theme.colors.primary : theme.colors.onSurfaceVariant,
                      fontWeight: selectedAssigneeId === null ? 'bold' : 'normal',
                    }}
                  >
                    Unassigned
                  </Chip>
                  {teamMembers.map((member) => (
                    <Chip
                      key={member.id}
                      icon="account"
                      selected={selectedAssigneeId === member.userId}
                      onPress={() => {
                        setSelectedAssigneeId(member.userId);
                        setSelectedAssigneeName(member.userName);
                      }}
                      style={[
                        styles.chip,
                        selectedAssigneeId === member.userId && { backgroundColor: theme.colors.primaryContainer },
                      ]}
                      textStyle={{
                        color: selectedAssigneeId === member.userId ? theme.colors.primary : theme.colors.onSurfaceVariant,
                        fontWeight: selectedAssigneeId === member.userId ? 'bold' : 'normal',
                      }}
                    >
                      {member.userName}
                    </Chip>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[styles.actionButton, { borderColor: theme.colors.outline }]}
              textColor={theme.colors.onSurfaceVariant}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              onPress={handleSubmit}
              style={styles.actionButton}
            >
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
    margin: 20,
    borderRadius: 20,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 22,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    marginBottom: 8,
    fontSize: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  segmentedButton: {
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 8,
  },
  assigneeSection: {
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  actionButton: {
    minWidth: 100,
    borderRadius: 10,
  },
});

export default TaskFormModal;
