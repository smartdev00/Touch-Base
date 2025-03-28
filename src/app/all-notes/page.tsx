'use client';

import React from 'react';
import NotesList from '@/components/NotesList';
import Logo from '@/assets/favicon.png';
import Image from 'next/image';
import { LinkButton } from '@/components/Button';
import { useGoogleAuth } from '@/lib/contexts/GoogleAuthContext';

export default function AllNotes() {
  const { signOut } = useGoogleAuth();
  return (
    <main className='min-h-screen w-full p-2 xs:p-4 sm:p-8' >
      <div className='flex justify-between items-center w-full'>
        <Image alt='logo' src={Logo} className='max-w-52 w-full h-auto' priority />
        <div className='flex flex-col gap-2'>
          <LinkButton href='/record' className='flex justify-center !text-base !py-1'>Record a Note</LinkButton>
          <button
            className='bg-light-red px-5 py-1 text-base rounded-full hover:bg-red-700 text-white transition-colors'
            onClick={signOut}
          >
            Logout
          </button>
        </div>
      </div>
      <div className='max-w-4xl mx-auto mt-4 mb-4'>
        <h1 className='text-2xl font-bold mb-8 text-dark'>All Voice Notes</h1>
        <NotesList />
      </div>
    </main>
  );
}
