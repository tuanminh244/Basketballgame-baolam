import { get } from 'firebase/database';
import { refs } from '@/lib/firebase/refs';
import type { User } from '@/types';

export async function validatePin(pin: string): Promise<User | null> {
  const usersRef = refs.users();
  const snapshot = await get(usersRef);
    
  if (!snapshot.exists()) {
    return null;
  }

  const users = snapshot.val();
  for (const [userId, userData] of Object.entries<any>(users)) {
    if (userData.pass_pin === pin) {
      return {
        id: userId,
        ...userData
      } as User;
    }
  }
    
  return null;
}

export async function logoutUser(): Promise<void> {
  // Session is handled by React Context (AuthContext)
  return Promise.resolve();
}
