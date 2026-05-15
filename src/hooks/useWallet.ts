import { useState, useEffect, useCallback } from 'react';
import { onValue } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';
import { processPurchaseTransaction } from '@/services/transactionService';
import type { Transaction } from '@/types/economy';

export function useWallet(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Record<string, Transaction>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const txRef = refs.userTransactions(userId);

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

    return () => unsubscribe();
  }, [userId]);

  const spendPoints = useCallback(async (itemId: string, cost: number, currentBalance: number) => {
    if (!userId) throw new Error('User not found');
    try {
      setError(null);
      await processPurchaseTransaction(userId, itemId, cost, currentBalance);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Transaction failed'));
      throw err;
    }
  }, [userId]);

  return { transactions, loading, error, spendPoints };
}
