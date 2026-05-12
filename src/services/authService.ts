// src/services/authService.ts
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { AuthUser } from '@/types/auth';

export async function validatePin(pin: string): Promise<AuthUser | null> {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const users = snapshot.val();
  for (const [userId, userData] of Object.entries<any>(users)) {
    if (userData.pass_pin === pin) {
      return {
        id: userId,
        role: userData.role,
        pass_pin: userData.pass_pin,
        name: userData.name || '',
        profile: userData.profile || {},
        stats: userData.stats || {
          level: 1,
          current_xp: 0,
          total_points: 0,
          current_streak: 0,
          daily_penalty_accumulated: 0
        }
      } as AuthUser;
    }
  }
  
  return null;
}

export async function logoutUser(): Promise<void> {
  // Clear any server-side cookies or sessions if implemented in the future.
  // For client-side PIN strategy, returning Promise.resolve is the correct implementation.
  return Promise.resolve();
}
