import React from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  History as HistoryIcon, 
  BarChart2, 
  Plus, 
  Search, 
  Bell, 
  SlidersHorizontal, 
  DownloadCloud, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Layers 
} from 'lucide-react';
import { ViewMode, UserProfile, Task } from '../types';
import { getRelativeDateLabel } from '../utils/dateUtils';
import { sound } from '../utils/sound';

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenNewTask: () => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenImportExport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUser: UserProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  show3D: boolean;
  onToggle3D: () => void;
  tasks: Task[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenNewTask,
  onOpenNotifications,
  onOpenAuth,
  onOpenImportExport,
  searchQuery,
  onSearchChange,
  currentUser,
  soundEnabled,
  onToggleSound,
  show3D,
  onToggle3D,
  tasks,
}) => {
  // Compute attention count for notifications
  const attentionCount = tasks.filter((t) => {
    if (t.completed) return false;
    const { isOverdue, isToday } = getRelativeDateLabel(t.dueDate, t.dueTime);
    return isOverdue || isToday;
  }).length;

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <HistoryIcon className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-950/40 px-4 sm:px-8 py-3.5 shadow-2xl backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo with 3D Hologram styling */}
        <div 
          onClick={() => {
            sound.playClick();
            onSelectView('dashboard');
          }}
          className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#0a0f0d] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-300 bg-clip-text text-transparent font-['Outfit',sans-serif]">
                ChronoTask
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Daily Routine & Habit Tracker</p>
          </div>
        </div>

        {/* View Tabs */}
        <nav className="hidden md:flex items-center bg-[#0a120e]/90 p-1 rounded-2xl border border-emerald-950/60 shadow-inner">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectView(item.id);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-extrabold shadow-md shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks (Ctrl+K)..."
            className="w-full bg-[#0a120e]/90 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* New Task Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNewTask();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* 3D Scene Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggle3D();
            }}
            className={`p-2 rounded-xl border transition-all ${
              show3D
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={show3D ? 'Disable 3D Background' : 'Enable 3D Background'}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            className="hidden sm:flex p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={soundEnabled ? 'Mute Sound Effects' : 'Unmute Sound Effects'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Backup Import/Export */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenImportExport();
            }}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Import or Export Tasks"
          >
            <DownloadCloud className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNotifications();
            }}
            className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reminders & Notifications"
          >
            <Bell className="w-4 h-4" />
            {attentionCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-pulse shadow-md shadow-rose-500/50">
                {attentionCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar & Name */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenAuth();
            }}
            className="flex items-center space-x-2 pl-1 cursor-pointer group"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500/50 group-hover:border-emerald-300 transition-all shadow-md"
            />
            <span className="hidden xl:inline text-xs font-semibold text-slate-300 group-hover:text-emerald-300">
              {currentUser.name}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="flex md:hidden items-center justify-around pt-3 mt-3 border-t border-slate-800/80">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectView(item.id);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                isActive ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
