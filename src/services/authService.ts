import { ref, get } from 'firebase/database';
import { db } from '@/services/firebase/config';

export async function validatePin(pin: string) {
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
      };
    }
  }
  
  return null;
}

export async function logoutUser(): Promise<void> {
  return Promise.resolve();
}
