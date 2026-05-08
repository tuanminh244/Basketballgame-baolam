'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, child } from 'firebase/database';
import { database } from '@/services/firebase/config';

type Role = 'player' | 'checker' | 'admin';

interface User {
  id: string;
  role: Role;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (uid: string, pass_pin: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('family_app_session');
    if (stored) {
      try { setUser(JSON.parse(stored)); } 
      catch { localStorage.removeItem('family_app_session'); }
    }
    setIsLoading(false);
  }, []);

  const login = async (uid: string, pass_pin: string) => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `users/${uid}`));
    
    if (snapshot.exists() && snapshot.val().pass_pin === pass_pin) {
      const userData = snapshot.val();
      const loggedInUser: User = { id: uid, role: userData.role as Role, name: userData.name || uid };
      setUser(loggedInUser);
      localStorage.setItem('family_app_session', JSON.stringify(loggedInUser));
      
      if (loggedInUser.role === 'player') router.push('/child-home');
      else router.push('/dashboard');
    } else {
      throw new Error('Sai ID hoặc mã PIN');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('family_app_session');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
