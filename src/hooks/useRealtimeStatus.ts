import { useState, useEffect } from 'react';
import { onValue } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';

export interface RealtimeStatus {
  readonly isOnline: boolean;
  readonly syncing: boolean;
}

export function useRealtimeStatus(): RealtimeStatus {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    const connectedRef = refs.connected();
    
    const unsubscribe = onValue(connectedRef, (snap) => {
      setIsOnline(snap.val() === true);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, syncing: false };
}
