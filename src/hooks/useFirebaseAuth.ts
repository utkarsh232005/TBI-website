'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase Auth state changed:', { uid: user?.uid, email: user?.email });
      setUser(user);
      setLoading(false);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, authReady };
}
