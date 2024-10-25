import React from 'react';
import { useAuth } from '../context/AuthContext';
import TaskList from '../components/TaskList';
import TaskInput from '../components/TaskInput';
import { Task } from '../types';
import { AIService } from '../services/AIService';
import { BrainCircuit, LogOut } from 'lucide-react';
import { useState } from 'react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (content: string) => {
    const newTask: Task = {
      id: Date.now(),
      content,
      subtasks: [],
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: number, parentId?: number) => {
    if (parentId) {
      setTasks(
        tasks.map((task) =>
          task.id === parentId
            ? {
                ...task,
                subtasks: task.subtasks.filter((subtask) => subtask.id !== id),
              }
            : task
        )
      );
    } else {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  const editTask = (id: number, content: string, parentId?: number) => {
    if (parentId) {
      setTasks(
        tasks.map((task) =>
          task.id === parentId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === id ? { ...subtask, content } : subtask
                ),
              }
            : task
        )
      );
    } else {
      setTasks(
        tasks.map((task) => (task.id === id ? { ...task, content } : task))
      );
    }
  };

  const addSubtask = (parentId: number, content: string) => {
    const newSubtask: Task = {
      id: Date.now(),
      content,
      subtasks: [],
    };
    setTasks(
      tasks.map((task) =>
        task.id === parentId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      )
    );
  };

  const reorderTasks = (
    taskId: number,
    direction: 'up' | 'down',
    parentId?: number
  ) => {
    const reorder = (taskList: Task[]) => {
      const index = taskList.findIndex((task) => task.id === taskId);
      if (index === -1) return taskList;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= taskList.length) return taskList;
      const newTaskList = [...taskList];
      [newTaskList[index], newTaskList[newIndex]] = [
        newTaskList[newIndex],
        newTaskList[index],
      ];
      return newTaskList;
    };

    if (parentId) {
      setTasks(
        tasks.map((task) =>
          task.id === parentId
            ? { ...task, subtasks: reorder(task.subtasks) }
            : task
        )
      );
    } else {
      setTasks(reorder(tasks));
    }
  };

  const generateTaskWithAI = async (prompt: string): Promise<string> => {
    return await AIService.generateTask(prompt);
  };

  const generateSubtaskWithAI = async (
    parentId: number,
    context: string
  ): Promise<string> => {
    return await AIService.generateTask(context);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <nav className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BrainCircuit className="w-8 h-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">TaskAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <TaskInput
            onAddTask={addTask}
            onGenerateTask={generateTaskWithAI}
          />
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No tasks yet. Add your first task above!</p>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onDeleteTask={deleteTask}
                onEditTask={editTask}
                onAddSubtask={addSubtask}
                onReorderTasks={reorderTasks}
                onGenerateSubtask={generateSubtaskWithAI}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;