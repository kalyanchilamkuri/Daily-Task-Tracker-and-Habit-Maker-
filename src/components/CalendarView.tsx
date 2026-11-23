import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Repeat, 
  Copy 
} from 'lucide-react';
import { Task } from '../types';
import { 
  getMonthDaysGrid, 
  MONTH_NAMES, 
  WEEKDAYS, 
  getTodayStr, 
  formatReadableDate 
} from '../utils/dateUtils';
import { TaskCard } from './TaskCard';
import { sound } from '../utils/sound';

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddTaskOnDate: (dateStr: string) => void;
  onOpenReplicateModal?: (dateStr: string) => void;
  onDuplicateTask?: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddTaskOnDate,
  onOpenReplicateModal,
  onDuplicateTask,
}) => {
  const todayStr = getTodayStr();
  const [todayYear, todayMonth] = todayStr.split('-').map(Number);

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth - 1); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'month' | 'selectedDay'>('month');

  // Month navigation
  const handlePrevMonth = () => {
    sound.playClick();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    sound.playClick();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToday = () => {
    sound.playClick();
    setCurrentYear(todayYear);
    setCurrentMonth(todayMonth - 1);
    setSelectedDate(todayStr);
  };

  // Generate grid
  const cells = getMonthDaysGrid(currentYear, currentMonth);

  // Group tasks by dueDate
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (!map[t.dueDate]) {
        map[t.dueDate] = [];
      }
      map[t.dueDate].push(t);
    });
    return map;
  }, [tasks]);

  // Tasks for the currently selected date
  const selectedDateTasks = tasksByDate[selectedDate] || [];
  const selectedPending = selectedDateTasks.filter((t) => !t.completed);
  const selectedCompleted = selectedDateTasks.filter((t) => t.completed);

  // Month stats
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTasks = tasks.filter((t) => t.dueDate.startsWith(monthPrefix));
  const monthCompletedCount = monthTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
            {currentMonth + 1}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span>{MONTH_NAMES[currentMonth]}</span>
              <span className="text-emerald-400 font-light">{currentYear}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {monthTasks.length} tasks scheduled ({monthCompletedCount} completed)
            </p>
          </div>
        </div>

        {/* View Switch & Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleJumpToday}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium px-2 text-slate-400">
              {MONTH_NAMES[currentMonth].slice(0, 3)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onAddTaskOnDate(selectedDate);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add on {selectedDate === todayStr ? 'Today' : selectedDate.slice(5)}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Grid */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell) => {
              const dayTasks = tasksByDate[cell.dateStr] || [];
              const isSelected = cell.dateStr === selectedDate;
              const hasTasks = dayTasks.length > 0;
              const pendingCount = dayTasks.filter((t) => !t.completed).length;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDate(cell.dateStr);
                    setActiveTab('selectedDay');
                  }}
                  className={`group min-h-[82px] sm:min-h-[96px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-600/20 ring-1 ring-emerald-500'
                      : cell.isToday
                      ? 'bg-slate-800/80 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : cell.isCurrentMonth
                      ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      : 'bg-slate-950/30 border-slate-900/50 opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Top: Day number & today badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasTasks && (
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md ${
                          pendingCount > 0
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task indicator dots */}
                  {hasTasks ? (
                    <div className="mt-1 flex flex-wrap gap-1 max-h-9 overflow-hidden">
                      {dayTasks.slice(0, 4).map((t) => {
                        const dotColor = {
                          urgent: 'bg-rose-500',
                          high: 'bg-amber-400',
                          medium: 'bg-indigo-400',
                          low: 'bg-emerald-400',
                        }[t.priority];

                        return (
                          <div
                            key={t.id}
                            title={`${t.title} (${t.priority})`}
                            className={`w-2 h-2 rounded-full ${dotColor} ${
                              t.completed ? 'opacity-30' : 'animate-pulse'
                            }`}
                          />
                        );
                      })}
                      {dayTasks.length > 4 && (
                        <span className="text-[9px] text-slate-400">+{dayTasks.length - 4}</span>
                      )}
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                {selectedDate === todayStr ? 'Today\'s Agenda' : 'Selected Date'}
              </span>
              <h3 className="text-lg font-bold text-white">
                {formatReadableDate(selectedDate)}
              </h3>
            </div>
            <div className="flex items-center space-x-1.5">
              {onOpenReplicateModal && selectedDateTasks.length > 0 && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenReplicateModal(selectedDate);
                  }}
                  className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-xl transition-all"
                  title="Replicate this day's routine to another day"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  sound.playClick();
                  onAddTaskOnDate(selectedDate);
                }}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-md transition-all"
                title="Add task on this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick status bar */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-white">{selectedPending.length}</span>
                <p className="text-[10px] text-slate-400 uppercase">Pending</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-bold text-white">{selectedCompleted.length}</span>
                <p className="text-[10px] text-slate-400 uppercase">Completed</p>
              </div>
            </div>
          </div>

          {/* Tasks list on selected date */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[500px]">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
                <p className="text-sm text-slate-400">No tasks planned for this date.</p>
                <button
                  onClick={() => {
                    sound.playClick();
                    onAddTaskOnDate(selectedDate);
                  }}
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Add task now
                </button>
              </div>
            ) : (
              selectedDateTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleSubtask={onToggleSubtask}
                  onDuplicate={onDuplicateTask}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
