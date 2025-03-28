'use client';

import SignButton from '@/components/SignButton';
import TextField from '@/components/TextField';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import ReactLoading from 'react-loading';
import OtpInput from 'react-otp-input';
import Logo from '@/assets/favicon.png';

interface ISigninData {
  email: string | null;
  password: string | null;
}

export default function Signin() {
  const [inRequest, setInRequest] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<ISigninData>({ email: null, password: null });
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<string>();

  const handleResetRequest = async () => {
    console.log('=== Login Function ===', data);
    if (!data.email || !data.password) {
      setError('Input the correct information.');
      return;
    }
    try {
      setInRequest(true);
      const response = await fetch('/api/auth/forgot', {
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
        setStep(1);
        console.log(responseData.message)
      } else {
        console.log('Error while receiving response: ', responseData.error);
        setError(responseData.error);
      }
      setInRequest(false);
    } catch (error) {
      console.error('Error while reseting password.', error);
      setInRequest(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleOtpSend = async () => {
    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });
    } catch (error) {
      console.error('Error while sending otp code: ', error);
    }
  };

  return (
    <>
      {step === 0 ? (
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
          <TextField
            className='mx-8'
            placeholder='Password'
            name='password'
            type='password'
            value={data.password || ''}
            onChange={handleChange}
          />
          <SignButton className='flex justify-center items-center' onClick={handleResetRequest} disabled={inRequest}>
            {inRequest ? (
              <ReactLoading type='bubbles' height={36} width={36} color='#ffffff' />
            ) : (
              'Request password reset'
            )}
          </SignButton>
        </div>
      ) : (
        <div className='flex flex-col gap-5 max-w-[420px] min-w-96'>
          <p className='text-center'>Please check your email and input OTP code!</p>
          <OtpInput
            numInputs={4}
            value={otp}
            onChange={(otp) => setOtp(otp)}
            renderSeparator={<span className='w-10'></span>}
            placeholder='****'
            inputStyle={{ width: '80px', height: '80px', fontSize: 32, borderRadius: 10 }}
            renderInput={(props) => <input {...props} />}
          />
          <SignButton className='flex justify-center items-center' onClick={handleOtpSend} disabled={inRequest}>
            {inRequest ? (
              <ReactLoading type='bubbles' height={36} width={36} color='#ffffff' />
            ) : (
              'Request password reset'
            )}
          </SignButton>
        </div>
      )}
    </>
  );
}
