import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useCollabSimulation() {
  const tasks = useStore(s => s.tasks);
  const collabUsers = useStore(s => s.collabUsers);
  const setCollabUsers = useStore(s => s.setCollabUsers);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const taskIdsRef = useRef<string[]>([]);

  useEffect(() => {
    taskIdsRef.current = tasks.slice(0, 50).map(t => t.id);
  }, [tasks]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const taskIds = taskIdsRef.current;
      if (taskIds.length === 0) return;

      setCollabUsers(
        collabUsers.map(user => {
          if (Math.random() < 0.3) {
            const newTaskId = taskIds[Math.floor(Math.random() * taskIds.length)];
            return { ...user, taskId: newTaskId };
          }
          return user;
        })
      );
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [collabUsers, setCollabUsers]);
}
