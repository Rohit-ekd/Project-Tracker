import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Task, Status } from '../types';
import { useStore } from '../store/useStore';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import { PriorityBadge } from '../components/PriorityBadge';
import { Avatar } from '../components/Avatar';
import { TaskCollabAvatars } from '../components/CollabAvatars';
import { getUserById } from '../data/users';
import { formatDueDate } from '../utils/dateUtils';

const COLUMNS: { status: Status; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'in-review', label: 'In Review' },
  { status: 'done', label: 'Done' },
];

interface DragState {
  taskId: string;
  fromStatus: Status;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  clone: HTMLElement | null;
  placeholder: HTMLElement | null;
  placeholderParent: HTMLElement | null;
  currentTarget: Status | null;
}

const TaskCard: React.FC<{
  task: Task;
  onDragStart: (e: React.PointerEvent, task: Task, cardEl: HTMLElement) => void;
  isDragging: boolean;
}> = ({ task, onDragStart, isDragging }) => {
  const user = getUserById(task.assigneeId);
  const { label, isOverdue, isDueToday } = formatDueDate(task.dueDate);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      data-task-id={task.id}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '12px',
        cursor: 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0 : 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s',
      }}
      onPointerDown={e => {
        if (cardRef.current) {
          onDragStart(e, task, cardRef.current);
        }
      }}
      className="hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-800 leading-snug flex-1">{task.title}</p>
        <TaskCollabAvatars taskId={task.id} />
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center gap-1.5">
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: isOverdue ? '#dc2626' : isDueToday ? '#f97316' : '#64748b',
              background: isOverdue ? '#fef2f2' : isDueToday ? '#fff7ed' : 'transparent',
              padding: isOverdue || isDueToday ? '1px 5px' : '0',
              borderRadius: 4,
            }}
          >
            {label}
          </span>
          {user && (
            <Avatar name={user.name} color={user.color} size={22} />
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyColumn: React.FC<{ status: Status }> = ({ status }) => {
  const labels: Record<Status, string> = {
    todo: 'No tasks to do',
    'in-progress': 'Nothing in progress',
    'in-review': 'Nothing to review',
    done: 'No completed tasks',
  };
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-60">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="18" rx="3" stroke="#94a3b8" strokeWidth="1.5"/>
        <path d="M10 8V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" stroke="#94a3b8" strokeWidth="1.5"/>
      </svg>
      <p className="text-sm text-slate-400 font-medium">{labels[status]}</p>
      <p className="text-xs text-slate-300">Drop tasks here</p>
    </div>
  );
};

export const KanbanView: React.FC = () => {
  const tasks = useFilteredTasks();
  const moveTask = useStore(s => s.moveTask);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<Status | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const columnsRef = useRef<Partial<Record<Status, HTMLDivElement>>>({});

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.status] = tasks.filter(t => t.status === col.status);
    return acc;
  }, {} as Record<Status, Task[]>);

  const getColumnAtPoint = useCallback((x: number, y: number): Status | null => {
    for (const [status, el] of Object.entries(columnsRef.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return status as Status;
      }
    }
    return null;
  }, []);

  const onDragStart = useCallback((e: React.PointerEvent, task: Task, cardEl: HTMLElement) => {
    e.preventDefault();
    const rect = cardEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const clone = cardEl.cloneNode(true) as HTMLElement;
    clone.style.cssText = `
      position: fixed;
      width: ${rect.width}px;
      left: ${rect.left}px;
      top: ${rect.top}px;
      opacity: 0.85;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 12px 32px rgba(0,0,0,0.2);
      transform: rotate(1.5deg);
      transition: transform 0.1s;
      border-radius: 10px;
    `;
    document.body.appendChild(clone);

    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      height: ${rect.height}px;
      background: #e0e7ff;
      border: 2px dashed #818cf8;
      border-radius: 10px;
      pointer-events: none;
      transition: all 0.2s;
    `;
    cardEl.parentElement?.insertBefore(placeholder, cardEl);

    dragStateRef.current = {
      taskId: task.id,
      fromStatus: task.status,
      startX: e.clientX,
      startY: e.clientY,
      offsetX,
      offsetY,
      clone,
      placeholder,
      placeholderParent: cardEl.parentElement as HTMLElement,
      currentTarget: null,
    };

    setDraggingId(task.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const ds = dragStateRef.current;
      if (!ds || !ds.clone) return;
      ds.clone.style.left = `${e.clientX - ds.offsetX}px`;
      ds.clone.style.top = `${e.clientY - ds.offsetY}px`;

      const col = getColumnAtPoint(e.clientX, e.clientY);
      setOverColumn(col);
      ds.currentTarget = col;

      if (col && columnsRef.current[col]) {
        const colEl = columnsRef.current[col]!;
        const colRect = colEl.getBoundingClientRect();
        const relativeY = e.clientY - colRect.top;
        const cards = Array.from(colEl.querySelectorAll('[data-task-id]')) as HTMLElement[];
        let insertBefore: HTMLElement | null = null;
        for (const card of cards) {
          const cr = card.getBoundingClientRect();
          const midY = cr.top - colRect.top + cr.height / 2;
          if (relativeY < midY) {
            insertBefore = card;
            break;
          }
        }
        if (insertBefore) {
          colEl.insertBefore(ds.placeholder!, insertBefore);
        } else {
          colEl.appendChild(ds.placeholder!);
        }
      }
    };

    const onUp = (_e: PointerEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;

      if (ds.clone) {
        document.body.removeChild(ds.clone);
      }
      if (ds.placeholder && ds.placeholder.parentNode) {
        ds.placeholder.parentNode.removeChild(ds.placeholder);
      }

      if (ds.currentTarget && ds.currentTarget !== ds.fromStatus) {
        moveTask(ds.taskId, ds.currentTarget);
      } else if (!ds.currentTarget) {
        // snap back animation
        if (ds.clone) {
          ds.clone.style.transition = 'all 0.3s ease';
        }
      }

      dragStateRef.current = null;
      setDraggingId(null);
      setOverColumn(null);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [getColumnAtPoint, moveTask]);

  return (
    <div className="flex gap-4 h-full min-w-0" style={{ minWidth: 0, flex: 1 }}>
      {COLUMNS.map(col => {
        const colTasks = tasksByStatus[col.status];
        const isOver = overColumn === col.status;
        return (
          <div
            key={col.status}
            style={{
              flex: 1,
              minWidth: 240,
              display: 'flex',
              flexDirection: 'column',
              background: isOver ? '#f0f4ff' : '#f8fafc',
              border: `1px solid ${isOver ? '#818cf8' : '#e2e8f0'}`,
              borderRadius: 12,
              transition: 'background 0.15s, border-color 0.15s',
              overflow: 'hidden',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <span className="text-sm font-semibold text-slate-700">{col.label}</span>
              <span
                style={{
                  background: '#e2e8f0',
                  color: '#64748b',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: 999,
                }}
              >
                {colTasks.length}
              </span>
            </div>
            <div
              ref={el => { if (el) columnsRef.current[col.status] = el; }}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 0,
              }}
            >
              {colTasks.length === 0 && draggingId === null && (
                <EmptyColumn status={col.status} />
              )}
              {colTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={onDragStart}
                  isDragging={draggingId === task.id}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
