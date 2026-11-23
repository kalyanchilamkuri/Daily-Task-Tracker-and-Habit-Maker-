# ChronoTask 3D - Next-Gen Daily Tracker & Task Management System

A full-featured, visually stunning task management web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Three.js** featuring interactive 3D UI, calendar integration, history tracking, real-time analytics, and audio feedback.

---

## 🌟 Key Features

### 1. 🎯 Task Management
- **Full CRUD operations**: Create, edit, and delete tasks with instant responsive UI updates.
- **Priority Tiering**: Color-coded badges with glowing neon accents (`Urgent`, `High`, `Medium`, `Low`).
- **Category Categorization**: Tag tasks across `Work`, `Personal`, `Fitness`, `Study`, `Finance`, and `Creative`.
- **Subtasks & Milestones**: Dynamic checklist creation with progress bars; auto-completes parent task when all subtasks are finished.
- **Due Dates & Relative Counters**: Intelligent relative indicators (e.g. `Today at 5:00 PM`, `Tomorrow`, `2d overdue`).

### 2. 🌌 3D UI & Micro-Interactions
- **Three.js WebGL Hologram Scene**:
  - Interactive 3D holographic core (icosahedron + wireframe cage + orbiting satellite nodes + particle starfield).
  - Parallax mouse-tracking tilt effect.
  - **Dynamic Completion Pulse**: Completing tasks triggers an energetic acceleration burst in the 3D core.
  - 3D Toggle button to pause or enable the WebGL scene at any time.
- **Card Hover Physics**: 3D perspective card tilt on hover calculated based on mouse coordinates.
- **Audio Synthesizer (Zero-dependency Web Audio API)**:
  - Completion chimes, creation pops, deletion whooshes, and click feedback.
  - One-click mute/unmute toggle in the navbar.
- **Confetti Bursts**: Particle confetti celebration triggered directly at the card position upon task completion.

### 3. 📅 Interactive Calendar Integration
- **Month Grid View**: Visual workload dots indicating task density and priority colors for every day.
- **Date Agenda Panel**: Click any day on the calendar to view, complete, or add tasks specifically for that selected date.
- **Quick Jump**: "Today" button and Prev/Next month navigation.

### 4. 📜 History Tracking & Gamification
- **Archived Tasks Log**: Grouped by completion date with exact timestamps.
- **Streak Counter**: Active daily productivity streak counter with flame animation.
- **Focus Time Metrics**: Total estimated hours completed and Pomodoro equivalent sprints.
- **Rank Milestones**: Progress through `Pioneer` → `Achiever` → `Master` tiers.
- **Undo / Restore**: Restore completed tasks back to active workflow with a single click.

### 5. 📊 Real-Time Analytics
- **Circular Productivity Gauge**: Visual completion rate percentage and productivity score.
- **Priority Execution Breakdown**: Progress bars analyzing completion velocity across each priority level.
- **Category Allocation**: Distribution grid showing time and task commitment.

### 6. 🔔 Notifications & Backup
- **Notification Center**: Bell icon with unread badge displaying overdue and impending today deadlines.
- **Import & Export**:
  - Export workspace backup as structured **JSON**.
  - Export tasks as **CSV** spreadsheet (compatible with Excel, Google Sheets, Notion).
  - Import JSON backup files with **Merge** or **Replace All** options.
- **User Authentication & Profiles**:
  - Sign in, create account, or 1-click **Guest Mode**.
  - Customizable profile avatar and display settings stored safely in `localStorage`.
- **Keyboard Shortcuts**:
  - `Ctrl + K`: Global search focus.
  - `N`: Quick create new task.
  - `Escape`: Close any open modal.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation & Run

1. Open your terminal in this directory:
   ```bash
   cd daily-tracker
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Build

To build the optimized static assets for deployment:
```bash
npm run build
```
The output files will be located in the `dist/` directory, ready to deploy to **Vercel**, **Netlify**, **GitHub Pages**, or any static host.

---

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom Glassmorphism & 3D CSS
- **3D Graphics**: Three.js (WebGL)
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti & Web Audio API
- **State & Storage**: React Hooks & LocalStorage API
