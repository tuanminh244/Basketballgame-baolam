'use client';
import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '@/types/schema';

// [SESSION MAPPING ARCHITECTURE]
// `childrenUids` KHÔNG thuộc RTDB users schema và TUYỆT ĐỐI KHÔNG được write vào Firebase.
// Đây là SESSION FIELD ONLY.
// Khi implement PIN Auth thật:
// 1. Verify PIN
// 2. Bootstrap session
// 3. Inject children mapping vào session/auth context.
interface AuthContextType {
  user: User | null;
  loginAs: (role: UserRole, uid: string, name: string, childrenUids?: string[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({ 
    uid: 'blam_01', 
    role: 'player', 
    name: 'Bảo Lâm' 
  });

  const loginAs = (role: UserRole, uid: string, name: string, childrenUids?: string[]) => 
    setUser({ uid, role, name, childrenUids });
  
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
