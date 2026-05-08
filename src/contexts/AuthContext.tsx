"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { auth } from '@/services/firebase/config';
import { signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithPin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = localStorage.getItem('game_user_meta');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          signOut(auth).then(() => setUser(null));
        }
      } else {
        setUser(null);
        localStorage.removeItem('game_user_meta');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithPin = async (pin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');

      await signInWithCustomToken(auth, data.token);
      
      setUser(data.user);
      localStorage.setItem('game_user_meta', JSON.stringify(data.user));
      setLoading(false);
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('game_user_meta');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
