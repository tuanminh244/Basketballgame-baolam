import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../services/firebase/firebaseConfig';
import { TaskWrapper, Task } from '../types/dashboard';

export const usePendingTasks = (yyyy_mm: string, date: string, childUids: string[]) => {
  const [tasks, setTasks] = useState<TaskWrapper[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isMounted = useRef(true);
  const tasksBuffer = useRef<Record<string, TaskWrapper[]>>({});

  useEffect(() => {
    isMounted.current = true;
    const unsubscribes: (() => void)[] = [];

    childUids.forEach((childUid) => {
      const tasksRef = ref(database, `daily_logs_${yyyy_mm}/${date}/${childUid}/tasks`);

      const unsubscribe = onValue(tasksRef, (snapshot) => {
        const data = snapshot.val();
        const childTasks: TaskWrapper[] = [];

        if (data) {
          Object.keys(data).forEach((taskId) => {
            const task = data[taskId] as Task;
            if (task.status === 'submitted') {
              childTasks.push({ childUid, task: { ...task, id: taskId } });
            }
          });
        }

        tasksBuffer.current[childUid] = childTasks;

        if (isMounted.current) {
          const mergedTasks = Object.values(tasksBuffer.current).flat();
          mergedTasks.sort((a, b) => (a.task.submitted_at || 0) - (b.task.submitted_at || 0));
          
          setTasks(mergedTasks);
          setLoading(false);
        }
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      isMounted.current = false;
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [yyyy_mm, date, childUids.join(',')]);

  return { tasks, loading };
};
