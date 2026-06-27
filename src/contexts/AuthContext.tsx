import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, hasValidFirebaseConfig } from '../lib/firebase';

export interface User {
  id: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasValidFirebaseConfig && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({ id: firebaseUser.uid, email: firebaseUser.email });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo Mode Fallback
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (hasValidFirebaseConfig && auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      // Demo Mode
      const dummyUser = { id: 'demo-user-123', email };
      localStorage.setItem('demo_user', JSON.stringify(dummyUser));
      setUser(dummyUser);
    }
  };

  const signup = async (email: string, pass: string) => {
    if (hasValidFirebaseConfig && auth) {
      await createUserWithEmailAndPassword(auth, email, pass);
    } else {
      // Demo Mode
      const dummyUser = { id: 'demo-user-123', email };
      localStorage.setItem('demo_user', JSON.stringify(dummyUser));
      setUser(dummyUser);
    }
  };

  const loginWithGoogle = async () => {
    if (hasValidFirebaseConfig && auth) {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } else {
      // Demo Mode
      const dummyUser = { id: 'demo-user-google', email: 'demo@gmail.com' };
      localStorage.setItem('demo_user', JSON.stringify(dummyUser));
      setUser(dummyUser);
    }
  };

  const logout = async () => {
    if (hasValidFirebaseConfig && auth) {
      await firebaseSignOut(auth);
    } else {
      // Demo Mode
      localStorage.removeItem('demo_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
