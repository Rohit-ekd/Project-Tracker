export function formatDueDate(dueDate: string): { label: string; isOverdue: boolean; isDueToday: boolean; daysOverdue: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'Due Today', isOverdue: false, isDueToday: true, daysOverdue: 0 };
  } else if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    if (daysOverdue > 7) {
      return { label: `${daysOverdue}d overdue`, isOverdue: true, isDueToday: false, daysOverdue };
    } else {
      return { label: formatShortDate(dueDate), isOverdue: true, isDueToday: false, daysOverdue };
    }
  } else {
    return { label: formatShortDate(dueDate), isOverdue: false, isDueToday: false, daysOverdue: 0 };
  }
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getTodayStr(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthDateRange(): { start: Date; end: Date; year: number; month: number } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end, year, month };
}

export function dateToPosition(dateStr: string, start: Date, totalDays: number): number {
  const date = new Date(dateStr);
  const daysDiff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(1, daysDiff / totalDays));
}
