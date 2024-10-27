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
        setInput(generatedTask);
      } catch (error) {
        console.error('Error generating task:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-3">
      <div className="flex-grow relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Agregar nueva tarea..."
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none overflow-hidden placeholder-slate-400 text-white"
          rows={1}
          style={{ minHeight: '48px' }}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
      >
        <PlusCircle size={24} />
      </button>
      <button
        type="button"
        onClick={handleGenerateTask}
        disabled={isGenerating}
        className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-lg transition-all duration-200 ${
          isGenerating
            ? 'bg-slate-600/50 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] text-white'
        }`}
      >
        <Sparkles size={24} />
      </button>
    </form>
  );
};

export default TaskInput;