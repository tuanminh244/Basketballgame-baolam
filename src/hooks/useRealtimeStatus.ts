import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';

export function useRealtimeStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');

    const unsubscribe = onValue(
      connectedRef,
      (snapshot) => {
        const status = snapshot.val() === true;
        setIsConnected(status);
        setIsOnline(status);
        
        if (status) {
          setLastSyncTime(Date.now());
          setSyncing(false);
        } else {
          setSyncing(true);
        }
      },
      (err) => {
        console.error('Realtime connection error:', err);
        setIsConnected(false);
        setIsOnline(false);
        setSyncing(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isOnline,
    isConnected,
    syncing,
    lastSyncTime
  };
}
