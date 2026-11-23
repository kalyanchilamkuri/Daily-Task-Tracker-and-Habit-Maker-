export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Category = 'work' | 'personal' | 'fitness' | 'study' | 'finance' | 'creative';

export type ColorTheme = 'emerald' | 'violet' | 'amber' | 'rose';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  category: Category;
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  tags: string[];
  subtasks: Subtask[];
  estimatedMinutes?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light' | 'cyber';
  colorTheme: ColorTheme;
  isGuest?: boolean;
}

export interface StoredUserAccount extends UserProfile {
  password: string; // simple local hashed or plain string for local authentication
}

export type ViewMode = 'dashboard' | 'calendar' | 'history' | 'analytics';

export interface FilterOptions {
  search: string;
  category: string;
  priority: string;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}
