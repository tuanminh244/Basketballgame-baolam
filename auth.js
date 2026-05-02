import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { auth, db } from "./firebase.js";

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return await signOut(auth);
}

export function observeAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const roleRef = ref(db, `users/${user.uid}/role`);
      onValue(roleRef, (snap) => {
        const role = snap.val() || 'player';
        callback({ uid: user.uid, email: user.email, role });
      }, { onlyOnce: true });
    } else {
      callback(null);
    }
  });
}
