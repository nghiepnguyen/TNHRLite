import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    // Sử dụng Popup thay vì Redirect để ổn định hơn trên localhost
    return signInWithPopup(auth, provider);
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

  const value = {
    currentUser,
    isAdmin,
    loading,
    login,
    register,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
