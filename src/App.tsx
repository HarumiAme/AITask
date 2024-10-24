import React, { useState } from 'react';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';
import { Task } from './types';
import { AIService } from './services/AIService';
import { BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <BrainCircuit className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Task Manager</h1>
          <p className="text-slate-400">Organize your tasks with AI assistance</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
            <TaskInput
              onAddTask={addTask}
              onGenerateTask={generateTaskWithAI}
            />
          </div>
          
          <div className="p-6 bg-slate-50">
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

export default App;