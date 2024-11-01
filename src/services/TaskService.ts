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

    // Add new tasks
    const saveTask = (task: Task, parentId: string | null = null) => {
      const taskRef = doc(tasksRef);
      batch.set(taskRef, {
        id: task.id,
        content: task.content,
        completed: task.completed || false,
        parentId,
        gradientIndex: parentId ? 0 : (task.gradientIndex || 0), // Default to 0 for subtasks
        createdAt: Date.now(),
      });

      // Recursively save subtasks
      task.subtasks?.forEach((subtask) => saveTask(subtask, task.id.toString()));
    };

    tasks.forEach((task) => saveTask(task));
    await batch.commit();
  },

  async loadTasks(userId: string): Promise<Task[]> {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const snapshot = await getDocs(
      query(tasksRef, orderBy('createdAt', 'asc'))
    );
    
    const tasks = new Map<string, Task>();
    const subtasksByParent = new Map<string, Task[]>();
    
    // First pass: Create all task objects and organize by parent
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const task: Task = {
        id: parseInt(data.id),
        content: data.content,
        completed: data.completed || false,
        gradientIndex: data.gradientIndex,
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
      task.subtasks = taskSubtasks;
    });
    
    return Array.from(tasks.values());
  },
};