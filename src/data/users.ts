import { User } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alice Chen', color: '#6366f1' },
  { id: 'u2', name: 'Bob Martinez', color: '#f59e0b' },
  { id: 'u3', name: 'Carol Smith', color: '#10b981' },
  { id: 'u4', name: 'David Lee', color: '#ef4444' },
  { id: 'u5', name: 'Eva Wilson', color: '#8b5cf6' },
  { id: 'u6', name: 'Frank Zhou', color: '#06b6d4' },
];

export function getUserById(id: string): User | undefined {
  return USERS.find(u => u.id === id);
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}
