'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase/config';

export interface User {
  id: string;
  role: string;
  name?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithPin: (pin: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Session Restore Logic (Preserved)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('game_user_meta');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        
        // Normalize the restored object
        const normalizedUser: User = {
          ...parsed,
          id: parsed.id || parsed.uid
        };

        // Corrupted session guard
        if (normalizedUser.id) {
          setUser(normalizedUser);
        } else {
          console.warn('Session data is missing user id. Clearing corrupted session.');
          setUser(null);
          localStorage.removeItem('game_user_meta');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Lỗi khi khôi phục phiên đăng nhập:', error);
      setUser(null);
      localStorage.removeItem('game_user_meta');
    } finally {
      setLoading(false);
    }
  }, []);

  // Direct RTDB PIN Auth Flow (No API transport layer)
  const loginWithPin = async (pin: string) => {
    try {
      // 1. Read users/ from RTDB using Firebase Client SDK
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (!snapshot.exists()) {
        throw new Error('Hệ thống chưa có dữ liệu người dùng');
      }

      const usersData = snapshot.val();
      let matchedSessionUser: User | null = null;

      // 2. Iterate users & Compare PIN (Client-side plaintext compare)
      for (const [userId, userData] of Object.entries<any>(usersData)) {
        if (userData.pass_pin === pin) {
          // 4. If matched: create normalized session user
          matchedSessionUser = {
            id: userId,
            role: userData.role,
            name: userData.name,
          };
          break; // Stop iterating once matched
        }
      }

      // 5. Invalid PIN or Valid PIN flow
      if (matchedSessionUser) {
        localStorage.setItem('game_user_meta', JSON.stringify(matchedSessionUser));
        setUser(matchedSessionUser);
      } else {
        throw new Error('Mã PIN không đúng');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout Flow (Preserved)
  const logout = () => {
    localStorage.removeItem('game_user_meta');
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
