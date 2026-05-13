import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { User } from '@/types';

export async function validatePin(pin: string): Promise<User | null> {
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
        ...userData
      } as User;
    }
  }
  
  return null;
}

export async function logoutUser(): Promise<void> {
  return Promise.resolve();
}
