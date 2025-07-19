"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { sessionManager } from '@/lib/session-manager';

interface User {
  uid: string;
  email: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  authReady: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Firebase Auth state observer
  useEffect(() => {
    if (!isMounted) return;

    console.log('Setting up Firebase Auth observer...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase Auth state changed:', {
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        isAnonymous: firebaseUser?.isAnonymous,
        emailVerified: firebaseUser?.emailVerified
      });

      setFirebaseUser(firebaseUser);
      setAuthReady(true);

      if (firebaseUser) {
        console.log('Firebase user detected, creating/updating user object...');
        // If we have a Firebase user, try to get stored user data or create it
        try {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('Found stored user:', parsedUser);
            // Verify that the stored user matches the Firebase user
            if (parsedUser.uid === firebaseUser.uid) {
              console.log('Stored user matches Firebase user, using stored data');
              setUser(parsedUser);
            } else {
              console.log('Stored user mismatch, creating new user object from Firebase data');
              // Mismatch, create new user object from Firebase data
              const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || firebaseUser.email || 'User'
              };
              setUser(newUser);
              localStorage.setItem('currentUser', JSON.stringify(newUser));
            }
          } else {
            console.log('No stored user, creating from Firebase data');
            // No stored user, create from Firebase data
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email || 'User'
            };
            setUser(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
          }
        } catch (error) {
          console.error('Error handling Firebase user:', error);
          // Fallback: create user from Firebase data
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email || 'User'
          };
          setUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
        }
      } else {
        console.log('No Firebase user, clearing stored data');
        // No Firebase user, clear stored data
        setUser(null);
        localStorage.removeItem('currentUser');
      }

      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up Firebase Auth observer');
      unsubscribe();
    };
  }, [isMounted]);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, firebaseUser, setUser: updateUser, isLoading, authReady }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
