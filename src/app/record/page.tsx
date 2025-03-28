'use client';

import Image from 'next/image';
import { LinkButton } from '@/components/Button';
import Logo from '@/assets/favicon.png';
import VoiceRecorder from '@/components/VoiceRecorder';
import { useGoogleAuth } from '@/lib/contexts/GoogleAuthContext';

export default function Record() {
  const { signOut } = useGoogleAuth();
  return (
    <main className='flex min-h-screen flex-col w-full items-center p-8'>
      <div className='w-full flex justify-between items-center mb-8'>
        <Image alt='logo' src={Logo} className='max-w-52 w-full h-auto' priority />
        <div className='flex flex-col gap-2'>
          <LinkButton href='/all-notes' className='w-[130px] flex !py-1 !text-base justify-center'>
            {/* <ListMusic className='w-5 h-5' /> */}
            All Notes
          </LinkButton>
          {/* <button
            className='bg-light-red px-5 py-1 rounded-full text-base hover:bg-red-700 text-white transition-colors'
            onClick={signOut}
          >
            Logout
          </button> */}
        </div>
      </div>
      <div className='max-w-4xl mx-auto w-full inline-flex justify-center'>
        <VoiceRecorder />
      </div>
    </main>
  );
}
