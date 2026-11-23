import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Calendar, 
  CheckSquare, 
  Repeat, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { Task } from '../types';
import { getTodayStr, formatReadableDate } from '../utils/dateUtils';
import { sound } from '../utils/sound';

interface ReplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onReplicateTasks: (newTasks: Task[]) => void;
  initialSourceDate?: string;
}

export const ReplicateModal: React.FC<ReplicateModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onReplicateTasks,
  initialSourceDate,
}) => {
  const todayStr = getTodayStr();
  const [sourceDate, setSourceDate] = useState(initialSourceDate || todayStr);

  // Default target date to tomorrow
  const [year, month, day] = todayStr.split('-').map(Number);
  const tomorrow = new Date(year, month - 1, day + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const [targetDate, setTargetDate] = useState(tomorrowStr);
  const [multiDayCount, setMultiDayCount] = useState<number>(1); // 1 = targetDate, 3 = 3 days, 7 = full week

  // Find tasks belonging to sourceDate
  const sourceTasks = tasks.filter((t) => t.dueDate === sourceDate);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Update selected tasks whenever sourceDate changes or modal opens
  React.useEffect(() => {
    const matching = tasks.filter((t) => t.dueDate === sourceDate);
    setSelectedTaskIds(matching.map((t) => t.id));
  }, [sourceDate, tasks, isOpen]);

  if (!isOpen) return null;

  const toggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const selectAll = () => {
    setSelectedTaskIds(sourceTasks.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedTaskIds([]);
  };

  const handleReplicate = () => {
    if (selectedTaskIds.length === 0) return;

    sound.playCreate();
    const tasksToClone = sourceTasks.filter((t) => selectedTaskIds.includes(t.id));
    const generatedTasks: Task[] = [];

    const [tY, tM, tD] = targetDate.split('-').map(Number);

    for (let dayOffset = 0; dayOffset < multiDayCount; dayOffset++) {
      const curTargetDateObj = new Date(tY, tM - 1, tD + dayOffset);
      const curTargetDateStr = `${curTargetDateObj.getFullYear()}-${String(curTargetDateObj.getMonth() + 1).padStart(2, '0')}-${String(curTargetDateObj.getDate()).padStart(2, '0')}`;

      tasksToClone.forEach((original) => {
        const clonedTask: Task = {
          ...original,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          dueDate: curTargetDateStr,
          completed: false, // Reset so user completes it fresh!
          completedAt: undefined,
          createdAt: new Date().toISOString(),
          // Reset all subtasks so checklists start fresh
          subtasks: original.subtasks?.map((sub) => ({
            ...sub,
            id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            completed: false,
          })) || [],
        };
        generatedTasks.push(clonedTask);
      });
    }

    onReplicateTasks(generatedTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-xl glass-modal rounded-3xl p-6 sm:p-7 text-slate-100 z-10 border border-emerald-500/30 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/30">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Replicate Daily Routine</h2>
              <p className="text-xs text-slate-400">
                Copy your daily habits and tasks to other days effortlessly
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

        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Source and Target Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Source Date (From)</span>
              </label>
              <input
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {formatReadableDate(sourceDate)} ({sourceTasks.length} tasks)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Starting Target Date (To)</span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {formatReadableDate(targetDate)}
              </span>
            </div>
          </div>

          {/* Habit Repeat Multiplier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Routine Repetition (Habit Builder)</span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { count: 1, label: 'Single Day', desc: 'Copy to 1 day' },
                { count: 3, label: 'Next 3 Days', desc: 'Copy to 3 days' },
                { count: 7, label: 'Whole Week', desc: 'Copy to 7 days' },
              ].map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setMultiDayCount(opt.count)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    multiDayCount === opt.count
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select Tasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tasks to Replicate ({selectedTaskIds.length}/{sourceTasks.length})
              </label>
              <div className="space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-500 hover:text-slate-400"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {sourceTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No tasks exist on {formatReadableDate(sourceDate)}. Choose another source date.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sourceTasks.map((task) => {
                  const isChecked = selectedTaskIds.includes(task.id);
                  return (
                    <label
                      key={task.id}
                      onClick={() => toggleSelectTask(task.id)}
                      className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-600 text-indigo-600 focus:ring-0 bg-slate-900"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{task.title}</div>
                        <div className="text-[10px] text-slate-500 capitalize flex items-center space-x-2 mt-0.5">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{task.priority}</span>
                          {task.subtasks?.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{task.subtasks.length} subtasks</span>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Information badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start space-x-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              All replicated tasks start <strong>fresh and uncompleted</strong> with new checklist milestones so you can check them off every day to build your habit streak!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Will generate {selectedTaskIds.length * multiDayCount} new tasks
          </span>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedTaskIds.length === 0}
              onClick={handleReplicate}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg transition-all flex items-center space-x-1.5 ${
                selectedTaskIds.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Replicate Routine</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
