import React, { useState } from 'react';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';
import { Task } from './types';
import { AIService } from './services/AIService';

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
      setTasks(tasks.map(task => 
        task.id === parentId
          ? { ...task, subtasks: task.subtasks.filter(subtask => subtask.id !== id) }
          : task
      ));
    } else {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const editTask = (id: number, content: string, parentId?: number) => {
    if (parentId) {
      setTasks(tasks.map(task => 
        task.id === parentId
          ? { ...task, subtasks: task.subtasks.map(subtask => subtask.id === id ? { ...subtask, content } : subtask) }
          : task
      ));
    } else {
      setTasks(tasks.map(task => task.id === id ? { ...task, content } : task));
    }
  };

  const addSubtask = (parentId: number, content: string) => {
    const newSubtask: Task = {
      id: Date.now(),
      content,
      subtasks: [],
    };
    setTasks(tasks.map(task => 
      task.id === parentId
        ? { ...task, subtasks: [...task.subtasks, newSubtask] }
        : task
    ));
  };

  const reorderTasks = (taskId: number, direction: 'up' | 'down', parentId?: number) => {
    const reorder = (taskList: Task[]) => {
      const index = taskList.findIndex(task => task.id === taskId);
      if (index === -1) return taskList;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= taskList.length) return taskList;
      const newTaskList = [...taskList];
      [newTaskList[index], newTaskList[newIndex]] = [newTaskList[newIndex], newTaskList[index]];
      return newTaskList;
    };

    if (parentId) {
      setTasks(tasks.map(task => 
        task.id === parentId
          ? { ...task, subtasks: reorder(task.subtasks) }
          : task
      ));
    } else {
      setTasks(reorder(tasks));
    }
  };

  const generateTaskWithAI = async (prompt: string): Promise<string> => {
    return await AIService.generateTask(prompt);
  };

  const generateSubtaskWithAI = async (parentId: number, context: string): Promise<string> => {
    return await AIService.generateTask(context);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">AI-Powered To-Do List</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <TaskInput onAddTask={addTask} onGenerateTask={generateTaskWithAI} />
              <TaskList
                tasks={tasks}
                onDeleteTask={deleteTask}
                onEditTask={editTask}
                onAddSubtask={addSubtask}
                onReorderTasks={reorderTasks}
                onGenerateSubtask={generateSubtaskWithAI}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;