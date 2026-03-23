import { useMemo } from 'react';
import { useStore, applyFilters, applySort } from '../store/useStore';

export function useFilteredTasks() {
  const tasks = useStore(s => s.tasks);
  const filters = useStore(s => s.filters);
  return useMemo(() => applyFilters(tasks, filters), [tasks, filters]);
}

export function useSortedFilteredTasks() {
  const tasks = useStore(s => s.tasks);
  const filters = useStore(s => s.filters);
  const sort = useStore(s => s.sort);
  return useMemo(() => applySort(applyFilters(tasks, filters), sort), [tasks, filters, sort]);
}
