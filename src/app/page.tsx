'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/components/HomePage';

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}

