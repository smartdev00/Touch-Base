'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import Image from 'next/image';
import Logo from '@/assets/favicon.png';
import SignButton from '@/components/SignButton';
import Link from 'next/link';
import backImg from '@/assets/back.jpg';

export default function Home() {
  return (
    <AuthProvider>
      <div className='flex px-4 flex-col-reverse gap-2 bml:flex-row mx-auto justify-center items-center w-full'>
        <div className='flex flex-col items-center max-w-96 w-full'>
          <Image src={Logo} alt='logo' className='max-w-[400px] w-full' />
          <p className='text-xl font-bold pl-7'>Consider you follow-ups handled with a simple voice note.</p>
          <SignButton className='rounded-full px-7 mt-28'>Learn More</SignButton>
          <p className='mt-1'>Pay once. Use forever. 😃</p>
          <div className='flex gap-3'>
            <Link href='/signin' className='text-center text-dark hover:text-blue-700 hover:underline transition-all'>
              Sign In
            </Link>{' '}
            |
            <Link href='/signup' className='text-center text-dark hover:text-blue-700 hover:underline transition-all'>
              Sign Up
            </Link>
          </div>
        </div>
        <div className='bml:pl-5 transition-all'>
          <Image src={backImg} alt='back-image' className='max-w-96 w-full' />
        </div>
      </div>
    </AuthProvider>
  );
}
