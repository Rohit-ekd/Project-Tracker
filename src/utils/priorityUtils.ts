import { Priority } from '../types';

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  critical: {
    label: 'Critical',
    color: '#fff',
    bg: '#dc2626',
    border: '#b91c1c',
  },
  high: {
    label: 'High',
    color: '#fff',
    bg: '#f97316',
    border: '#ea580c',
  },
  medium: {
    label: 'Medium',
    color: '#1e293b',
    bg: '#fbbf24',
    border: '#f59e0b',
  },
  low: {
    label: 'Low',
    color: '#1e293b',
    bg: '#86efac',
    border: '#4ade80',
  },
};

export const PRIORITY_GANTT_COLOR: Record<Priority, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#fbbf24',
  low: '#4ade80',
};
