'use client';

import { SetStateAction, useState } from 'react';
import { addUser } from '@/lib/firebase/firebaseUtils';
import { useGoogleAuth } from '@/lib/contexts/GoogleAuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function GoogleSignIn({
  setIsSigning,
  className,
}: {
  setIsSigning: React.Dispatch<SetStateAction<boolean>>;
  className?: string;
}) {
  const { setAccessToken, setUserInfor, setSpreadsheetId } = useGoogleAuth();
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      if (response.access_token) {
        setIsSigning(true);
        try {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          });
          const userInfo = await userInfoResponse.json();
          const email = userInfo.email; // Extract the email
          console.log('User Email:', email);
          console.log('verifyResponse:=> ', userInfo);
          if (userInfo?.email_verified) {
            const result = await addUser('user', { email: userInfo?.email });
            console.log('Result: ', result);

            if (!result) {
              throw new Error('Error while adding the user');
            }

            setUserInfor({
              id: result?.id || null,
              email: result?.email || null,
              sheetId: result?.sheetId || null,
              signinAt: result?.signinAt || null,
              notes: result?.notes || [],
              openaiKey: result?.openaiKey || null,
            });
            localStorage.setItem('userInfor', JSON.stringify(result));
            if (result?.sheetId) {
              setSpreadsheetId(result.sheetId);
              localStorage.setItem('googleSheetId', result.sheetId);
            }

            localStorage.setItem('googleAccessToken', response.access_token);
            setAccessToken(response.access_token);
            // setIsAuthenticated(true);
            router.push('/record');
          } else {
            throw new Error('Invalid user');
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error while sign in: ', { error });
          }
          console.error('Error while sign in');
        }
        setIsSigning(false);
      }
    },
    onError: () => {
      console.log('Login Failed');
    },
    // flow: "implicit", // Use 'auth-code' flow for server-side token exchange
    // scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive", // Specify your required scopes here
  });
  return (
    <button className={`flex gap-2 items-center px-5 py-1 ${className}`} onClick={() => login()}>
      <Image
        src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
        alt='Google logo'
        width={24}
        height={24}
        className='w-6 h-6'
      />
      <p className='w-full text-center text-xl'>Signin with Google</p>
    </button>
  );
}
