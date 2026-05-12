import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { processPurchaseTransaction } from '@/services/transactionService';
import type { Transaction } from '@/types/economy';

export function useWallet(userId: string) {
  const [transactions, setTransactions] = useState<Record<string, Transaction>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const txRef = ref(db, `transactions/${userId}`);

    const unsubscribe = onValue(
      txRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setTransactions(snapshot.val());
        } else {
          setTransactions({});
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
  }, [userId]);

  const spendPoints = useCallback(async (itemId: string, cost: number, currentBalance: number) => {
    try {
      setError(null);
      await processPurchaseTransaction(userId, itemId, cost, currentBalance);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Transaction failed'));
      throw err;
    }
  }, [userId]);

  return {
    transactions,
    loading,
    error,
    spendPoints
  };
}
