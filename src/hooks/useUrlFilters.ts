import { useEffect, useCallback } from 'react';
import { Filters, Status, Priority, ViewMode } from '../types';

function parseArray<T extends string>(param: string | null): T[] {
  if (!param) return [];
  return param.split(',').filter(Boolean) as T[];
}

export function parseFiltersFromUrl(): { filters: Filters; view: ViewMode } {
  const params = new URLSearchParams(window.location.search);
  const filters: Filters = {
    status: parseArray<Status>(params.get('status')),
    priority: parseArray<Priority>(params.get('priority')),
    assignee: parseArray<string>(params.get('assignee')),
    dueDateFrom: params.get('dueDateFrom') ?? '',
    dueDateTo: params.get('dueDateTo') ?? '',
  };
  const view = (params.get('view') as ViewMode) ?? 'kanban';
  return { filters, view };
}

export function filtersToUrl(filters: Filters, view: ViewMode): string {
  const params = new URLSearchParams();
  if (view !== 'kanban') params.set('view', view);
  if (filters.status.length > 0) params.set('status', filters.status.join(','));
  if (filters.priority.length > 0) params.set('priority', filters.priority.join(','));
  if (filters.assignee.length > 0) params.set('assignee', filters.assignee.join(','));
  if (filters.dueDateFrom) params.set('dueDateFrom', filters.dueDateFrom);
  if (filters.dueDateTo) params.set('dueDateTo', filters.dueDateTo);
  const str = params.toString();
  return str ? `?${str}` : window.location.pathname;
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee.length > 0 ||
    !!filters.dueDateFrom ||
    !!filters.dueDateTo
  );
}

export function useSyncUrlFilters(
  filters: Filters,
  view: ViewMode,
  onInit: (filters: Filters, view: ViewMode) => void
) {
  useEffect(() => {
    const { filters: initialFilters, view: initialView } = parseFiltersFromUrl();
    onInit(initialFilters, initialView);
  }, []);

  useEffect(() => {
    const url = filtersToUrl(filters, view);
    window.history.replaceState(null, '', url);
  }, [filters, view]);

  const handlePopState = useCallback(() => {
    const { filters: f, view: v } = parseFiltersFromUrl();
    onInit(f, v);
  }, [onInit]);

  useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handlePopState]);
}
