// src/contexts/AuthContext.tsx
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
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const loginWithPin = useCallback(async (pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await validatePin(pin);
      if (u) {
        setUser(u);
        localStorage.setItem('coregame_auth_pin', pin);
      } else {
        setError('Mã PIN không đúng');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Lỗi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem('coregame_auth_pin');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Lỗi đăng xuất. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      error,
      isAuthenticated: !!user,
      isChecker: user?.role === 'checker' || user?.role === 'admin',
      isPlayer: user?.role === 'player',
      login: loginWithPin,
      loginWithPin,
      logout
    };
  }, [user, loading, error, loginWithPin, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export const useAuth = useAuthContext;
