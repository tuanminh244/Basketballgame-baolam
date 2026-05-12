import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import type { Reward } from '@/types/rewards';

export function useRewards() {
  const [inventory, setInventory] = useState<Record<string, Reward>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const rewardsRef = ref(db, 'store_items');

    const unsubscribe = onValue(
      rewardsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setInventory(snapshot.val());
        } else {
          setInventory({});
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const checkEligibility = useCallback((cost: number, balance: number, stock: number) => {
    return balance >= cost && stock > 0;
  }, []);

  return {
    inventory,
    loading,
    error,
    checkEligibility
  };
}
