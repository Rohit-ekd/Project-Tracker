import React from 'react';
import { useStore } from '../store/useStore';
import { getInitials } from '../data/users';

export const CollabAvatarsBar: React.FC = () => {
  const collabUsers = useStore(s => s.collabUsers);
  const activeUsers = collabUsers.filter(u => u.taskId !== null);

  return (
    <div className="flex items-center gap-3 text-sm text-slate-500">
      <div className="flex items-center -space-x-2">
        {activeUsers.slice(0, 4).map(u => (
          <div
            key={u.id}
            title={u.name}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: u.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              border: '2px solid white',
              flexShrink: 0,
            }}
          >
            {getInitials(u.name)}
          </div>
        ))}
      </div>
      <span className="text-xs text-slate-500">
        {activeUsers.length} {activeUsers.length === 1 ? 'person' : 'people'} viewing this board
      </span>
    </div>
  );
};

interface TaskCollabAvatarsProps {
  taskId: string;
}

export const TaskCollabAvatars: React.FC<TaskCollabAvatarsProps> = ({ taskId }) => {
  const collabUsers = useStore(s => s.collabUsers);
  const onTask = collabUsers.filter(u => u.taskId === taskId);

  if (onTask.length === 0) return null;

  const shown = onTask.slice(0, 2);
  const overflow = onTask.length - 2;

  return (
    <div className="flex items-center -space-x-1" style={{ transition: 'all 0.3s ease' }}>
      {shown.map(u => (
        <div
          key={u.id}
          title={u.name}
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: u.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 700,
            border: '1.5px solid white',
            flexShrink: 0,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {getInitials(u.name)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: '#64748b',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 700,
            border: '1.5px solid white',
            flexShrink: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};
