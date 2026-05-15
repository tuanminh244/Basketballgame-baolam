// src/contexts/SessionContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRewards } from '@/hooks/useRewards';
import { useUserStats } from '@/hooks/useUserStats';
import { useApprovalQueue } from '@/hooks/useApprovalQueue';
import { useRealtimeStatus, RealtimeStatus } from '@/hooks/useRealtimeStatus';
import { WalletState } from '@/types/economy';
import { RewardState } from '@/types/rewards';
import { UserStats } from '@/types/auth';
import { ApprovalQueueItem } from '@/types/tasks';

interface SessionContextValue {
  wallet: WalletState | null;
  rewards: RewardState | null;
  stats: UserStats | null;
  queue: ApprovalQueueItem[];
  realtime: RealtimeStatus;
  loading: boolean;
  hydrated: boolean;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const userId = user?.id;

  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const { rewards, loading: rewardsLoading } = useRewards(userId);
  const { stats, loading: statsLoading } = useUserStats(userId);
  const { queue, loading: queueLoading, refreshQueue } = useApprovalQueue();
  const realtime = useRealtimeStatus();

  const wallet = useMemo<WalletState | null>(() => {
    if (!stats) return null;
    return {
      total_points: stats.total_points || 0,
      current_xp: stats.current_xp || 0
    } as WalletState;
  }, [stats]);

  const loading = rewardsLoading || statsLoading || queueLoading;

  const refreshSession = useCallback(async () => {
    if (refreshQueue) {
      try {
        await refreshQueue();
      } catch (err) {
        console.error('Session refresh error:', err);
      }
    }
  }, [refreshQueue]);

  const value = useMemo<SessionContextValue>(() => ({
    wallet,
    rewards,
    stats,
    queue,
    realtime,
    loading,
    hydrated,
    refreshSession
  }), [wallet, rewards, stats, queue, realtime, loading, hydrated, refreshSession]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}
