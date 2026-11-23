import { Task, UserProfile, StoredUserAccount, ColorTheme } from '../types';
import { getInitialTasks } from '../utils/mockData';

const USERS_DB_KEY = 'chronotask_users_registry_v1';
const ACTIVE_USER_KEY = 'chronotask_active_user_v1';
const LEGACY_TASKS_KEY = 'chronotask_tasks_v1';

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
];

export const GUEST_USER: UserProfile = {
  id: 'usr_guest',
  name: 'Habit Builder',
  email: 'guest@chronotask.app',
  avatar: DEFAULT_AVATARS[0],
  soundEnabled: true,
  notificationsEnabled: true,
  theme: 'dark',
  colorTheme: 'emerald',
  isGuest: true,
};

export class StorageService {
  // Registry of all registered accounts on this browser
  private static getUsersRegistry(): StoredUserAccount[] {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse users registry', e);
    }
    return [];
  }

  private static saveUsersRegistry(users: StoredUserAccount[]): void {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users registry', e);
    }
  }

  // Active user session
  public static getUser(): UserProfile {
    try {
      const stored = localStorage.getItem(ACTIVE_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to get active user', e);
    }
    this.saveUser(GUEST_USER);
    return GUEST_USER;
  }

  public static saveUser(user: UserProfile): void {
    try {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save active user', e);
    }
  }

  // Register a new user
  public static register(name: string, email: string, password: string, avatar?: string): { success: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) return { success: false, error: 'Please enter your name.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
    if (!password || password.length < 4) return { success: false, error: 'Password must be at least 4 characters long.' };

    const users = this.getUsersRegistry();
    const existing = users.find((u) => u.email === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please Sign In.' };
    }

    const newUser: StoredUserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: cleanName,
      email: cleanEmail,
      password: password,
      avatar: avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'dark',
      colorTheme: 'emerald',
      isGuest: false,
    };

    users.push(newUser);
    this.saveUsersRegistry(users);

    const safeProfile: UserProfile = { ...newUser };
    this.saveUser(safeProfile);

    // Seed welcoming initial habit tasks for this new user
    const initialTasks = getInitialTasks();
    this.saveTasksForUser(safeProfile.id, initialTasks);

    return { success: true, user: safeProfile };
  }

  // Login existing user
  public static login(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsersRegistry();
    const found = users.find((u) => u.email === cleanEmail);

    if (!found) {
      return { success: false, error: 'No account found with this email. Please check spelling or Sign Up.' };
    }

    if (found.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const safeProfile: UserProfile = {
      id: found.id,
      name: found.name,
      email: found.email,
      avatar: found.avatar,
      soundEnabled: found.soundEnabled,
      notificationsEnabled: found.notificationsEnabled,
      theme: found.theme,
      colorTheme: found.colorTheme || 'emerald',
      isGuest: false,
    };

    this.saveUser(safeProfile);
    return { success: true, user: safeProfile };
  }

  // Log out back to guest
  public static logout(): UserProfile {
    const newGuest: UserProfile = {
      ...GUEST_USER,
      id: `usr_guest_${Date.now()}`,
    };
    this.saveUser(newGuest);
    return newGuest;
  }

  // Tasks isolated per user ID
  public static getTasks(userId?: string): Task[] {
    const activeId = userId || this.getUser().id;
    const userTasksKey = `chronotask_tasks_${activeId}`;

    try {
      const stored = localStorage.getItem(userTasksKey);
      if (stored) {
        return JSON.parse(stored);
      }

      // Check legacy key for migration
      const legacy = localStorage.getItem(LEGACY_TASKS_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        this.saveTasksForUser(activeId, parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse tasks', e);
    }

    // Default starter tasks for new users
    const initial = getInitialTasks();
    this.saveTasksForUser(activeId, initial);
    return initial;
  }

  public static saveTasksForUser(userId: string, tasks: Task[]): void {
    try {
      const userTasksKey = `chronotask_tasks_${userId}`;
      localStorage.setItem(userTasksKey, JSON.stringify(tasks));
      // Keep legacy key synced for backup
      localStorage.setItem(LEGACY_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }

  public static saveTasks(tasks: Task[]): void {
    const activeUser = this.getUser();
    this.saveTasksForUser(activeUser.id, tasks);
  }

  // Export tasks as JSON
  public static exportTasksJSON(tasks: Task[]): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chronotask_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Export tasks as CSV
  public static exportTasksCSV(tasks: Task[]): void {
    const headers = ['ID', 'Title', 'Description', 'Due Date', 'Due Time', 'Priority', 'Category', 'Completed', 'Completed At', 'Tags'];
    const rows = tasks.map((t) => [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.dueDate || ''}"`,
      `"${t.dueTime || ''}"`,
      `"${t.priority}"`,
      `"${t.category}"`,
      `"${t.completed ? 'YES' : 'NO'}"`,
      `"${t.completedAt || ''}"`,
      `"${t.tags.join('; ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `chronotask_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Import tasks
  public static async importTasksFromJSON(file: File): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter((item) => item && item.id && item.title && item.dueDate);
            resolve(valid);
          } else {
            reject(new Error('Invalid format: root must be an array of tasks'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
