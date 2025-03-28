'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeepgram } from '../lib/contexts/DeepgramContext';
import { addDocument } from '../lib/firebase/firebaseUtils';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { connectToDeepgram, disconnectFromDeepgram, connectionState, realtimeTranscript, error } = useDeepgram();
  const router = useRouter();

  const handleStartRecording = async () => {
    try {
      await connectToDeepgram();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const handleStopRecording = async () => {
    try {
      disconnectFromDeepgram();
      setIsRecording(false);
      
      if (!realtimeTranscript || !realtimeTranscript.trim()) {
        console.log('No transcript to save');
        return;
      }

      setIsSaving(true);
      console.log('Preparing to save note...'); // Debug log
      
      const noteData = {
        text: realtimeTranscript.trim(),
        timestamp: new Date().toISOString(),
      };
      
      console.log('Saving note data:', noteData); // Debug log
      
      try {
        const docRef = await addDocument('notes', noteData);
        console.log('Note saved successfully:', docRef); // Debug log
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/all-notes');
      } catch (saveError) {
        console.error('Firebase save error:', saveError);
        throw new Error('Failed to save to Firebase');
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert(error instanceof Error ? error.message : 'Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {isSaving ? (
        <div className="flex flex-col items-center justify-center p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-blue-500" />
          </motion.div>
          <p className="mt-4 text-gray-600">Saving your note...</p>
        </div>
      ) : (
        <>
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-light-red hover:bg-red-600 text-white' 
                : 'bg-light-blue text-dark hover:bg-blue-300'
            } font-bold`}
          >
            {isRecording ? (
              <>
                <Square className="w-6 h-6" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                Start Recording
              </>
            )}
          </button>

          {isRecording && (
            <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-12 h-12 bg-blue-500 rounded-full opacity-75"
                />
              </div>
              <p className="text-gray-700 text-center">
                {realtimeTranscript || 'Listening...'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}