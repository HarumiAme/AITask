import React from 'react';
import { useAuth } from '../context/AuthContext';
import TaskList from '../components/TaskList';
import TaskInput from '../components/TaskInput';
import { Task, Tag } from '../types';
import { BrainCircuit, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TaskService } from '../services/TaskService';
import { TagService } from '../services/TagService';
import TagSelector from '../components/TagSelector';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string[]>([]);
  const [lastGradientIndex, setLastGradientIndex] = useState<number>(-1);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        try {
          const [loadedTasks, loadedTags] = await Promise.all([
            TaskService.loadTasks(user.id),
            TagService.loadTags(user.id)
          ]);
          setTasks(loadedTasks);
          setTags(loadedTags);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [user?.id]);

  useEffect(() => {
    const saveTasks = async () => {
      if (user?.id) {
        try {
          await TaskService.saveTasks(user.id, tasks);
        } catch (error) {
          console.error('Error saving tasks:', error);
        }
      }
    };
    if (!loading) {
      saveTasks();
    }
  }, [tasks, user?.id, loading]);

  useEffect(() => {
    const saveTags = async () => {
      if (user?.id) {
        try {
          await TagService.saveTags(user.id, tags);
        } catch (error) {
          console.error('Error saving tags:', error);
        }
      }
    };
    if (!loading) {
      saveTags();
    }
  }, [tags, user?.id, loading]);

  const getNextGradientIndex = () => {
    const gradients = [0, 1, 2, 3, 4];
    const availableGradients = gradients.filter(
      (index) => index !== lastGradientIndex
    );
    const randomIndex = Math.floor(Math.random() * availableGradients.length);
    const nextGradient = availableGradients[randomIndex];
    setLastGradientIndex(nextGradient);
    return nextGradient;
  };

  const addTask = (content: string) => {
    const newTask: Task = {
      id: Date.now(),
      content,
      subtasks: [],
      completed: false,
      gradientIndex: getNextGradientIndex(),
      tags: selectedTagFilter, // Automatically add active tags
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

  const toggleTaskCompletion = (id: number, parentId?: number) => {
    if (parentId) {
      setTasks(
        tasks.map((task) =>
          task.id === parentId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === id
                    ? { ...subtask, completed: !subtask.completed }
                    : subtask
                ),
              }
            : task
        )
      );
    } else {
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    }
  };

  const addSubtask = (parentId: number, content: string, insertAfterId?: number) => {
    const newSubtask: Task = {
      id: Date.now(),
      content,
      subtasks: [],
      completed: false,
    };

    setTasks(
      tasks.map((task) => {
        if (task.id === parentId) {
          if (insertAfterId) {
            const insertIndex = task.subtasks.findIndex(
              (st) => st.id === insertAfterId
            );
            const newSubtasks = [...task.subtasks];
            newSubtasks.splice(insertIndex + 1, 0, newSubtask);
            return { ...task, subtasks: newSubtasks };
          } else {
            return { ...task, subtasks: [newSubtask, ...task.subtasks] };
          }
        }
        return task;
      })
    );
  };

  const reorderTasks = (taskId: number, direction: 'up' | 'down', parentId?: number) => {
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

  const updateTaskTags = (id: number, newTags: string[]) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, tags: newTags } : task
      )
    );
  };

  const handleCreateTag = (newTag: Tag) => {
    setTags([...tags, newTag]);
  };

  const handleDeleteTag = (tagIds: string[]) => {
    // Remove the tags from all tasks that have them
    setTasks(tasks.map(task => ({
      ...task,
      tags: task.tags?.filter(id => !tagIds.includes(id)) || []
    })));

    // Remove the tags from selected filters if they're selected
    setSelectedTagFilter(selectedTagFilter.filter(id => !tagIds.includes(id)));

    // Remove the tags from the tags list
    setTags(tags.filter(tag => !tagIds.includes(tag.id)));
  };

  const filteredTasks = tasks.filter(task => 
    selectedTagFilter.length === 0 || 
    task.tags?.some(tagId => selectedTagFilter.includes(tagId))
  );

  const activeTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-purple-900 fixed inset-0 overflow-auto">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-20 fixed"></div>

      <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BrainCircuit className="w-8 h-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">TaskAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden custom:inline text-slate-300/90">
                ¡Hola, {user?.name}!
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-300/90 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        <div className="space-y-4">
          <div className="space-y-2">
            <TaskInput onAddTask={addTask} />
            <TagSelector
              tags={tags}
              selectedTags={selectedTagFilter}
              onTagsChange={setSelectedTagFilter}
              onCreateTag={handleCreateTag}
              onDeleteTag={handleDeleteTag}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
              <div className="p-6">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">
                      No hay tareas activas. ¡Agrega tu primera tarea arriba!
                    </p>
                  </div>
                ) : (
                  <TaskList
                    tasks={activeTasks}
                    tags={tags}
                    onDeleteTask={deleteTask}
                    onEditTask={editTask}
                    onAddSubtask={addSubtask}
                    onReorderTasks={reorderTasks}
                    onToggleCompletion={toggleTaskCompletion}
                    onUpdateTags={updateTaskTags}
                  />
                )}
              </div>
            </div>

            {completedTasks.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full p-4 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
                >
                  <span className="text-lg font-medium">
                    Tareas Completadas ({completedTasks.length})
                  </span>
                  {showCompleted ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                {showCompleted && (
                  <div className="p-6 pt-0">
                    <TaskList
                      tasks={completedTasks}
                      tags={tags}
                      onDeleteTask={deleteTask}
                      onEditTask={editTask}
                      onAddSubtask={addSubtask}
                      onReorderTasks={reorderTasks}
                      onToggleCompletion={toggleTaskCompletion}
                      onUpdateTags={updateTaskTags}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;