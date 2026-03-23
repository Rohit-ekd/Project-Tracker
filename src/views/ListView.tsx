import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Task, Status, SortField, SortDirection } from '../types';
import { useStore } from '../store/useStore';
import { useSortedFilteredTasks } from '../hooks/useFilteredTasks';
import { PriorityBadge } from '../components/PriorityBadge';
import { TaskCollabAvatars } from '../components/CollabAvatars';
import { getUserById } from '../data/users';
import { formatDueDate } from '../utils/dateUtils';
import { hasActiveFilters } from '../hooks/useUrlFilters';

const ROW_HEIGHT = 52;
const BUFFER = 5;

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'in-review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const StatusDropdown: React.FC<{ task: Task }> = ({ task }) => {
  const [open, setOpen] = useState(false);
  const updateTaskStatus = useStore(s => s.updateTaskStatus);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const STATUS_STYLE: Record<Status, { bg: string; color: string; label: string }> = {
    todo: { bg: '#f1f5f9', color: '#64748b', label: 'To Do' },
    'in-progress': { bg: '#dbeafe', color: '#1d4ed8', label: 'In Progress' },
    'in-review': { bg: '#fef9c3', color: '#854d0e', label: 'In Review' },
    done: { bg: '#dcfce7', color: '#166534', label: 'Done' },
  };

  const s = STATUS_STYLE[task.status];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{
          background: s.bg,
          color: s.color,
          border: 'none',
          borderRadius: 6,
          padding: '2px 8px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap',
        }}
      >
        {s.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.6 }}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 140,
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {STATUS_OPTIONS.map(opt => {
            const os = STATUS_STYLE[opt.value];
            return (
              <button
                key={opt.value}
                onClick={e => {
                  e.stopPropagation();
                  updateTaskStatus(task.id, opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 12px',
                  background: task.status === opt.value ? '#f8fafc' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                  color: '#374151',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = task.status === opt.value ? '#f8fafc' : 'transparent')}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: os.color, flexShrink: 0 }} />
                {opt.label}
                {task.status === opt.value && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 'auto' }}>
                    <path d="M2 6l3 3 5-5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SortIcon: React.FC<{ field: SortField; activeField: SortField; direction: SortDirection }> = ({ field, activeField, direction }) => {
  const isActive = field === activeField;
  return (
    <span style={{ marginLeft: 4, opacity: isActive ? 1 : 0.3 }}>
      {isActive && direction === 'desc' ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 10V2M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
  );
};

export const ListView: React.FC = () => {
  const tasks = useSortedFilteredTasks();
  const sort = useStore(s => s.sort);
  const setSort = useStore(s => s.setSort);
  const filters = useStore(s => s.filters);
  const setFilters = useStore(s => s.setFilters);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    setContainerHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const toggleSort = (field: SortField) => {
    if (sort.field === field) {
      setSort(field, sort.direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field, 'asc');
    }
  };

  const totalHeight = tasks.length * ROW_HEIGHT;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER * 2;
  const endIdx = Math.min(tasks.length, startIdx + visibleCount);
  const visibleTasks = tasks.slice(startIdx, endIdx);
  const offsetY = startIdx * ROW_HEIGHT;

  const noResults = tasks.length === 0;
  const active = hasActiveFilters(filters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 110px 100px 140px 120px',
          padding: '0 16px',
          height: 40,
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          borderRadius: '10px 10px 0 0',
          border: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => toggleSort('title')}
          className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700 text-left"
        >
          Title
          <SortIcon field="title" activeField={sort.field} direction={sort.direction} />
        </button>
        <button
          onClick={() => toggleSort('priority')}
          className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700"
        >
          Priority
          <SortIcon field="priority" activeField={sort.field} direction={sort.direction} />
        </button>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
        <button
          onClick={() => toggleSort('dueDate')}
          className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700"
        >
          Due Date
          <SortIcon field="dueDate" activeField={sort.field} direction={sort.direction} />
        </button>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assignee</div>
      </div>

      {noResults ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#f1f5f9"/>
            <path d="M16 24h16M20 18h8M20 30h8" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-slate-500 font-medium">No tasks match your filters</p>
          {active && (
            <button
              onClick={() => setFilters({ status: [], priority: [], assignee: [], dueDateFrom: '', dueDateTo: '' })}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            background: '#fff',
          }}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleTasks.map((task, i) => {
                const absIdx = startIdx + i;
                const user = getUserById(task.assigneeId);
                const { label, isOverdue, isDueToday } = formatDueDate(task.dueDate);
                return (
                  <div
                    key={task.id}
                    style={{
                      height: ROW_HEIGHT,
                      display: 'grid',
                      gridTemplateColumns: '1fr 110px 100px 140px 120px',
                      alignItems: 'center',
                      padding: '0 16px',
                      borderBottom: '1px solid #f1f5f9',
                      background: absIdx % 2 === 0 ? '#fff' : '#fafafa',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = absIdx % 2 === 0 ? '#fff' : '#fafafa')}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-slate-700 truncate">{task.title}</span>
                      <TaskCollabAvatars taskId={task.id} />
                    </div>
                    <div>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div>
                      <StatusDropdown task={task} />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: isOverdue ? '#dc2626' : isDueToday ? '#f97316' : '#64748b',
                          background: isOverdue ? '#fef2f2' : isDueToday ? '#fff7ed' : 'transparent',
                          padding: isOverdue || isDueToday ? '2px 6px' : '0',
                          borderRadius: 4,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {user && (
                        <>
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: user.color,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs text-slate-500 truncate">{user.name.split(' ')[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="text-xs text-slate-400 mt-1 text-right pr-1">
        {tasks.length} tasks {tasks.length !== 500 && `(filtered from 500)`}
        {' · '}Virtual scroll: {visibleTasks.length} rows rendered
      </div>
    </div>
  );
};
