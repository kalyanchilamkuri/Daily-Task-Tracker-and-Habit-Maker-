import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  Award, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { Task, Category, Priority } from '../types';

interface AnalyticsViewProps {
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // By Priority
  const priorityBreakdown: Record<Priority, { total: number; completed: number }> = {
    urgent: { total: 0, completed: 0 },
    high: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low: { total: 0, completed: 0 },
  };

  // By Category
  const categoryBreakdown: Record<string, { total: number; completed: number }> = {
    work: { total: 0, completed: 0 },
    personal: { total: 0, completed: 0 },
    fitness: { total: 0, completed: 0 },
    study: { total: 0, completed: 0 },
    finance: { total: 0, completed: 0 },
    creative: { total: 0, completed: 0 },
  };

  tasks.forEach((t) => {
    if (priorityBreakdown[t.priority]) {
      priorityBreakdown[t.priority].total += 1;
      if (t.completed) priorityBreakdown[t.priority].completed += 1;
    }
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { total: 0, completed: 0 };
    }
    categoryBreakdown[t.category].total += 1;
    if (t.completed) categoryBreakdown[t.category].completed += 1;
  });

  const priorityColors: Record<Priority, string> = {
    urgent: 'from-rose-500 to-red-600',
    high: 'from-amber-400 to-orange-500',
    medium: 'from-indigo-500 to-blue-600',
    low: 'from-emerald-400 to-teal-600',
  };

  return (
    <div className="space-y-6">
      {/* Top Hero KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Completion Rate
            </span>
            <h3 className="text-4xl font-extrabold text-white mt-2">{completionRate}%</h3>
            <p className="text-xs text-slate-400 mt-1">
              {completed} of {total} tasks cleared
            </p>
          </div>
          {/* Progress Circular Gauge */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500"
                strokeDasharray={`${completionRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-indigo-400">{completionRate}%</span>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Active Pending
            </span>
            <h3 className="text-4xl font-extrabold text-indigo-300 mt-2">{pending}</h3>
            <p className="text-xs text-slate-400 mt-1">Ready for execution</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Target className="w-8 h-8" />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Productivity Score
            </span>
            <h3 className="text-4xl font-extrabold text-emerald-400 mt-2">
              {Math.min(99, 50 + Math.round(completionRate * 0.49))}
              <span className="text-lg font-light text-slate-500"> / 100</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">High efficiency velocity</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Performance */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Execution by Priority</h3>
          </div>

          <div className="space-y-4">
            {(Object.keys(priorityBreakdown) as Priority[]).map((p) => {
              const data = priorityBreakdown[p];
              const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

              return (
                <div key={p} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-slate-300">
                      {p} Priority
                    </span>
                    <span className="text-slate-400">
                      {data.completed} / {data.total} completed ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${priorityColors[p]} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <PieChart className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Category Allocation</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categoryBreakdown).map(([cat, data]) => {
              const share = total > 0 ? Math.round((data.total / total) * 100) : 0;
              return (
                <div
                  key={cat}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold capitalize text-slate-300">{cat}</span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      {share}%
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between text-xs text-slate-500">
                    <span>{data.total} tasks</span>
                    <span className="text-slate-400">{data.completed} done</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
