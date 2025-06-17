'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, LogOut } from 'lucide-react';

const VerificationPage: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="86 Garage Logo"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">86 Garage</h1>
          <p className="text-gray-600">Motor Restoration History</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Account Verification Required
            </h2>
            <p className="text-gray-600 mb-4">
              Your account is currently pending verification. Please contact an administrator to verify your account.
            </p>
            {user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Name:</strong> {user.displayName}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 bg-gray-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Once your account is verified, you&apos;ll have full access to the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;

