'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MotorDetailPage from '@/components/MotorDetailPage';

type Params = {
  id: string;
};

interface MotorPageProps {
  params: Promise<Params>;
}

export default function MotorPage({ params }: MotorPageProps) {
  const unwrappedParams = React.use(params);
  return (
    <ProtectedRoute>
      <MotorDetailPage motorId={unwrappedParams.id} />
    </ProtectedRoute>
  );
}

