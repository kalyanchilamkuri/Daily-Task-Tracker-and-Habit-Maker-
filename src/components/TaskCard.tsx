import React, { useState, useRef } from 'react';
import { 
  Check, 
  Clock, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2, 
  Tag, 
  Calendar 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Subtask } from '../types';
import { getRelativeDateLabel } from '../utils/dateUtils';
import { sound } from '../utils/sound';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const { label: dueLabel, isOverdue, isToday } = getRelativeDateLabel(task.dueDate, task.dueTime);

  // 3D Card Hover Physics
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6; // max 6 deg
    const rotY = ((x - centerX) / centerX) * 6;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: 'transform 0.08s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  };

  // Complete trigger with confetti
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      sound.playComplete();
      // Confetti burst
      const rect = cardRef.current?.getBoundingClientRect();
      const originX = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
      const originY = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: originX, y: originY },
        colors: ['#6366f1', '#00f2fe', '#f72585', '#a855f7'],
        disableForReducedMotion: true,
      });
    } else {
      sound.playClick();
    }
    onToggleComplete(task.id);
  };

  // Priority Styles
  const priorityConfig = {
    urgent: {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-400 glow-urgent',
      dot: 'bg-rose-500 shadow-rose-500/50',
      label: 'Urgent',
    },
    high: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400 glow-high',
      dot: 'bg-amber-500 shadow-amber-500/50',
      label: 'High',
    },
    medium: {
      bg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 glow-medium',
      dot: 'bg-indigo-400 shadow-indigo-500/50',
      label: 'Medium',
    },
    low: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 glow-low',
      dot: 'bg-emerald-400 shadow-emerald-500/50',
      label: 'Low',
    },
  }[task.priority];

  // Category Colors
  const categoryConfig: Record<string, { bg: string; text: string }> = {
    work: { bg: 'bg-blue-950/60 border-blue-500/30', text: 'text-blue-300' },
    personal: { bg: 'bg-purple-950/60 border-purple-500/30', text: 'text-purple-300' },
    fitness: { bg: 'bg-emerald-950/60 border-emerald-500/30', text: 'text-emerald-300' },
    study: { bg: 'bg-amber-950/60 border-amber-500/30', text: 'text-amber-300' },
    finance: { bg: 'bg-cyan-950/60 border-cyan-500/30', text: 'text-cyan-300' },
    creative: { bg: 'bg-pink-950/60 border-pink-500/30', text: 'text-pink-300' },
  };

  const catStyle = categoryConfig[task.category] || categoryConfig.work;

  // Subtask progress
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtaskPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`card-3d-wrap group relative rounded-2xl p-5 backdrop-blur-md transition-all duration-300 select-none ${
        task.completed
          ? 'bg-slate-900/40 border border-slate-800/80 opacity-75'
          : isOverdue
          ? 'bg-gradient-to-br from-rose-950/30 via-slate-900/80 to-slate-900/90 border border-rose-500/40 shadow-lg shadow-rose-950/30'
          : 'bg-slate-900/75 border border-slate-700/50 hover:border-indigo-500/50 shadow-xl shadow-black/40 hover:shadow-indigo-500/10'
      }`}
    >
      {/* 3D Inner Layer */}
      <div className="card-3d-inner flex flex-col space-y-3">
        {/* Header: Priority, Category, Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityConfig.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot} animate-pulse`} />
              <span>{priorityConfig.label}</span>
            </span>

            {/* Category Badge */}
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${catStyle.bg} ${catStyle.text}`}
            >
              <Tag className="w-3 h-3" />
              <span>{task.category}</span>
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                sound.playClick();
                onEdit(task);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 rounded-lg transition-all"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playDelete();
                onDelete(task.id);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-all"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title and Checkbox */}
        <div className="flex items-start space-x-3.5 pt-1">
          <button
            onClick={handleCheckboxClick}
            className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
              task.completed
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/40 scale-105'
                : 'border-slate-500 hover:border-indigo-400 hover:bg-indigo-500/10'
            }`}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-semibold transition-all duration-200 leading-snug break-words ${
                task.completed
                  ? 'line-through text-slate-400'
                  : 'text-slate-100 group-hover:text-indigo-200'
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                  task.completed ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded-md border border-slate-700/60 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Subtasks Progress & Expandable Toggle */}
        {totalSubtasks > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 cursor-pointer py-1"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Checklist ({completedSubtasks}/{totalSubtasks})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-300">{subtaskPercentage}%</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${subtaskPercentage}%` }}
              />
            </div>

            {/* Expanded Subtasks checklist */}
            {isExpanded && (
              <div className="mt-2 space-y-1.5 pl-1 transition-all">
                {task.subtasks.map((sub: Subtask) => (
                  <label
                    key={sub.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onToggleSubtask(task.id, sub.id);
                    }}
                    className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer text-xs text-slate-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => {}}
                      className="rounded border-slate-600 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                    />
                    <span className={sub.completed ? 'line-through text-slate-500' : ''}>
                      {sub.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer: Due date info & reminders */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
          <div
            className={`flex items-center space-x-1.5 font-medium ${
              task.completed
                ? 'text-slate-500'
                : isOverdue
                ? 'text-rose-400 animate-pulse'
                : isToday
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            <span>{dueLabel}</span>
          </div>

          {task.estimatedMinutes && (
            <div className="flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedMinutes}m est.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
