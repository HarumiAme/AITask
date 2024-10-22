import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (content: string) => void;
  onGenerateTask: (prompt: string) => Promise<string>;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, onGenerateTask }) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTask(input.trim());
      setInput('');
    }
  };

  const handleGenerateTask = async () => {
    if (input.trim()) {
      setIsGenerating(true);
      try {
        const generatedTask = await onGenerateTask(input.trim());
        setInput((prevInput) => {
          const separator = prevInput.endsWith('.') || prevInput.endsWith('!') || prevInput.endsWith('?') ? ' ' : '. ';
          return `${prevInput}${separator}${generatedTask}`;
        });
      } catch (error) {
        console.error('Error generating task:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2 mb-4">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new task..."
        className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
        rows={1}
        style={{ minHeight: '40px' }}
      />
      <button
        type="submit"
        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <PlusCircle size={24} />
      </button>
      <button
        type="button"
        onClick={handleGenerateTask}
        disabled={isGenerating}
        className={`p-2 ${
          isGenerating ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'
        } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
      >
        <Sparkles size={24} />
      </button>
    </form>
  );
};

export default TaskInput;