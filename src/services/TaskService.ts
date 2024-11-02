import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types';

export const TaskService = {
  async saveTasks(userId: string, tasks: Task[]) {
    const batch = writeBatch(db);
    const tasksRef = collection(db, 'users', userId, 'tasks');

    // Delete existing tasks
    const existingTasks = await getDocs(tasksRef);
    existingTasks.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Serialize task data for Firestore
    const serializeTask = (task: Task, parentId: string | null = null, order: number) => {
      const taskData = {
        id: task.id.toString(), // Convert to string for Firestore
        content: task.content,
        completed: task.completed || false,
        parentId,
        order,
        gradientIndex: task.gradientIndex || 0,
        tags: task.tags || [],
        createdAt: Date.now(),
      };

      const taskRef = doc(tasksRef);
      batch.set(taskRef, taskData);

      // Save subtasks recursively
      task.subtasks?.forEach((subtask, index) => {
        serializeTask(subtask, task.id.toString(), index);
      });
    };

    // Save all tasks
    tasks.forEach((task, index) => {
      serializeTask(task, null, index);
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  },

  async loadTasks(userId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const snapshot = await getDocs(
        query(tasksRef, orderBy('order', 'asc'))
      );
      
      const tasks = new Map<string, Task>();
      const subtasksByParent = new Map<string, Task[]>();
      
      // First pass: Create all task objects
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const task: Task = {
          id: parseInt(data.id),
          content: data.content,
          completed: data.completed || false,
          gradientIndex: data.gradientIndex || 0,
          tags: data.tags || [],
          subtasks: [],
        };
        
        if (data.parentId === null) {
          tasks.set(data.id, task);
        } else {
          const parentSubtasks = subtasksByParent.get(data.parentId) || [];
          parentSubtasks.push(task);
          subtasksByParent.set(data.parentId, parentSubtasks);
        }
      });
      
      // Second pass: Assign subtasks to their parents
      tasks.forEach((task) => {
        const taskSubtasks = subtasksByParent.get(task.id.toString()) || [];
        task.subtasks = taskSubtasks.sort((a, b) => {
          const aDoc = snapshot.docs.find(doc => doc.data().id === a.id.toString());
          const bDoc = snapshot.docs.find(doc => doc.data().id === b.id.toString());
          return (aDoc?.data().order || 0) - (bDoc?.data().order || 0);
        });
      });
      
      // Convert to array and sort by order
      return Array.from(tasks.values()).sort((a, b) => {
        const aDoc = snapshot.docs.find(doc => doc.data().id === a.id.toString());
        const bDoc = snapshot.docs.find(doc => doc.data().id === b.id.toString());
        return (aDoc?.data().order || 0) - (bDoc?.data().order || 0);
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }
  },
};