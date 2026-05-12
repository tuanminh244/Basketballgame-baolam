/**
 * Hook wrapper around AuthContext.
 *
 * Components MUST import this hook instead of importing
 * useAuth directly from AuthContext.
 *
 * This hook centralizes:
 * - auth state
 * - loading state
 * - auth helpers
 * - role helpers
 */
import { useState, useCallback } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { validatePin, logoutUser } from '@/services/authService';
import type { User } from '@/types/auth';

export function useAuth() {
  const context = useAuthContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const login = useCallback(async (pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await validatePin(pin);
      if (user) {
        if (context.login) {
          context.login(user);
        }
      } else {
        throw new Error('Invalid PIN');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Authentication failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [context]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      if (context.logout) {
        context.logout();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [context]);

  const user = context.user as User | null;
  const isAuthenticated = !!user;
  const isChecker = user?.role === 'checker' || user?.role === 'admin';
  const isPlayer = user?.role === 'player';

  return {
    user,
    loading: loading || context.loading,
    error,
    login,
    logout,
    isAuthenticated,
    isChecker,
    isPlayer
  };
}
