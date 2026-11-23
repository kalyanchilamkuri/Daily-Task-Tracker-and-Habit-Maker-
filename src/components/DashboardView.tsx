import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Plus, 
  Zap 
} from 'lucide-react';
import { Task, Category, Priority, FilterOptions } from '../types';
import { TaskCard } from './TaskCard';
import { getTodayStr, formatReadableDate, getRelativeDateLabel } from '../utils/dateUtils';
import { sound } from '../utils/sound';

interface DashboardViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenNewTask: () => void;
  searchQuery: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  onOpenNewTask,
  searchQuery,
}) => {
  const todayStr = getTodayStr();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate');

  // Today's tasks metrics
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayTotal = todayTasks.length;
  const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Overdue count
  const overdueCount = tasks.filter((t) => {
    if (t.completed) return false;
    const { isOverdue } = getRelativeDateLabel(t.dueDate, t.dueTime);
    return isOverdue;
  }).length;

  // Filtered and Sorted Tasks
  const displayedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (filterStatus === 'pending' && task.completed) return false;
        if (filterStatus === 'completed' && !task.completed) return false;
        if (filterStatus === 'overdue') {
          if (task.completed) return false;
          const { isOverdue } = getRelativeDateLabel(task.dueDate, task.dueTime);
          if (!isOverdue) return false;
        }

        // Category filter
        if (filterCategory !== 'all' && task.category !== filterCategory) return false;

        // Priority filter
        if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchTags = task.tags?.some((tag) => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          // Compare YYYY-MM-DD + time
          const dateA = `${a.dueDate} ${a.dueTime || '23:59'}`;
          const dateB = `${b.dueDate} ${b.dueTime || '23:59'}`;
          return dateA.localeCompare(dateB);
        }
        if (sortBy === 'priority') {
          const weights: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [tasks, filterStatus, filterCategory, filterPriority, sortBy, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Today's Focus Hero Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-cyan-950/30 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop decorative orb */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Daily Focus • {formatReadableDate(todayStr)}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Transform Ideas Into Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              You have <span className="text-indigo-300 font-semibold">{todayTotal - todayCompleted} tasks pending</span> for today. Keep up the high productivity!
            </p>
          </div>

          {/* Quick Progress Indicator */}
          <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-inner flex-shrink-0">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400"
                  strokeDasharray={`${todayProgress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-cyan-300">{todayProgress}%</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-white">Today's Pace</span>
              <p className="text-[11px] text-slate-400">
                {todayCompleted} of {todayTotal} completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control and Filters Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Tasks', count: tasks.length },
              { id: 'pending', label: 'Pending', count: tasks.filter((t) => !t.completed).length },
              { id: 'completed', label: 'Completed', count: tasks.filter((t) => t.completed).length },
              { id: 'overdue', label: 'Overdue', count: overdueCount },
            ].map((tab) => {
              const isSelected = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setFilterStatus(tab.id as typeof filterStatus);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-indigo-950 text-indigo-200'
                        : tab.id === 'overdue' && tab.count > 0
                        ? 'bg-rose-500/20 text-rose-300 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Newest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Secondary Category & Priority Filters */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Category Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider font-mono mr-1">
              Category:
            </span>
            {['all', 'work', 'personal', 'fitness', 'study', 'finance', 'creative'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setFilterCategory(cat);
                }}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Priority Chips */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 text-[11px] uppercase tracking-wider font-mono mr-1">
              Priority:
            </span>
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => {
                  sound.playClick();
                  setFilterPriority(p);
                }}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  filterPriority === p
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      {displayedTasks.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No tasks matching criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No tasks found for "${searchQuery}". Clear your search or filters.`
                : 'Your task list is completely clear! Ready to plan your next milestone?'}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onOpenNewTask();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 inline-flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSubtask={onToggleSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
