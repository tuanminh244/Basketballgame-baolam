import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { auth, db } from "./firebase.js";

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return await signOut(auth);
}

export function observeAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const roleRef = ref(db, `users/${user.uid}/role`);
        const snap = await get(roleRef);
        const role = snap.exists() && snap.val() ? snap.val() : 'player';
        callback({ uid: user.uid, email: user.email, role });
      } catch (error) {
        callback({ uid: user.uid, email: user.email, role: 'player' }); // Fallback
      }
    } else {
      callback(null);
    }
  });
}
