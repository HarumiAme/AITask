import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { Edit2, Trash2, Plus, Sparkles, ArrowUp, ArrowDown, Check, X } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  parentId?: number;
  onDelete: (id: number, parentId?: number) => void;
  onEdit: (id: number, content: string, parentId?: number) => void;
  onAddSubtask: (parentId: number, content: string) => void;
  onReorderTasks: (taskId: number, direction: 'up' | 'down', parentId?: number) => void;
  onGenerateSubtask: (parentId: number, context: string) => Promise<string>;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  isFirst,
  isLast,
  parentId,
  onDelete,
  onEdit,
  onAddSubtask,
  onReorderTasks,
  onGenerateSubtask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskContent, setNewSubtaskContent] = useState('');
  const [isGeneratingSubtask, setIsGeneratingSubtask] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const newSubtaskTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isMainTask = !parentId;

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editedContent]);

  useEffect(() => {
    if (isAddingSubtask && newSubtaskTextareaRef.current) {
      newSubtaskTextareaRef.current.focus();
      newSubtaskTextareaRef.current.style.height = 'auto';
      newSubtaskTextareaRef.current.style.height = `${newSubtaskTextareaRef.current.scrollHeight}px`;
    }
  }, [isAddingSubtask, newSubtaskContent]);

  const handleEdit = () => {
    onEdit(task.id, editedContent, parentId);
    setIsEditing(false);
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
      onAddSubtask(isMainTask ? task.id : parentId!, newSubtaskContent.trim());
      setNewSubtaskContent('');
      setIsAddingSubtask(false);
    }
  };

  const handleGenerateSubtask = async () => {
    setIsGeneratingSubtask(true);
    const context = `Main task: ${isMainTask ? task.content : `Parent task: ${task.content}`}\nSubtasks: ${task.subtasks.map(st => st.content).join(', ')}`;
    try {
      const generatedSubtask = await onGenerateSubtask(isMainTask ? task.id : parentId!, context);
      setNewSubtaskContent(generatedSubtask.trim());
      setIsAddingSubtask(true);
    } catch (error) {
      console.error('Error generating subtask:', error);
    } finally {
      setIsGeneratingSubtask(false);
    }
  };

  return (
    <li className={`
      ${isMainTask ? 'bg-white' : 'bg-slate-50'} 
      rounded-lg shadow-sm border border-slate-200 transition-all 
      ${isMainTask ? 'hover:shadow-md' : ''}
    `}>
      <div className="p-4">
        {isEditing ? (
          <div className="flex items-start space-x-2">
            <textarea
              ref={editTextareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden bg-white"
              rows={1}
              style={{ minHeight: '40px' }}
              autoFocus
            />
            <button 
              onClick={handleEdit}
              className="p-2 text-green-500 hover:text-green-600 transition-colors"
            >
              <Check size={18} />
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 text-red-500 hover:text-red-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <span className={`break-words ${isMainTask ? 'text-slate-700' : 'text-slate-600'}`}>
              {task.content}
            </span>
            <div className="flex space-x-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isFirst && (
                <button 
                  onClick={() => onReorderTasks(task.id, 'up', parentId)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  <ArrowUp size={16} />
                </button>
              )}
              {!isLast && (
                <button 
                  onClick={() => onReorderTasks(task.id, 'down', parentId)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  <ArrowDown size={16} />
                </button>
              )}
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={handleDelete}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={handleAddSubtask}
                className="p-1 text-green-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={handleGenerateSubtask}
                disabled={isGeneratingSubtask}
                className={`p-1 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors ${
                  isGeneratingSubtask ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}
        
        {isAddingSubtask && (
          <form onSubmit={handleSubmitSubtask} className="mt-3">
            <div className="flex items-start space-x-2">
              <textarea
                ref={newSubtaskTextareaRef}
                value={newSubtaskContent}
                onChange={(e) => setNewSubtaskContent(e.target.value)}
                placeholder="Enter subtask..."
                className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden bg-white"
                rows={1}
                style={{ minHeight: '40px' }}
              />
              <button 
                type="submit"
                className="p-2 text-green-500 hover:text-green-600 transition-colors"
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubtask(false)}
                className="p-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </form>
        )}
      </div>
      
      {isMainTask && task.subtasks.length > 0 && (
        <ul className="pl-6 pr-2 pb-2 space-y-2">
          {task.subtasks.map((subtask, subtaskIndex) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              index={subtaskIndex}
              isFirst={subtaskIndex === 0}
              isLast={subtaskIndex === task.subtasks.length - 1}
              parentId={task.id}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddSubtask={onAddSubtask}
              onReorderTasks={onReorderTasks}
              onGenerateSubtask={onGenerateSubtask}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TaskItem;