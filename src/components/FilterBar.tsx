import React, { useState, useRef, useEffect } from 'react';
import { Filters, Status, Priority } from '../types';
import { useStore } from '../store/useStore';
import { USERS } from '../data/users';
import { hasActiveFilters } from '../hooks/useUrlFilters';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'in-review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

interface MultiSelectProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        style={{ whiteSpace: 'nowrap' }}
      >
        {label}
        {selected.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
            {selected.length}
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
            minWidth: 160,
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid',
                  borderColor: selected.includes(opt.value) ? '#6366f1' : '#cbd5e1',
                  borderRadius: 3,
                  background: selected.includes(opt.value) ? '#6366f1' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {selected.includes(opt.value) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2.5 2.5L7 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FilterBar: React.FC = () => {
  const filters = useStore(s => s.filters);
  const setFilters = useStore(s => s.setFilters);
  const active = hasActiveFilters(filters);

  const update = (partial: Partial<Filters>) => {
    setFilters({ ...filters, ...partial });
  };

  const assigneeOptions = USERS.map(u => ({ value: u.id, label: u.name }));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <MultiSelect
        label="Status"
        options={STATUS_OPTIONS}
        selected={filters.status}
        onChange={status => update({ status: status as Status[] })}
      />
      <MultiSelect
        label="Priority"
        options={PRIORITY_OPTIONS}
        selected={filters.priority}
        onChange={priority => update({ priority: priority as Priority[] })}
      />
      <MultiSelect
        label="Assignee"
        options={assigneeOptions}
        selected={filters.assignee}
        onChange={assignee => update({ assignee })}
      />
      <div className="flex items-center gap-1">
        <label className="text-xs text-slate-500 whitespace-nowrap">From:</label>
        <input
          type="date"
          value={filters.dueDateFrom}
          onChange={e => update({ dueDateFrom: e.target.value })}
          className="px-2 py-1.5 rounded-md border border-slate-200 text-sm text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <div className="flex items-center gap-1">
        <label className="text-xs text-slate-500 whitespace-nowrap">To:</label>
        <input
          type="date"
          value={filters.dueDateTo}
          onChange={e => update({ dueDateTo: e.target.value })}
          className="px-2 py-1.5 rounded-md border border-slate-200 text-sm text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      {active && (
        <button
          onClick={() => setFilters({ status: [], priority: [], assignee: [], dueDateFrom: '', dueDateTo: '' })}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Clear filters
        </button>
      )}
    </div>
  );
};
