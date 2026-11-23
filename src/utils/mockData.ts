import { Task } from '../types';
import { getTodayStr } from './dateUtils';

export function getInitialTasks(): Task[] {
  const today = getTodayStr();
  const [year, month, day] = today.split('-').map(Number);

  // Past dates for history
  const yesterday = new Date(year, month - 1, day - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const twoDaysAgo = new Date(year, month - 1, day - 2);
  const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;

  const tomorrow = new Date(year, month - 1, day + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const nextWeek = new Date(year, month - 1, day + 4);
  const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'task-1',
      title: 'Finalize 3D UI & WebGL shader interaction',
      description: 'Implement dynamic floating polyhedra in Three.js with mouse tilt parallax effect and particle constellation.',
      dueDate: today,
      dueTime: '17:00',
      priority: 'urgent',
      category: 'work',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      tags: ['Design', '3D', 'Frontend'],
      subtasks: [
        { id: 'sub-1', title: 'Setup Three.js canvas & render loop', completed: true },
        { id: 'sub-2', title: 'Add floating geometry & glass material', completed: true },
        { id: 'sub-3', title: 'Configure mouse movement damping', completed: false },
      ],
      estimatedMinutes: 60,
    },
    {
      id: 'task-2',
      title: 'Review weekly sprint milestones with team',
      description: 'Go over Q4 objectives, review task completions, and assign calendar milestones for upcoming releases.',
      dueDate: today,
      dueTime: '15:30',
      priority: 'high',
      category: 'work',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      tags: ['Meeting', 'Productivity'],
      subtasks: [
        { id: 'sub-4', title: 'Prepare slide deck & metrics', completed: true },
        { id: 'sub-5', title: 'Send invitation link', completed: true },
      ],
      estimatedMinutes: 45,
    },
    {
      id: 'task-3',
      title: 'Evening 5K Run & Core Training',
      description: 'Maintain 7-day fitness streak. Track heart rate and pace.',
      dueDate: today,
      dueTime: '19:00',
      priority: 'medium',
      category: 'fitness',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      tags: ['Health', 'Cardio'],
      subtasks: [
        { id: 'sub-6', title: 'Dynamic stretching', completed: false },
        { id: 'sub-7', title: '5km outdoor running', completed: false },
        { id: 'sub-8', title: 'Hydration & protein shake', completed: false },
      ],
      estimatedMinutes: 50,
    },
    {
      id: 'task-4',
      title: 'Monthly budget reconciliation & savings',
      description: 'Categorize expenses, review subscription renewals, and allocate 20% to emergency fund.',
      dueDate: yesterdayStr,
      dueTime: '18:00',
      priority: 'high',
      category: 'finance',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      tags: ['Budget', 'Finance'],
      subtasks: [
        { id: 'sub-9', title: 'Download bank CSV statements', completed: true },
        { id: 'sub-10', title: 'Verify credit card transactions', completed: false },
      ],
      estimatedMinutes: 30,
    },
    {
      id: 'task-5',
      title: 'Study Distributed Systems: Paxos & Raft Consensus',
      description: 'Read paper chapters 3-4 and take comprehensive notes on leader election edge cases.',
      dueDate: tomorrowStr,
      dueTime: '11:00',
      priority: 'medium',
      category: 'study',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      tags: ['Architecture', 'CS'],
      subtasks: [
        { id: 'sub-11', title: 'Read raft paper consensus section', completed: false },
        { id: 'sub-12', title: 'Implement raft state machine mock', completed: false },
      ],
      estimatedMinutes: 90,
    },
    {
      id: 'task-6',
      title: 'Setup CI/CD deployment pipeline with Docker',
      description: 'Automate build verification and test runners on pull requests.',
      dueDate: nextWeekStr,
      dueTime: '16:00',
      priority: 'low',
      category: 'work',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
      tags: ['DevOps', 'Docker'],
      subtasks: [],
      estimatedMinutes: 120,
    },
    // Completed history tasks
    {
      id: 'task-7',
      title: 'Design wireframes and user interaction flow',
      description: 'Created low-fidelity Figma wireframes for Dashboard, Calendar, and Analytics views.',
      dueDate: yesterdayStr,
      dueTime: '14:00',
      priority: 'urgent',
      category: 'creative',
      completed: true,
      completedAt: new Date(yesterday.getTime() + 3600000 * 14).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      tags: ['Figma', 'UI/UX'],
      subtasks: [
        { id: 'sub-13', title: 'Information architecture layout', completed: true },
        { id: 'sub-14', title: 'Dark mode glassmorphism palette', completed: true },
      ],
    },
    {
      id: 'task-8',
      title: 'Configure React TypeScript & Tailwind project template',
      description: 'Set up Vite, Lucide icons, PostCSS, and custom animations.',
      dueDate: twoDaysAgoStr,
      dueTime: '12:00',
      priority: 'high',
      category: 'work',
      completed: true,
      completedAt: new Date(twoDaysAgo.getTime() + 3600000 * 11).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      tags: ['Setup', 'TechStack'],
      subtasks: [],
    },
  ];
}
