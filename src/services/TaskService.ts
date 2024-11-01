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

    // Add new tasks with order
    const saveTask = (task: Task, parentId: string | null = null, order: number) => {
      const taskRef = doc(tasksRef);
      batch.set(taskRef, {
        id: task.id,
        content: task.content,
        completed: task.completed || false,
        parentId,
        order,
        gradientIndex: parentId ? 0 : (task.gradientIndex || 0),
        createdAt: Date.now(),
      });

      // Save subtasks with their own order
      task.subtasks?.forEach((subtask, index) => {
        saveTask(subtask, task.id.toString(), index);
      });
    };

    tasks.forEach((task, index) => saveTask(task, null, index));
    await batch.commit();
  },

  async loadTasks(userId: string): Promise<Task[]> {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const snapshot = await getDocs(
      query(tasksRef, orderBy('order', 'asc'))
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
    
    // Second pass: Assign sorted subtasks to their parents
    tasks.forEach((task) => {
      const taskSubtasks = subtasksByParent.get(task.id.toString()) || [];
      // Sort subtasks by their order
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
  },
};