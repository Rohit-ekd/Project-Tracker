import React from 'react';
import { Priority } from '../types';
import { PRIORITY_CONFIG } from '../utils/priorityUtils';

interface Props {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<Props> = ({ priority, size = 'sm' }) => {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: size === 'sm' ? '10px' : '12px',
        padding: size === 'sm' ? '1px 6px' : '2px 8px',
        borderRadius: '999px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        display: 'inline-block',
        lineHeight: 1.5,
      }}
    >
      {cfg.label}
    </span>
  );
};
