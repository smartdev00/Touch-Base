'use client';

import Logo from '@/assets/favicon.png';
import SignButton from '@/components/SignButton';
import TextField from '@/components/TextField';
import Image from 'next/image';
import ReactLoading from 'react-loading';
import { ChangeEvent, useState } from 'react';
import { getRecordByFilter } from '@/lib/airtable/airtable';
import { addUser, getUserByEmail } from '@/lib/firebase/firebaseUtils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validate } from '@/lib/helpers/validate';
import { useGoogleAuth } from '@/lib/contexts/GoogleAuthContext';

interface ISignUpData {
  email: string | null;
  password: string | null;
  fullName: string | null;
  openaiKey: string | null;
}

interface ISignUpDataError {
  email?: string | null;
  password?: string | null;
  fullName?: string | null;
  text?: string | null;
}

export default function SignUp() {
  const [data, setData] = useState<ISignUpData>({ email: null, password: null, fullName: null, openaiKey: null });
  const [error, setError] = useState<ISignUpDataError>({ email: null, password: null, fullName: null, text: null });
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const router = useRouter();
  const { setAccessToken, setUserInfor, setSpreadsheetId } = useGoogleAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    console.log('=== Sign Up ===', data);
    if (!data.email || !data.password || !data.fullName || !data.openaiKey) {
      setError({ text: 'Input the correct information' });
      return;
    }
    try {
      setIsSigning(true);
      const aiResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.openaiKey}`,
        },
      });
      const aiData = await aiResponse.json();
      if (!aiResponse.ok) {
        console.log('aiData: ', aiData);
        setError({ text: aiData?.error?.message });
        setIsSigning(false);
        return;
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      const responseData = await response.json();
      console.log('response: ', responseData);
      if (response.ok) {
        const user = responseData.user;
        setUserInfor(user);
        setAccessToken(responseData.token);
        localStorage.setItem('jwtToken', responseData.token);
        localStorage.setItem('userInfor', JSON.stringify(user));
        if (user?.sheetId) {
          setSpreadsheetId(user?.sheetId);
        }
        router.push('/record');
      } else {
        setError({ text: responseData.error });
      }
      setIsSigning(false);
    } catch (error) {
      console.error('Error while sign up.', error);
      setIsSigning(false);
    }
  };

  return (
    <div className='flex flex-col gap-5 max-w-[420px] min-w-96'>
      <Image src={Logo} alt='signup-logo' width={500} className='self-center' />
      {error.text && (
        <p className='border border-red-600 text-red-600 bg-red-600 bg-opacity-20 px-4 py-2'>{error.text}</p>
      )}
      <TextField
        className='mx-8'
        placeholder='Full Name'
        name='fullName'
        value={data.fullName || ''}
        onChange={handleChange}
      />
      <TextField
        className='mx-8'
        placeholder='Email'
        name='email'
        type='email'
        value={data.email || ''}
        onChange={handleChange}
      />
      <TextField
        className='mx-8'
        placeholder='Password'
        name='password'
        type='password'
        value={data.password || ''}
        onChange={handleChange}
      />
      <TextField
        className='mx-8'
        placeholder='Open AI Code'
        name='openaiKey'
        value={data.openaiKey || ''}
        onChange={handleChange}
      />
      <SignButton className='mt-2 flex justify-center items-center' onClick={handleSignUp}>
        {isSigning ? <ReactLoading type='bubbles' height={36} width={36} color='#ffffff' /> : 'Sign Up'}
      </SignButton>
      <Link href='/signin' className='text-center text-dark hover:text-blue-700 hover:underline transition-all'>
        Already have an account?
      </Link>
    </div>
  );
}
