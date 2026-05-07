import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/services/firebase/config';
import { SystemConfig } from '@/types/schema';
import { SYSTEM_CONFIG_PATH } from '@/utils/systemPaths';

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const configRef = ref(db, SYSTEM_CONFIG_PATH);
    const unsubscribe = onValue(
      configRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError(new Error('SYSTEM_CONFIG_MISSING'));
          setConfig(null);
        } else {
          setConfig(snapshot.val());
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { config, loading, error };
};
