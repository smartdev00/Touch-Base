// 'use client';

// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { GoogleSignIn } from '@/components/GoogleSignIn';
// import ReactLoading from 'react-loading';
// // import { Mic } from "lucide-react";
// import Image from 'next/image';
// // import Image from "next/image";
// import backImage from '@/assets/back.jpg';
// import favIcon from '@/assets/favicon.png';

// const SignIn = () => {
//   const router = useRouter();
//   const [isSigning, setIsSigning] = useState<boolean>(false);

//   useEffect(() => {
//     const accessToken = localStorage.getItem('googleAccessToken');
//     if (accessToken) {
//       router.push('/');
//     }
//   }, []);

//   return (
//     <div className='flex w-full min-h-screen justify-center items-center text-dark'>
//       <div className='w-[500px] h-[500px] bg-white flex flex-col items-center text-center pt-16 bg-gradient-to-b from-brown to-light-blue rounded-lg'>
//         <Image src={favIcon} alt='background image' width={250} height={160} />
//         {/* <Image src={touchbase} width={100} height={100} alt="touchbase" /> */}
//         <div className='w-40 h-40 mt-8 self-center'>
//           {/* <Mic width={140} height={140} color='red' className='self-center w-full' /> */}
//           <Image src={backImage} alt='background image' width={160} height={160} />
//         </div>
//         <h1 className='text-3xl text-center mt-10 font-bold'>Voice Notes</h1>
//         <div className='flex justify-center h-auto items-center mt-4'>
//           {isSigning ? (
//             <ReactLoading type='bubbles' height={64} width={64} color='#213343' />
//           ) : (
//             <GoogleSignIn
//               setIsSigning={setIsSigning}
//               className='w-96 h-14 text-center border-2 rounded-xl border-dark'
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;
'use client';

import SignButton from '@/components/SignButton';
import TextField from '@/components/TextField';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import ReactLoading from 'react-loading';
import { useRouter } from 'next/navigation';

import { useGoogleAuth } from '@/lib/contexts/GoogleAuthContext';
import Logo from '@/assets/favicon.png';
import Link from 'next/link';

interface ISigninData {
  email: string | null;
  password: string | null;
}

export default function Signin() {
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [data, setData] = useState<ISigninData>({ email: null, password: null });
  const { setAccessToken, setUserInfor, setSpreadsheetId } = useGoogleAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    console.log('=== Login Function ===', data);
    if (!data.email || !data.password) {
      setError('Input the correct information.');
      return;
    }
    try {
      setIsSigning(true);
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        const user = responseData.user;
        setUserInfor(user);
        setAccessToken(responseData.token);
        localStorage.setItem('userInfor', JSON.stringify(user));
        localStorage.setItem('jwtToken', JSON.stringify(responseData.token));
        if (user?.sheetId) {
          setSpreadsheetId(user.sheetId);
        }
        router.push('/record');
      } else {
        console.log('Error: ', responseData.error);
        setError(responseData.error);
      }
      setIsSigning(false);
    } catch (error) {
      console.error('Error while signin.', error);
      setIsSigning(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className='flex flex-col gap-5 max-w-[420px] min-w-96'>
      <Image src={Logo} alt='signup-logo' width={500} className='self-center' />
      {error && <p className='border border-red-600 text-red-600 bg-red-600 bg-opacity-20 px-4 py-2'>{error}</p>}
      <TextField
        className='mx-8'
        placeholder='Email'
        name='email'
        type='email'
        value={data.email || ''}
        onChange={handleChange}
      />
      <div className='flex flex-col gap-1'>
        <TextField
          className='mx-8'
          placeholder='Password'
          name='password'
          type='password'
          value={data.password || ''}
          onChange={handleChange}
        />
        <Link href='/forgot' className='self-end mr-8 text-sm text-transparent hover:text-transparent hover:cursor-default transition-colors'>
          Forgot your password?
        </Link>
      </div>
      <SignButton className='flex justify-center items-center' onClick={handleLogin} disabled={isSigning}>
        {isSigning ? <ReactLoading type='bubbles' height={36} width={36} color='#ffffff' /> : 'Sign In'}
      </SignButton>
      <Link href='/signup' className='text-center text-dark hover:text-blue-700 hover:underline transition-all'>
        Don&apos;t have an account?
      </Link>
    </div>
  );
}
