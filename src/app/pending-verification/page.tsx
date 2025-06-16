'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingVerification() {
  const { user, userData, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (userData?.verified) {
      router.push('/');
    }
  }, [user, userData, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verification Pending
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your account is currently pending verification. Please wait while an administrator reviews your account.
          </p>
          <p className="text-md text-gray-500 mb-8">
            We'll notify you once your account has been verified.
          </p>
          <button
            onClick={async () => {
              try {
                await signOut();
                router.push('/signin');
              } catch (error) {
                console.error('Error signing out:', error);
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
} 