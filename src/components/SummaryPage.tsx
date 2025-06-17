'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMotors } from '@/lib/firestore';
import { Motor } from '@/types';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Wallet,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

const SummaryPage: React.FC = () => {
  const router = useRouter();
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMotors();
  }, []);

  const loadMotors = async () => {
    try {
      setLoading(true);
      const allMotors = await getMotors();
      setMotors(allMotors);
    } catch (error) {
      console.error('Error loading motors:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return new Intl.DateTimeFormat('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Calculate statistics
  const currentHoldings = motors.filter(m => !m.soldDate);
  const soldMotors = motors.filter(m => m.soldDate);

  const totalHoldingCost = currentHoldings.reduce((total, motor) => {
    return total + (motor.boughtInCost || 0) + (motor.restoreCost || 0);
  }, 0);

  const totalRevenue = soldMotors.reduce((total, motor) => {
    return total + (motor.soldPrice || 0);
  }, 0);

  const totalSoldCost = soldMotors.reduce((total, motor) => {
    return total + (motor.boughtInCost || 0) + (motor.restoreCost || 0);
  }, 0);

  const totalProfit = totalRevenue - totalSoldCost;

  const stats = {
    totalMotors: motors.length,
    inProgress: motors.filter(m => !m.listingDate && !m.soldDate).length,
    listed: motors.filter(m => m.listingDate && !m.soldDate).length,
    sold: soldMotors.length,
    totalHoldingCost,
    totalRevenue,
    totalProfit,
    avgProfitPerSale: soldMotors.length > 0 ? totalProfit / soldMotors.length : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Business Summary
                </h1>
                <p className="text-sm lg:text-base text-gray-600 hidden sm:block">
                  Financial overview and performance metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalMotors}</div>
                <div className="text-sm text-gray-600">Total Motors</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg lg:text-xl font-bold text-gray-900">{formatCurrency(stats.totalHoldingCost)}</div>
                <div className="text-sm text-gray-600">Current Holdings</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg lg:text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {stats.totalProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <div className={`text-lg lg:text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}
                </div>
                <div className="text-sm text-gray-600">Total Profit</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Current Holdings */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Current Holdings</h2>
                <p className="text-gray-600">Motors in progress and listed for sale</p>
              </div>
            </div>

            {/* Holdings Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.listed}</div>
                  <div className="text-sm text-gray-600">Listed</div>
                </div>
              </div>
              <div className="border-t border-blue-200 mt-4 pt-4 text-center">
                <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalHoldingCost)}</div>
                <div className="text-sm text-gray-600">Total Investment</div>
              </div>
            </div>

            {/* Holdings List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentHoldings.length > 0 ? (
                currentHoldings.map((motor) => (
                  <Link key={motor.id} href={`/motor/${motor.id}`}>
                    <div key={motor.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{motor.name}</h3>
                          {motor.changedName ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${motor.listingDate
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}>
                          {motor.listingDate ? 'Listed' : 'In Progress'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{motor.carPlate} • {motor.year ? motor.year : '-'}</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency((motor.boughtInCost || 0) + (motor.restoreCost || 0))}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No current holdings</p>
                </div>
              )}
            </div>
          </div>

          {/* Sold Motors Summary */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Sold Motors</h2>
                <p className="text-gray-600">Completed transactions and performance</p>
              </div>
            </div>

            {/* Sales Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 lg:p-6 mb-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.sold}</div>
                  <div className="text-sm text-gray-600">Motors Sold</div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-green-200 pt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="text-xs text-gray-600">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}
                    </div>
                    <div className="text-xs text-gray-600">Net Profit</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sold Motors List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {soldMotors.length > 0 ? (
                soldMotors.map((motor) => {
                  const profit = (motor.soldPrice || 0) - (motor.boughtInCost || 0) - (motor.restoreCost || 0);
                  return (
                    <Link key={motor.id} href={`/motor/${motor.id}`}>
                      <div key={motor.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">{motor.name}</h3>
                            {motor.changedName ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {profit >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{profit >= 0 ? '+' : ''}{formatCurrency(profit)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{motor.carPlate} • {formatDate(motor.soldDate)}</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(motor.soldPrice || 0)}
                          </span>
                        </div>
                      </div>
                    </Link>

                  );
                })
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No motors sold yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SummaryPage;

