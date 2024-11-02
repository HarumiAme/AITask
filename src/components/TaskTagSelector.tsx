import React, { useState, useRef, useEffect } from 'react';
import { Tag } from '../types';
import { Tags } from 'lucide-react';

interface TaskTagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TaskTagSelector: React.FC<TaskTagSelectorProps> = ({
  tags,
  selectedTags,
  onTagsChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange(newSelectedTags);
  };

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Manage tags"
        >
          <Tags size={16} className="text-slate-400" />
        </button>
        {selectedTagObjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedTagObjects.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-opacity-100 text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 bottom-full mb-2 z-[100] w-48 py-2 bg-slate-800 rounded-lg shadow-xl border border-white/10"
        >
          {tags.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">No hay tags disponibles</p>
          ) : (
            tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 flex items-center justify-between group"
              >
                <span className="text-white/90">{tag.name}</span>
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedTags.includes(tag.id)
                      ? 'opacity-100'
                      : 'opacity-40 group-hover:opacity-60'
                  }`}
                  style={{ backgroundColor: tag.color }}
                />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TaskTagSelector;