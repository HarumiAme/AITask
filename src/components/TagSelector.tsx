import React, { useState } from 'react';
import { Tag } from '../types';
import { Plus, X, Check, Trash2, AlertTriangle } from 'lucide-react';

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onCreateTag: (tag: Tag) => void;
  onDeleteTag?: (tagIds: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  onDeleteTag,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingMode, setIsDeletingMode] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#F97316', // orange
  ];

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag({
        id: Date.now().toString(),
        name: newTagName.trim(),
        color: selectedColor,
      });
      setNewTagName('');
      setIsCreating(false);
      setSelectedColor('#3B82F6');
    }
  };

  const toggleTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange(newSelectedTags);
  };

  const toggleTagForDeletion = (tagId: string) => {
    const newTagsToDelete = new Set(tagsToDelete);
    if (newTagsToDelete.has(tagId)) {
      newTagsToDelete.delete(tagId);
    } else {
      newTagsToDelete.add(tagId);
    }
    setTagsToDelete(newTagsToDelete);
  };

  const handleDeleteTags = () => {
    if (onDeleteTag && tagsToDelete.size > 0) {
      // Convert Set to Array for deletion
      const tagsToDeleteArray = Array.from(tagsToDelete);
      
      // Remove selected tags from filters
      const newSelectedTags = selectedTags.filter(id => !tagsToDelete.has(id));
      onTagsChange(newSelectedTags);

      // Delete all selected tags at once
      onDeleteTag(tagsToDeleteArray);

      // Reset state
      setTagsToDelete(new Set());
      setShowDeleteConfirmation(false);
      setIsDeletingMode(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {onDeleteTag && tags.length > 0 && (
          <button
            onClick={() => setIsDeletingMode(true)}
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
            title="Eliminar Tags"
          >
            <Trash2 size={20} />
          </button>
        )}
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedTags.includes(tag.id)
                ? 'bg-opacity-100 text-white'
                : 'bg-opacity-20 text-white/70 hover:bg-opacity-30'
            }`}
            style={{ backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}33` }}
          >
            <span>{tag.name}</span>
          </button>
        ))}
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200 flex items-center gap-1"
        >
          <Plus size={14} />
          <span>Nuevo Tag</span>
        </button>
      </div>

      {isDeletingMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl border border-white/10 p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-medium text-white">Eliminar Tags</h3>
            <p className="text-sm text-white/70">Selecciona los tags que deseas eliminar:</p>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTagForDeletion(tag.id)}
                  className={`w-full px-4 py-2 rounded-lg text-left transition-colors flex items-center justify-between ${
                    tagsToDelete.has(tag.id) ? 'bg-red-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-white/90">{tag.name}</span>
                  </div>
                  <div className={`w-5 h-5 rounded border ${
                    tagsToDelete.has(tag.id)
                      ? 'bg-red-500 border-red-500'
                      : 'border-white/20'
                  } flex items-center justify-center`}>
                    {tagsToDelete.has(tag.id) && <Check size={14} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeletingMode(false);
                  setTagsToDelete(new Set());
                }}
                className="flex-1 px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => tagsToDelete.size > 0 && setShowDeleteConfirmation(true)}
                disabled={tagsToDelete.size === 0}
                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Eliminar ({tagsToDelete.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl border border-white/10 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-medium">Confirmar eliminación</h3>
            </div>
            <div className="space-y-2">
              <p className="text-white/70">
                ¿Estás seguro de que quieres eliminar los siguientes tags?
              </p>
              <div className="bg-white/5 rounded-lg p-3 space-y-1">
                {Array.from(tagsToDelete).map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <div key={tag.id} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm text-white/90">{tag.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
              <p className="text-sm text-red-400">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTags}
                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nombre del tag..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-white/50"
            />
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    selectedColor === color ? 'scale-125' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <Check size={14} className="text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200 flex items-center gap-1"
            >
              <X size={14} />
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={14} />
              <span>Crear Tag</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector;