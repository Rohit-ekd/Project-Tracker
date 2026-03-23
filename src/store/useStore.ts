import { create } from 'zustand';
import { Task, Filters, SortConfig, SortField, SortDirection, ViewMode, CollabUser, Status } from '../types';
import { SEED_TASKS } from '../data/seedData';

export const COLLAB_USERS: CollabUser[] = [
  { id: 'collab-1', name: 'Sarah K', color: '#f43f5e', taskId: null },
  { id: 'collab-2', name: 'Tom B', color: '#0ea5e9', taskId: null },
  { id: 'collab-3', name: 'Maya R', color: '#a855f7', taskId: null },
  { id: 'collab-4', name: 'John D', color: '#22c55e', taskId: null },
];

interface StoreState {
  tasks: Task[];
  view: ViewMode;
  filters: Filters;
  sort: SortConfig;
  collabUsers: CollabUser[];
  setView: (view: ViewMode) => void;
  setFilters: (filters: Filters) => void;
  setSort: (field: SortField, direction: SortDirection) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  moveTask: (taskId: string, newStatus: Status) => void;
  setCollabUsers: (users: CollabUser[]) => void;
}

export const defaultFilters: Filters = {
  status: [],
  priority: [],
  assignee: [],
  dueDateFrom: '',
  dueDateTo: '',
};

export const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function applyFilters(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter(task => {
    if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
    if (filters.assignee.length > 0 && !filters.assignee.includes(task.assigneeId)) return false;
    if (filters.dueDateFrom && task.dueDate < filters.dueDateFrom) return false;
    if (filters.dueDateTo && task.dueDate > filters.dueDateTo) return false;
    return true;
  });
}

export function applySort(tasks: Task[], sort: SortConfig): Task[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sort.field === 'title') {
      cmp = a.title.localeCompare(b.title);
    } else if (sort.field === 'priority') {
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    } else if (sort.field === 'dueDate') {
      cmp = a.dueDate.localeCompare(b.dueDate);
    }
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

export const useStore = create<StoreState>((set) => ({
  tasks: SEED_TASKS,
  view: 'kanban',
  filters: defaultFilters,
  sort: { field: 'dueDate', direction: 'asc' },
  collabUsers: COLLAB_USERS.map((u, i) => ({
    ...u,
    taskId: SEED_TASKS[i * 3]?.id ?? null,
  })),

  setView: (view) => set({ view }),

  setFilters: (filters) => set({ filters }),

  setSort: (field, direction) => set({ sort: { field, direction } }),

  updateTaskStatus: (taskId, status) =>
    set(state => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t),
    })),

  moveTask: (taskId, newStatus) =>
    set(state => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
    })),

  setCollabUsers: (users) => set({ collabUsers: users }),
}));
