import React, { useState, useEffect, useMemo } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification,
  reload
} from 'firebase/auth';

import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (credential) => {
        await sendEmailVerification(credential.user);
        return credential;
      });
  }

  function sendVerification() {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
    return Promise.reject("No user logged in");
  }

  async function reloadUser() {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setCurrentUser({...auth.currentUser});
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      return await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // Popup bị trình duyệt chặn (thường gặp trên production domain) — fallback sang redirect
        return signInWithRedirect(auth, provider);
      }
      throw err;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    // Xử lý kết quả trả về sau khi Redirect (nếu có lỗi)
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect login error:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log('AuthContext: onAuthStateChanged fired', user?.email || 'No user');
      setCurrentUser(user);
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'thanhnghiep@gmail.com';
      setIsAdmin(user?.email === adminEmail);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Stabilize context value to prevent cascading re-renders across all consumers
  const value = useMemo(() => ({
    currentUser,
    isAdmin,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    sendVerification,
    reloadUser
  }), [currentUser, isAdmin, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
