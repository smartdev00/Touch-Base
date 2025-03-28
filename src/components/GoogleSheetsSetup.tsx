'use client';

import { useState, useEffect } from 'react';
import { useGoogleAuth } from '../lib/contexts/GoogleAuthContext';
import { getIdByEmail, updateDocument } from '@/lib/firebase/firebaseUtils';

export default function GoogleSheetsSetup() {
  const { isAuthenticated, accessToken, signOut, userInfor, setUserInfor, setId } = useGoogleAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('needsReset') !== 'done') {
      localStorage.setItem('needsReset', 'done');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (userInfor?.sheetId) {
      setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${userInfor.sheetId}`);
    }
  }, [userInfor]);

  const handleCreateSheet = async () => {
    if (!accessToken || !userInfor) {
      alert('Please connect your Google account first');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/google/create-sheet', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userInfor?.email }),
      });
      const data = await response.json();
      console.log('Google Sheet Response :=> ', data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sheet');
      }

      const id = await getIdByEmail('user', userInfor?.email);
      if (!!id === false) {
        throw new Error('User not found. Please sign in again.');
      }
      setId(id);
      updateDocument('user', id, { sheetId: data.spreadsheetId });

      setUserInfor({ ...userInfor, sheetId: data.spreadsheetId });
      setSpreadsheetUrl(data.spreadsheetUrl);

      localStorage.setItem('googleSheetId', data.spreadsheetId);
      localStorage.setItem('googleSheetUrl', data.spreadsheetUrl);

      window.open(data.spreadsheetUrl, '_blank');
    } catch (error) {
      console.error('Failed to create sheet:', error);
      alert('Failed to create Google Sheet: ' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='p-4 bg-white rounded-lg shadow text-dark'>
      <h3 className='text-lg font-semibold mb-4'>Google Sheets Settings</h3>
      <div className='space-y-4'>
        <p className='text-green-600'>✓ Google Account Connected</p>

        {userInfor?.sheetId ? (
          <div className='space-y-4'>
            <p className='text-green-600'>✓ Google Sheet connected</p>
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:text-blue-600 underline block w-fit'
              >
                View Spreadsheet
              </a>
            )}
            <div className='flex gap-2'>
              <button
                onClick={signOut}
                className='px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50'
              >
                Disconnect
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('googleAccessToken');
                  localStorage.removeItem('googleSheetId');
                  localStorage.removeItem('googleSheetUrl');
                  window.location.reload();
                }}
                className='px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50'
              >
                Reset Connection
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleCreateSheet}
            disabled={isCreating}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
          >
            {isCreating ? 'Creating...' : 'Create New Sheet'}
          </button>
        )}
      </div>
    </div>
  );
}
