import React from 'react';
import { getInitials } from '../data/users';

interface Props {
  name: string;
  color: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<Props> = ({ name, color, size = 28, className, style }) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        userSelect: 'none',
        border: '2px solid white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        ...style,
      }}
    >
      {getInitials(name)}
    </div>
  );
};
