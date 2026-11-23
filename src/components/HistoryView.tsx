import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  Trash2, 
  Flame, 
  CheckCircle, 
  Trophy, 
  Search, 
  Calendar, 
  Tag, 
  TrendingUp 
} from 'lucide-react';
import { Task, Category } from '../types';
import { formatReadableDate } from '../utils/dateUtils';
import { sound } from '../utils/sound';

interface HistoryViewProps {
  tasks: Task[];
  onRestoreTask: (taskId: string) => void;
  onPermanentDelete: (taskId: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  tasks,
  onRestoreTask,
  onPermanentDelete,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const completedTasks = tasks.filter((t) => t.completed);

  // Filter completed tasks
  const filteredCompleted = completedTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate streak
  const calculateStreak = () => {
    if (completedTasks.length === 0) return 0;
    // Count distinct completion dates
    const dates = new Set(
      completedTasks
        .map((t) => (t.completedAt ? t.completedAt.slice(0, 10) : t.dueDate))
        .filter(Boolean)
    );
    return dates.size;
  };

  const streakCount = calculateStreak();
  const totalCompleted = completedTasks.length;
  const overallRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
  const totalMinutesCompleted = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const totalHours = (totalMinutesCompleted / 60).toFixed(1);

  // Group by date
  const groupedTasks: Record<string, Task[]> = {};
  filteredCompleted.forEach((t) => {
    const dateKey = t.completedAt ? t.completedAt.slice(0, 10) : t.dueDate;
    if (!groupedTasks[dateKey]) {
      groupedTasks[dateKey] = [];
    }
    groupedTasks[dateKey].push(t);
  });

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Top Banner & Gamification Streak */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Streak card */}
        <div className="glass-panel rounded-3xl p-5 border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono">
                Consistency
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-1 flex items-center space-x-2">
                <span>{streakCount}</span>
                <span className="text-base font-normal text-slate-400">active days</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Keep crushing goals daily to maintain your momentum.
          </p>
        </div>

        {/* Total Tasks Completed */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 to-slate-900/80 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                Completed Tasks
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-1">{totalCompleted}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Overall completion efficiency: <span className="text-indigo-300 font-semibold">{overallRate}%</span>
          </p>
        </div>

        {/* Productivity Time Invested */}
        <div className="glass-panel rounded-3xl p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-slate-900/80 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 font-mono">
                Focus Time
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                {totalHours} <span className="text-base font-normal text-slate-400">hrs</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Equivalent to {Math.round(totalMinutesCompleted / 25)} Pomodoro sprints.
          </p>
        </div>

        {/* Achievement Level */}
        <div className="glass-panel rounded-3xl p-5 border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-slate-900/80 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 font-mono">
                Rank Level
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {totalCompleted >= 20 ? 'Master' : totalCompleted >= 10 ? 'Achiever' : 'Pioneer'}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {totalCompleted >= 20
              ? 'Top tier milestone reached!'
              : `${20 - totalCompleted} tasks until Master tier.`}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search completed tasks..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
          />
        </div>

        {/* Category Pills & Clear All */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'work', 'personal', 'fitness', 'study', 'finance', 'creative'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}

          {completedTasks.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all completed task history?')) {
                  sound.playDelete();
                  onClearHistory();
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex-shrink-0"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* History Timeline */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Completion Timeline</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredCompleted.length} archived records
          </span>
        </div>

        {sortedDates.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500 mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-slate-300">No completion records found</h4>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm ? 'Try adjusting your search criteria' : 'Complete some tasks on the dashboard to build your log!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => {
              const dayTasks = groupedTasks[dateKey];
              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatReadableDate(dateKey)}</span>
                    <span className="text-slate-500">({dayTasks.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium text-slate-200 line-through truncate">
                              {t.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                              <span className="capitalize">{t.category}</span>
                              <span>•</span>
                              <span>{t.priority} priority</span>
                              {t.completedAt && (
                                <>
                                  <span>•</span>
                                  <span>Finished at {new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Restore or Delete */}
                        <div className="flex items-center space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              sound.playClick();
                              onRestoreTask(t.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 border border-slate-700 text-xs text-slate-300 flex items-center space-x-1.5 transition-all"
                            title="Restore to active tasks"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span className="hidden sm:inline">Restore</span>
                          </button>
                          <button
                            onClick={() => {
                              sound.playDelete();
                              onPermanentDelete(t.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Permanently remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
