import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { Edit2, Trash2, Plus, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';

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
    <li className="bg-white p-4 rounded-md shadow-sm">
      {isEditing ? (
        <div className="flex items-start space-x-2">
          <textarea
            ref={editTextareaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
            rows={1}
            style={{ minHeight: '40px' }}
            autoFocus
          />
          <button onClick={handleEdit} className="mt-1 text-green-500 hover:text-green-600">
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="break-words">{task.content}</span>
          <div className="flex space-x-2 ml-2 flex-shrink-0">
            {!isFirst && (
              <button onClick={() => onReorderTasks(task.id, 'up', parentId)} className="text-gray-500 hover:text-gray-600">
                <ArrowUp size={18} />
              </button>
            )}
            {!isLast && (
              <button onClick={() => onReorderTasks(task.id, 'down', parentId)} className="text-gray-500 hover:text-gray-600">
                <ArrowDown size={18} />
              </button>
            )}
            <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-600">
              <Edit2 size={18} />
            </button>
            <button onClick={handleDelete} className="text-red-500 hover:text-red-600">
              <Trash2 size={18} />
            </button>
            <button
              onClick={handleAddSubtask}
              className="text-green-500 hover:text-green-600"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={handleGenerateSubtask}
              disabled={isGeneratingSubtask}
              className={`text-purple-500 hover:text-purple-600 ${isGeneratingSubtask ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Sparkles size={18} />
            </button>
          </div>
        </div>
      )}
      {isAddingSubtask && (
        <form onSubmit={handleSubmitSubtask} className="mt-2">
          <div className="flex items-start space-x-2">
            <textarea
              ref={newSubtaskTextareaRef}
              value={newSubtaskContent}
              onChange={(e) => setNewSubtaskContent(e.target.value)}
              placeholder="Enter subtask..."
              className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
              rows={1}
              style={{ minHeight: '40px' }}
            />
            <button type="submit" className="mt-1 text-green-500 hover:text-green-600">
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingSubtask(false)}
              className="mt-1 text-red-500 hover:text-red-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {isMainTask && task.subtasks.length > 0 && (
        <ul className="mt-2 space-y-2 pl-4">
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