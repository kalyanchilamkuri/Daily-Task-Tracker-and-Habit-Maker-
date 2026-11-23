import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Tag as TagIcon, 
  AlertCircle, 
  ListPlus, 
  Sparkles 
} from 'lucide-react';
import { Task, Priority, Category, Subtask } from '../types';
import { getTodayStr } from '../utils/dateUtils';
import { sound } from '../utils/sound';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt'> & { id?: string }) => void;
  taskToEdit?: Task | null;
  defaultDate?: string;
}

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'work', label: 'Work', color: 'bg-blue-500' },
  { value: 'personal', label: 'Personal', color: 'bg-purple-500' },
  { value: 'fitness', label: 'Fitness', color: 'bg-emerald-500' },
  { value: 'study', label: 'Study', color: 'bg-amber-500' },
  { value: 'finance', label: 'Finance', color: 'bg-cyan-500' },
  { value: 'creative', label: 'Creative', color: 'bg-pink-500' },
];

const PRIORITIES: { value: Priority; label: string; desc: string; color: string; border: string }[] = [
  { value: 'urgent', label: 'Urgent', desc: 'Critical deadline', color: 'text-rose-400 bg-rose-500/10', border: 'border-rose-500/50' },
  { value: 'high', label: 'High', desc: 'Important priority', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/50' },
  { value: 'medium', label: 'Medium', desc: 'Normal pacing', color: 'text-indigo-400 bg-indigo-500/10', border: 'border-indigo-500/50' },
  { value: 'low', label: 'Low', desc: 'When time permits', color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/50' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate || getTodayStr());
  const [dueTime, setDueTime] = useState('17:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(30);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.dueDate);
      setDueTime(taskToEdit.dueTime || '17:00');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setTags(taskToEdit.tags || []);
      setSubtasks(taskToEdit.subtasks || []);
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 30);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(defaultDate || getTodayStr());
      setDueTime('17:00');
      setPriority('medium');
      setCategory('work');
      setTags([]);
      setSubtasks([]);
      setEstimatedMinutes(30);
    }
    setError('');
  }, [taskToEdit, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter' && (e as React.KeyboardEvent).key !== ',') {
      return;
    }
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
    sound.playClick();
  };

  const handleRemoveSubtask = (subId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }

    sound.playCreate();
    onSave({
      id: taskToEdit ? taskToEdit.id : undefined,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      category,
      tags,
      subtasks,
      estimatedMinutes: Number(estimatedMinutes) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl glass-modal rounded-3xl p-6 sm:p-8 text-slate-100 z-10 max-h-[92vh] overflow-y-auto border border-slate-700/60 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-xs text-slate-400">
                Plan your work, set deadlines, and track milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Build WebGL 3D shader and test interactive cards"
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, links, or notes..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 resize-none"
            />
          </div>

          {/* Date, Time, Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Due Time</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Duration (min)
              </label>
              <input
                type="number"
                min={5}
                step={5}
                value={estimatedMinutes || ''}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                placeholder="e.g. 45"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${p.border} ${p.color} ring-1 ring-offset-0 ring-indigo-500 shadow-md`
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold text-xs tracking-wide">{p.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 border ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks Builder */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <ListPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Subtasks & Milestones</span>
            </label>

            {/* Subtask list */}
            {subtasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {subtasks.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-slate-500 font-mono text-[10px]">{idx + 1}.</span>
                      <span>{s.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(s.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask (e.g. Write test suite)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <TagIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tags (Optional)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-800 text-indigo-300 border border-slate-700 rounded-lg text-xs font-mono"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tag and press Enter (e.g. Design, Sprint, API)..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 font-mono"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
