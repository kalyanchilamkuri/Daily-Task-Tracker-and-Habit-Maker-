import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';
import { ImportExportModal } from './components/ImportExportModal';
import { ReplicateModal } from './components/ReplicateModal';
import { ThreeCanvas } from './components/ThreeCanvas';
import { StorageService } from './services/storage';
import { Task, UserProfile, ViewMode } from './types';
import { sound } from './utils/sound';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(StorageService.getUser());
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [show3D, setShow3D] = useState(true);
  const [pulseCount, setPulseCount] = useState(0);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | undefined>(undefined);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
  const [replicateSourceDate, setReplicateSourceDate] = useState<string | undefined>(undefined);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Initial load
  useEffect(() => {
    const loadedTasks = StorageService.getTasks();
    setTasks(loadedTasks);
    const user = StorageService.getUser();
    setCurrentUser(user);
    sound.setEnabled(user.soundEnabled);
  }, []);

  // Save tasks on change
  const updateTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  }, []);

  // Toggle task completed
  const handleToggleComplete = useCallback((taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
      StorageService.saveTasks(updated);
      return updated;
    });

    // Trigger 3D WebGL core acceleration pulse
    setPulseCount((c) => c + 1);
  }, []);

  // Toggle subtask
  const handleToggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const nextSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          // If all subtasks are now completed, auto-complete parent task!
          const allCompleted = nextSubtasks.every((s) => s.completed);
          return {
            ...t,
            subtasks: nextSubtasks,
            completed: allCompleted ? true : t.completed,
            completedAt: allCompleted && !t.completed ? new Date().toISOString() : t.completedAt,
          };
        }
        return t;
      });
      StorageService.saveTasks(updated);
      return updated;
    });
  }, []);

  // Delete task
  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      StorageService.saveTasks(updated);
      return updated;
    });
    showToast('Task removed');
  }, [showToast]);

  // Restore task from history
  const handleRestoreTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, completed: false, completedAt: undefined } : t
      );
      StorageService.saveTasks(updated);
      return updated;
    });
    showToast('Task restored to active list');
  }, [showToast]);

  // Clear completed history
  const handleClearHistory = useCallback(() => {
    setTasks((prev) => {
      const updated = prev.filter((t) => !t.completed);
      StorageService.saveTasks(updated);
      return updated;
    });
    showToast('History log cleared');
  }, [showToast]);

  // Open edit modal
  const handleEditTask = useCallback((task: Task) => {
    setTaskToEdit(task);
    setDefaultTaskDate(task.dueDate);
    setIsTaskModalOpen(true);
  }, []);

  // Save task (create or edit)
  const handleSaveTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === taskData.id ? { ...t, ...taskData } : t
        );
        StorageService.saveTasks(updated);
        return updated;
      });
      showToast('Task updated successfully');
    } else {
      // New
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
        completed: false,
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || [],
      };
      setTasks((prev) => {
        const updated = [newTask, ...prev];
        StorageService.saveTasks(updated);
        return updated;
      });
      showToast('New task added!');
    }
  }, [showToast]);

  // Add task on specific calendar date
  const handleAddTaskOnDate = useCallback((dateStr: string) => {
    setTaskToEdit(null);
    setDefaultTaskDate(dateStr);
    setIsTaskModalOpen(true);
  }, []);

  // Duplicate a single task to tomorrow (or today if overdue)
  const handleDuplicateSingleTask = useCallback((task: Task) => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dueDate: tomorrowStr,
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      subtasks: task.subtasks?.map((s) => ({
        ...s,
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        completed: false,
      })) || [],
    };

    setTasks((prev) => {
      const updated = [duplicated, ...prev];
      StorageService.saveTasks(updated);
      return updated;
    });
    sound.playCreate();
    showToast(`Replicated "${task.title.slice(0, 24)}..." for tomorrow!`);
  }, [showToast]);

  // Batch replicate tasks
  const handleReplicateBatch = useCallback((newTasks: Task[]) => {
    setTasks((prev) => {
      const updated = [...newTasks, ...prev];
      StorageService.saveTasks(updated);
      return updated;
    });
    sound.playCreate();
    showToast(`Replicated ${newTasks.length} routine tasks successfully!`);
  }, [showToast]);

  // Import tasks
  const handleImportTasks = useCallback((imported: Task[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      updateTasks(imported);
      showToast(`Imported ${imported.length} tasks (replaced workspace)`);
    } else {
      // Merge by ID
      const existingIds = new Set(tasks.map((t) => t.id));
      const newItems = imported.filter((t) => !existingIds.has(t.id));
      const merged = [...tasks, ...newItems];
      updateTasks(merged);
      showToast(`Merged ${newItems.length} new tasks`);
    }
  }, [tasks, updateTasks, showToast]);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    setCurrentUser((prev) => {
      const nextVal = !prev.soundEnabled;
      sound.setEnabled(nextVal);
      const updated = { ...prev, soundEnabled: nextVal };
      StorageService.saveUser(updated);
      return updated;
    });
  }, []);

  // Update user profile
  const handleUpdateUser = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    sound.setEnabled(user.soundEnabled);
    StorageService.saveUser(user);
    showToast('Profile updated');
  }, [showToast]);

  // Handle user authentication change (login / signup / logout)
  const handleUserAuthChange = useCallback((newUser: UserProfile) => {
    setCurrentUser(newUser);
    const userTasks = StorageService.getTasks(newUser.id);
    setTasks(userTasks);
    sound.setEnabled(newUser.soundEnabled);
    StorageService.saveUser(newUser);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsNotificationModalOpen(false);
        setIsAuthModalOpen(false);
        setIsImportExportOpen(false);
        setIsReplicateModalOpen(false);
      }
      // Ctrl + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // 'N' for new task (when not typing in an input/textarea)
      if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setTaskToEdit(null);
        setDefaultTaskDate(undefined);
        setIsTaskModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#070b09] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Interactive 3D WebGL Canvas Layer */}
      {show3D && <ThreeCanvas pulseTrigger={pulseCount} />}

      {/* Main App Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation Bar */}
        <Navbar
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenNewTask={() => {
            setTaskToEdit(null);
            setDefaultTaskDate(undefined);
            setIsTaskModalOpen(true);
          }}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenImportExport={() => setIsImportExportOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={currentUser}
          soundEnabled={currentUser.soundEnabled}
          onToggleSound={handleToggleSound}
          show3D={show3D}
          onToggle3D={() => setShow3D(!show3D)}
          tasks={tasks}
        />

        {/* View Routing */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onOpenNewTask={() => {
                setTaskToEdit(null);
                setDefaultTaskDate(undefined);
                setIsTaskModalOpen(true);
              }}
              searchQuery={searchQuery}
              onOpenReplicateModal={() => {
                setReplicateSourceDate(undefined);
                setIsReplicateModalOpen(true);
              }}
              onDuplicateTask={handleDuplicateSingleTask}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onAddTaskOnDate={handleAddTaskOnDate}
              onOpenReplicateModal={(dateStr) => {
                setReplicateSourceDate(dateStr);
                setIsReplicateModalOpen(true);
              }}
              onDuplicateTask={handleDuplicateSingleTask}
            />
          )}

          {currentView === 'history' && (
            <HistoryView
              tasks={tasks}
              onRestoreTask={handleRestoreTask}
              onPermanentDelete={handleDeleteTask}
              onClearHistory={handleClearHistory}
            />
          )}

          {currentView === 'analytics' && <AnalyticsView tasks={tasks} />}
        </main>

        {/* Footer */}
        <footer className="glass-panel border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © {new Date().getFullYear()} ChronoTask 3D • Next-Gen Task Management System
            </p>
            <div className="flex items-center space-x-4">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+K</kbd> to search</span>
              <span>•</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">N</kbd> for new task</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultDate={defaultTaskDate}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        tasks={tasks}
        onSelectTask={(task) => {
          handleEditTask(task);
        }}
        soundEnabled={currentUser.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onUserAuthChange={handleUserAuthChange}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        tasks={tasks}
        onImportTasks={handleImportTasks}
      />

      <ReplicateModal
        isOpen={isReplicateModalOpen}
        onClose={() => setIsReplicateModalOpen(false)}
        tasks={tasks}
        onReplicateTasks={handleReplicateBatch}
        initialSourceDate={replicateSourceDate}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-modal px-4 py-3 rounded-2xl border border-indigo-500/40 text-xs font-semibold text-white shadow-2xl flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
