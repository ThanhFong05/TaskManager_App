import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task } from '../types';

const TASKS_COLLECTION = 'tasks';

// 1. Subscribe to all tasks (filtered by user's teams in memory)
export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, TASKS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate,
          createdAt: data.createdAt,
          creatorId: data.creatorId || null,
          teamId: data.teamId || null,
          teamName: data.teamName || null,
          assigneeId: data.assigneeId || null,
          assigneeName: data.assigneeName || null,
        } as Task;
      });
      callback(tasks);
    },
    (error) => {
      console.error('Error subscribing to tasks:', error);
      callback([]);
    }
  );
};

// 2. Create Task with teamId, teamName, assigneeId, assigneeName
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
  try {
    await addDoc(collection(db, TASKS_COLLECTION), {
      ...taskData,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('Error creating task: ', error);
    throw error;
  }
};

// 3. Update Task
export const updateTask = async (id: string, updates: Partial<Task>) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await updateDoc(taskRef, updates);
  } catch (error) {
    console.error('Error updating task: ', error);
    throw error;
  }
};

// 4. Delete Task
export const deleteTask = async (id: string) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task: ', error);
    throw error;
  }
};
