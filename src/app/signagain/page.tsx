import Logo from '@/assets/favicon.png';
import SignButton from '@/components/SignButton';
import TextField from '@/components/TextField';
import Image from 'next/image';
import Link from 'next/link';

export default function SignUp() {
  return (
    <div className='flex flex-col gap-5 max-w-[420px] min-w-96'>
      <Image src={Logo} alt='signup-logo' width={500} className='self-center' />
      <p className='text-center py-10'>You&apos;re all signed out!</p>

      <SignButton className='mt-2 flex justify-center items-center'>
        <Link href='/signin' className='w-full h-full'>Sign In Again</Link>
      </SignButton>
    </div>
  );
}
