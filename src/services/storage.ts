import { Task, UserProfile } from '../types';
import { getInitialTasks } from '../utils/mockData';

const TASKS_STORAGE_KEY = 'chronotask_tasks_v1';
const USER_STORAGE_KEY = 'chronotask_user_v1';

export const DEFAULT_USER: UserProfile = {
  id: 'usr_demo_77',
  name: 'Alex Mercer',
  email: 'alex.mercer@chronotask.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  soundEnabled: true,
  notificationsEnabled: true,
  theme: 'dark',
};

export class StorageService {
  public static getTasks(): Task[] {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
    }
    const initial = getInitialTasks();
    this.saveTasks(initial);
    return initial;
  }

  public static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }

  public static getUser(): UserProfile {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse user profile', e);
    }
    this.saveUser(DEFAULT_USER);
    return DEFAULT_USER;
  }

  public static saveUser(user: UserProfile): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  }

  // Export tasks as JSON string
  public static exportTasksJSON(tasks: Task[]): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chronotask_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Export tasks as CSV string
  public static exportTasksCSV(tasks: Task[]): void {
    const headers = ['ID', 'Title', 'Description', 'Due Date', 'Due Time', 'Priority', 'Category', 'Completed', 'Completed At', 'Tags'];
    const rows = tasks.map(t => [
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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `chronotask_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Import tasks from JSON file
  public static async importTasksFromJSON(file: File): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            // Validate basic structure
            const valid = parsed.filter(item => item && item.id && item.title && item.dueDate);
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
