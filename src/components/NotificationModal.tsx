import React from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { Task } from '../types';
import { getRelativeDateLabel, formatReadableDate } from '../utils/dateUtils';
import { sound } from '../utils/sound';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  // Filter tasks that need attention: overdue or due today
  const attentionTasks = tasks.filter((t) => {
    if (t.completed) return false;
    const { isOverdue, isToday } = getRelativeDateLabel(t.dueDate, t.dueTime);
    return isOverdue || isToday;
  });

  const overdueList = attentionTasks.filter((t) => {
    const { isOverdue } = getRelativeDateLabel(t.dueDate, t.dueTime);
    return isOverdue;
  });

  const todayList = attentionTasks.filter((t) => {
    const { isOverdue, isToday } = getRelativeDateLabel(t.dueDate, t.dueTime);
    return isToday && !isOverdue;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg glass-modal rounded-3xl p-6 text-slate-100 z-10 border border-slate-700/60 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications & Alerts</h2>
              <p className="text-xs text-slate-400">
                {attentionTasks.length} tasks requiring prompt action
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onToggleSound();
                sound.playClick();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
          {/* Overdue Section */}
          {overdueList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-400 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Overdue Deadlines ({overdueList.length})</span>
              </div>
              {overdueList.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTask(t);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/60 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-semibold text-white truncate">{t.title}</h4>
                    <p className="text-[11px] text-rose-300 mt-0.5">
                      Due: {formatReadableDate(t.dueDate)} {t.dueTime && `at ${t.dueTime}`}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                    Overdue
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Due Today Section */}
          {todayList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Due Today ({todayList.length})</span>
              </div>
              {todayList.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTask(t);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-semibold text-white truncate">{t.title}</h4>
                    <p className="text-[11px] text-amber-300 mt-0.5">
                      {t.dueTime ? `Due at ${t.dueTime}` : 'Due today by end of day'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Today
                  </span>
                </div>
              ))}
            </div>
          )}

          {attentionTasks.length === 0 && (
            <div className="text-center py-12 px-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">All caught up!</h4>
              <p className="text-xs text-slate-400 mt-1">
                You have no pending overdue tasks or impending deadlines today.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
