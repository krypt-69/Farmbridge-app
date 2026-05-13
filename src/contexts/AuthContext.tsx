import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { getCurrentUser } from '../api/auth';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/models';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setError(null);
      if (firebaseUser) {
        try {
          // Store fresh token
          const token = await firebaseUser.getIdToken();
          await SecureStore.setItemAsync('firebaseToken', token);
          // Fetch profile from backend
          const profile = await getCurrentUser();
          setUser(profile);
        } catch (e: any) {
          console.error('Failed to fetch profile:', e);
          // If we can't get profile, force logout
          await SecureStore.deleteItemAsync('firebaseToken');
          setUser(null);
          setError('Failed to load user profile.');
        }
      } else {
        // Signed out
        await SecureStore.deleteItemAsync('firebaseToken');
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will fire and set user + token
    } catch (e: any) {
      setError(e.message || 'Login failed.');
      throw e; // rethrow so login screen can catch
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
    // onAuthStateChanged will clear state
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};