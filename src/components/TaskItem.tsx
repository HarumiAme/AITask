import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { AIService } from '../services/AIService';
import {
  Edit2,
  Trash2,
  Plus,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  parentId?: number;
  parentTask?: Task;
  parentCompleted?: boolean;
  onDelete: (id: number, parentId?: number) => void;
  onEdit: (id: number, content: string, parentId?: number) => void;
  onAddSubtask: (parentId: number, content: string, insertAfter?: number) => void;
  onReorderTasks: (
    taskId: number,
    direction: 'up' | 'down',
    parentId?: number
  ) => void;
  onToggleCompletion: (id: number, parentId?: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  isFirst,
  isLast,
  parentId,
  parentTask,
  parentCompleted,
  onDelete,
  onEdit,
  onAddSubtask,
  onReorderTasks,
  onToggleCompletion,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskContent, setNewSubtaskContent] = useState('');
  const [isGeneratingSubtask, setIsGeneratingSubtask] = useState(false);
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState(true);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const newSubtaskTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isMainTask = !parentId;
  const shouldHideActions = task.completed || parentCompleted;
  const activeSubtasks = task.subtasks.filter(subtask => !subtask.completed);
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed);
  const hasSubtasks = task.subtasks.length > 0;

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      const textarea = editTextareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.selectionStart = textarea.value.length;
      textarea.selectionEnd = textarea.value.length;
      textarea.focus();
    }
  }, [isEditing, editedContent]);

  useEffect(() => {
    if (isAddingSubtask && newSubtaskTextareaRef.current) {
      const textarea = newSubtaskTextareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.selectionStart = textarea.value.length;
      textarea.selectionEnd = textarea.value.length;
      textarea.focus();
    }
  }, [isAddingSubtask, newSubtaskContent]);

  const handleEdit = () => {
    onEdit(task.id, editedContent, parentId);
    setIsEditing(false);
    setShowSubtasks(true);
  };

  const handleDelete = () => {
    onDelete(task.id, parentId);
  };

  const handleAddSubtask = () => {
    setIsAddingSubtask(true);
    setNewSubtaskContent('');
  };

  const handleSubmitSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskContent.trim()) {
      if (isMainTask) {
        onAddSubtask(task.id, newSubtaskContent.trim());
      } else {
        onAddSubtask(parentId!, newSubtaskContent.trim(), task.id);
      }
      setNewSubtaskContent('');
      setIsAddingSubtask(false);
      setShowSubtasks(true);
    }
  };

  const getSubtasksUpToIndex = (taskList: Task[], currentIndex: number): string[] => {
    return taskList
      .slice(0, currentIndex + 1)
      .map(t => t.content);
  };

  const handleGenerateSubtask = async () => {
    setIsGeneratingSubtask(true);
    try {
      let generatedSubtask;
      if (isMainTask) {
        if (task.subtasks.length === 0) {
          generatedSubtask = await AIService.generateFirstSubtask(task.content);
        } else {
          const existingSubtasks = task.subtasks.map(st => st.content);
          generatedSubtask = await AIService.generateSubtask(
            task.content,
            task.content,
            existingSubtasks
          );
        }
      } else if (parentTask) {
        const currentTaskIndex = parentTask.subtasks.findIndex(st => st.id === task.id);
        const subtasksUpToCurrent = getSubtasksUpToIndex(parentTask.subtasks, currentTaskIndex);
        
        generatedSubtask = await AIService.generateSubtask(
          parentTask.content,
          task.content,
          subtasksUpToCurrent
        );
      }

      if (generatedSubtask) {
        setNewSubtaskContent(generatedSubtask.trim());
        setIsAddingSubtask(true);
      }
    } catch (error) {
      console.error('Error generating subtask:', error);
    } finally {
      setIsGeneratingSubtask(false);
    }
  };

  const getGradientClass = () => {
    if (task.completed) {
      return 'from-slate-600/10 to-slate-700/10';
    }
    const gradients = [
      'from-blue-500/10 to-purple-500/10',
      'from-purple-500/10 to-pink-500/10',
      'from-green-500/10 to-blue-500/10',
      'from-pink-500/10 to-orange-500/10',
      'from-yellow-500/10 to-green-500/10',
    ];
    return gradients[task.gradientIndex ?? 0];
  };

  const ActionButtons = () => (
    <div className="flex flex-wrap items-center justify-end gap-1 mt-3 pt-3 border-t border-white/10 md:mt-0 md:pt-0 md:border-0">
      {!shouldHideActions && (
        <>
          {!isFirst && (
            <button
              onClick={() => onReorderTasks(task.id, 'up', parentId)}
              className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Move up"
            >
              <ArrowUp size={18} />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onReorderTasks(task.id, 'down', parentId)}
              className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Move down"
            >
              <ArrowDown size={18} />
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
            aria-label="Edit task"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleAddSubtask}
            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
            aria-label="Add subtask"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={handleGenerateSubtask}
            disabled={isGeneratingSubtask}
            className={`p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 rounded-lg transition-colors ${
              isGeneratingSubtask ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Generate subtask with AI"
          >
            <Sparkles size={18} />
          </button>
        </>
      )}
      <button
        onClick={handleDelete}
        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
        aria-label="Delete task"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );

  return (
    <div
      className={`
        ${
          isMainTask
            ? `bg-gradient-to-r ${getGradientClass()}`
            : task.completed
            ? 'bg-slate-700/10'
            : 'bg-white/5'
        } 
        backdrop-blur-sm rounded-xl border border-white/10 transition-all hover:border-white/20
        ${
          isMainTask
            ? 'hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
            : 'hover:bg-white/10'
        }
        transform duration-200
        ${task.completed ? 'opacity-75' : ''}
      `}
    >
      <div className="p-4">
        {isEditing ? (
          <div className="flex items-start space-x-2">
            <textarea
              ref={editTextareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-grow p-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none overflow-hidden text-white"
              rows={1}
              style={{ minHeight: '40px' }}
              autoFocus
            />
            <button
              onClick={handleEdit}
              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
            >
              <Check size={20} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggleCompletion(task.id, parentId)}
                className={`flex-shrink-0 mt-0.5 p-1.5 rounded-lg transition-colors ${
                  task.completed
                    ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-white/10'
                }`}
                aria-label={
                  task.completed ? 'Mark as incomplete' : 'Mark as complete'
                }
              >
                <CheckCircle2
                  size={18}
                  className={task.completed ? 'fill-green-400' : ''}
                />
              </button>
              <div className="flex items-start gap-2 min-w-0 flex-1 pt-1">
                <span
                  className={`${
                    isMainTask ? 'text-white font-medium' : 'text-slate-300'
                  } ${task.completed ? 'line-through opacity-75' : ''}`}
                >
                  {task.content}
                </span>
                {hasSubtasks && (
                  <button
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/10"
                  >
                    {showSubtasks ? (
                      <ChevronUp size={16} className="opacity-75" />
                    ) : (
                      <ChevronDown size={16} className="opacity-75" />
                    )}
                    <span className="sr-only">
                      {showSubtasks ? 'Hide subtasks' : 'Show subtasks'}
                    </span>
                  </button>
                )}
              </div>
            </div>
            <ActionButtons />
          </div>
        )}

        {isAddingSubtask && (
          <form onSubmit={handleSubmitSubtask} className="mt-3">
            <div className="flex items-start space-x-2">
              <textarea
                ref={newSubtaskTextareaRef}
                value={newSubtaskContent}
                onChange={(e) => setNewSubtaskContent(e.target.value)}
                placeholder="Agregar sub-tarea..."
                className="flex-grow p-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none overflow-hidden text-white placeholder-slate-400"
                rows={1}
                style={{ minHeight: '40px' }}
              />
              <button
                type="submit"
                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                aria-label="Save subtask"
              >
                <Check size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubtask(false)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                aria-label="Cancel"
              >
                <X size={20} />
              </button>
            </div>
          </form>
        )}
      </div>

      {isMainTask && hasSubtasks && showSubtasks && (
        <div className="pl-6 pr-2 pb-2 space-y-2">
          {activeSubtasks.length > 0 && (
            <ul className="space-y-2 relative">
              {activeSubtasks.map((subtask, subtaskIndex) => (
                <li
                  key={subtask.id}
                  className="transform transition-transform duration-200 ease-in-out"
                >
                  <TaskItem
                    task={subtask}
                    index={subtaskIndex}
                    isFirst={subtaskIndex === 0}
                    isLast={subtaskIndex === activeSubtasks.length - 1}
                    parentId={task.id}
                    parentTask={task}
                    parentCompleted={task.completed}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onAddSubtask={onAddSubtask}
                    onReorderTasks={onReorderTasks}
                    onToggleCompletion={onToggleCompletion}
                  />
                </li>
              ))}
            </ul>
          )}

          {completedSubtasks.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowCompletedSubtasks(!showCompletedSubtasks)}
                className="w-full p-2 flex items-center justify-between text-slate-400 hover:text-slate-300 transition-colors bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20"
              >
                <span className="text-sm font-medium">
                  Subtareas Completadas ({completedSubtasks.length})
                </span>
                {showCompletedSubtasks ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {showCompletedSubtasks && (
                <ul className="mt-2 space-y-2 relative">
                  {completedSubtasks.map((subtask, subtaskIndex) => (
                    <li
                      key={subtask.id}
                      className="transform transition-transform duration-200 ease-in-out"
                    >
                      <TaskItem
                        task={subtask}
                        index={subtaskIndex}
                        isFirst={subtaskIndex === 0}
                        isLast={subtaskIndex === completedSubtasks.length - 1}
                        parentId={task.id}
                        parentTask={task}
                        parentCompleted={task.completed}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onAddSubtask={onAddSubtask}
                        onReorderTasks={onReorderTasks}
                        onToggleCompletion={onToggleCompletion}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;