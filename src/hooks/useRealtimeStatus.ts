// src/hooks/useRealtimeStatus.ts
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';

export interface RealtimeStatus {
  isOnline: boolean;
  isConnected: boolean;
  syncing: boolean;
  lastSyncTime: number | null;
}

export function useRealtimeStatus(): RealtimeStatus {
  const [status, setStatus] = useState<RealtimeStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnected: false,
    syncing: false,
    lastSyncTime: null,
  });

  useEffect(() => {
    const handleOnline = () => setStatus(s => ({ ...s, isOnline: true }));
    const handleOffline = () => setStatus(s => ({ ...s, isOnline: false }));

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      setStatus(s => ({
        ...s,
        isConnected: connected,
        syncing: false,
        lastSyncTime: connected ? Date.now() : s.lastSyncTime
      }));
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      unsubscribe();
    };
  }, []);

  return status;
}
