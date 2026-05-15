'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { validatePin, logoutUser } from '@/services/authService';
import { AuthUser } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isChecker: boolean;
  isPlayer: boolean;
  login: (pin: string) => Promise<void>;
  loginWithPin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const savedPin = localStorage.getItem('coregame_auth_pin');
        if (savedPin) {
          const u = await validatePin(savedPin);
          if (u && mounted) {
            setUser(u);
          } else if (mounted) {
            localStorage.removeItem('coregame_auth_pin');
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    initAuth();
    return () => { mounted = false; };
  }, []);

  const loginWithPin = useCallback(async (pin: string) => {
    setError(null);
    try {
      const u = await validatePin(pin);
      if (u) {
        localStorage.setItem('coregame_auth_pin', pin);
        setUser(u);
      } else {
        // MUST throw so UI try/catch correctly triggers feedback (e.g., shake animation)
        throw new Error('Mã PIN không đúng');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    // Hardened logout sequence
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem('coregame_auth_pin');
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isChecker: user?.role === 'checker' || user?.role === 'admin',
    isPlayer: user?.role === 'player',
    login: loginWithPin,
    loginWithPin,
    logout
  }), [user, loading, error, loginWithPin, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// RESTORE BACKWARD COMPATIBILITY EXPORT
// DO NOT REMOVE: Critical for UI_LOCK backward compatibility
export const useAuth = useAuthContext;
