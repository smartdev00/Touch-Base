'use client';

import React from 'react';
import { app, db } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    if (app && db) {
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
} 