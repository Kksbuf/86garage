'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMotorsByUser } from '@/lib/firestore';
import { Motor } from '@/types';
import { Plus, LogOut, Car, BarChart3, Menu, X } from 'lucide-react';
import MotorCard from './MotorCard';
import AddMotorModal from './AddMotorModal';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadMotors();
    }
  }, [user]);

  const loadMotors = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userMotors = await getMotorsByUser();
      setMotors(userMotors);
    } catch (error) {
      console.error('Error loading motors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleMotorAdded = () => {
    setShowAddModal(false);
    loadMotors();
  };

  const getMotorStats = () => {
    const inProgress = motors.filter(m => !m.listingDate && !m.soldDate).length;
    const listed = motors.filter(m => m.listingDate && !m.soldDate).length;
    const sold = motors.filter(m => m.soldDate).length;
    return { inProgress, listed, sold };
  };

  const stats = getMotorStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Car className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  86 Garage
                </h1>
                <p className="text-sm lg:text-base text-gray-600 hidden sm:block">Motor Restoration History</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/summary')}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Summary</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Motor</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 space-y-4">
              <div className="text-center pb-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push('/summary');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Summary</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Motor</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Enhanced Header Section */}
        <div className="mb-8 lg:mb-12">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Your Motor Collection
            </h2>
            <p className="text-lg text-gray-600 mb-6 lg:mb-8">
              Manage and track your motor restoration projects with ease
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{motors.length}</div>
                <div className="text-sm lg:text-base text-gray-600">Total Motors</div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{stats.inProgress}</div>
                <div className="text-sm lg:text-base text-gray-600">In Progress</div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">{stats.listed}</div>
                <div className="text-sm lg:text-base text-gray-600">Listed</div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">{stats.sold}</div>
                <div className="text-sm lg:text-base text-gray-600">Sold</div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Mobile */}
          <div className="lg:hidden grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => router.push('/summary')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Summary</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Motor</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16 lg:py-24">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-lg text-gray-600">Loading your motors...</p>
            </div>
          </div>
        ) : motors.length === 0 ? (
          <div className="text-center py-16 lg:py-24">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-200/50 max-w-md mx-auto">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">No motors yet</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Start your restoration journey by adding your first motor project
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Your First Motor
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {motors.map((motor) => (
              <MotorCard key={motor.id} motor={motor} />
            ))}
          </div>
        )}
      </main>

      {/* Add Motor Modal */}
      {showAddModal && (
        <AddMotorModal
          onClose={() => setShowAddModal(false)}
          onMotorAdded={handleMotorAdded}
        />
      )}
    </div>
  );
};

export default HomePage;

