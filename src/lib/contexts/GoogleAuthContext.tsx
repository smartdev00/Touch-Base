'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { getUserByEmail } from '../firebase/firebaseUtils';

interface UserInforType {
  id: string;
  email: string;
  sheetId: string | null;
  signinAt: string | null;
  notes: string[];
  openaiKey: string | null;
}

interface GoogleAuthContextType {
  accessToken: string | null;
  userInfor: UserInforType | null;
  id: string | null;
  isAuthenticated: boolean;
  spreadsheetId: string | null;
  setAccessToken: (str: string | null) => void;
  setUserInfor: (user: UserInforType | null) => void;
  setId: (str: string | null) => void;
  setIsAuthenticated: (ok: boolean) => void;
  setSpreadsheetId: (id: string | null) => void;
  signOut: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null);

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfor, setUserInfor] = useState<UserInforType | null>(null);
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for stored token
    const googleToken = localStorage.getItem('googleAccessToken');
    const jwtToken = localStorage.getItem('jwtToken');

    if (googleToken || jwtToken) {
      setAccessToken(googleToken || jwtToken);
      setIsAuthenticated(true);
      const tempUserInfor = localStorage.getItem('userInfor');
      const parsedInfor = tempUserInfor ? JSON.parse(tempUserInfor) : null;

      const fetchUsers = async () => {
        const userResponse = await getUserByEmail('user', parsedInfor?.email);
        if (!userResponse?.id || !(userResponse as any)?.email) {
          router.push('/signin');
          return;
        }
        setUserInfor({
          id: userResponse?.id,
          email: (userResponse as any)?.email,
          sheetId: (userResponse as any)?.sheetId || null,
          signinAt: (userResponse as any)?.signinAt || null,
          notes: (userResponse as any)?.notes || [],
          openaiKey: (userResponse as any)?.openaiKey || null,
        });
        localStorage.setItem('userInfor', JSON.stringify(userResponse));
        setSpreadsheetId((userResponse as any)?.sheetId || null);
      };
      if (parsedInfor?.email) {
        fetchUsers();
      } else {
        if (window.location.pathname === '/signup') {
          return;
        }
        localStorage.removeItem('googleAccessToken');
        router.push('/signin');
      }
    } else {
      if (
        window.location.pathname === '/signup' ||
        window.location.pathname === '/' ||
        window.location.pathname === '/forgot' ||
        window.location.pathname === '/signin' ||
        window.location.pathname === '/signagain'
      ) {
        return;
      }
      router.push('/signin');
    }
  }, [router]);

  const signOut = () => {
    setAccessToken(null);
    setSpreadsheetId(null);
    setUserInfor(null);
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('googleSheetId');
    localStorage.removeItem('userInfor');
    localStorage.removeItem('jwtToken');
    router.push('/signagain');
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('Google Client ID not found');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleAuthContext.Provider
        value={{
          accessToken,
          userInfor,
          id,
          isAuthenticated,
          spreadsheetId,
          setAccessToken,
          setUserInfor,
          setId,
          setIsAuthenticated,
          setSpreadsheetId,
          signOut,
        }}
      >
        {children}
      </GoogleAuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};
