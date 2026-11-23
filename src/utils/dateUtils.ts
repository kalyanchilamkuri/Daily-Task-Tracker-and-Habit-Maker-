export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getRelativeDateLabel(dateStr: string, timeStr?: string): { label: string; isOverdue: boolean; isToday: boolean } {
  if (!dateStr) return { label: '', isOverdue: false, isToday: false };
  const todayStr = getTodayStr();

  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const today = new Date(tY, tM - 1, tD);

  const [dY, dM, dD] = dateStr.split('-').map(Number);
  const target = new Date(dY, dM - 1, dD);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const timeSuffix = timeStr ? ` at ${timeStr}` : '';

  if (diffDays === 0) {
    // Check if time is in past today
    let isPastTime = false;
    if (timeStr) {
      const now = new Date();
      const [h, m] = timeStr.split(':').map(Number);
      if (now.getHours() > h || (now.getHours() === h && now.getMinutes() > m)) {
        isPastTime = true;
      }
    }
    return {
      label: `Today${timeSuffix}`,
      isOverdue: isPastTime,
      isToday: true,
    };
  } else if (diffDays === 1) {
    return {
      label: `Tomorrow${timeSuffix}`,
      isOverdue: false,
      isToday: false,
    };
  } else if (diffDays === -1) {
    return {
      label: `Yesterday${timeSuffix}`,
      isOverdue: true,
      isToday: false,
    };
  } else if (diffDays < -1) {
    return {
      label: `${Math.abs(diffDays)}d overdue`,
      isOverdue: true,
      isToday: false,
    };
  } else {
    return {
      label: `In ${diffDays} days${timeSuffix}`,
      isOverdue: false,
      isToday: false,
    };
  }
}

// Generates month days grid for calendar (including padding days from previous and next months)
export interface CalendarCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthDaysGrid(year: number, monthZeroIndexed: number): CalendarCell[] {
  const firstDayOfMonth = new Date(year, monthZeroIndexed, 1);
  const lastDayOfMonth = new Date(year, monthZeroIndexed + 1, 0);

  // Sunday = 0
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonthLastDay = new Date(year, monthZeroIndexed, 0).getDate();
  const todayStr = getTodayStr();

  const cells: CalendarCell[] = [];

  // Previous month padding
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevDate = new Date(year, monthZeroIndexed - 1, day);
    const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding to fill out 35 or 42 cells (multiple of 7)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const nextDate = new Date(year, monthZeroIndexed + 1, day);
    const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
