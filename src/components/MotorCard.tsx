'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Motor, RestoreCost } from '@/types';
import { 
  Calendar, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Tag,
  Star
} from 'lucide-react';

interface MotorCardProps {
  motor: Motor;
  costs: RestoreCost[];
}

const MotorCard: React.FC<MotorCardProps> = ({ motor, costs }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // const calculateTotalRestoreCost = () => {
  //   return (costs || []).reduce((total, cost) => total + cost.amount, 0);
  // };


  const calculateTotalCost = () => {
    const boughtInCost = motor.boughtInCost || 0;
    const restoreCost = motor.restoreCost || 0;
    return boughtInCost + restoreCost;
  };

  const calculateProfit = () => {
    if (!motor.soldPrice) return 0;
    return motor.soldPrice - calculateTotalCost();
  };

  const getStatusInfo = () => {
    if (motor.soldDate) {
      return {
        status: 'Sold',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
        showProfit: true
      };
    } else if (motor.listingDate) {
      return {
        status: 'Listed',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Tag className="w-4 h-4" />,
        showProfit: false
      };
    } else {
      return {
        status: 'In Progress',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Clock className="w-4 h-4" />,
        showProfit: false
      };
    }
  };

  const getPrimaryImageUrl = () => {
    if (!motor.images || motor.images.length === 0) return null;
    const primaryIndex = motor.primaryImageIndex ?? 0;
    return motor.images[primaryIndex] || motor.images[0];
  };

  const statusInfo = getStatusInfo();
  const primaryImageUrl = getPrimaryImageUrl();

  return (
    <Link href={`/motor/${motor.id}`}>
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        {/* Image Section */}
        <div className="relative h-48 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {primaryImageUrl ? (
            <>
              <Image
                src={primaryImageUrl}
                alt={motor.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Primary Image Indicator */}
              {motor.primaryImageIndex !== undefined && motor.images && motor.images.length > 1 && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Primary</span>
                </div>
              )}
              {/* Image Count */}
              {motor.images && motor.images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  {motor.images.length} photos
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No image</p>
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute bottom-3 left-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-sm ${statusInfo.color}`}>
              {statusInfo.icon}
              <span>{statusInfo.status}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors duration-200">
                {motor.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">{motor.carPlate}</span>
                <span>•</span>
                <span>{motor.year ? motor.year : '-'}</span>
              </div>
            </div>
            
            {/* Name Change Status */}
            <div className="flex-shrink-0 ml-3">
              {motor.changedName ? (
                <div className="flex items-center gap-1 text-green-600" title="Name has been changed">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600" title="Original name - requires update">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          {/* Previous Owner */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Previous Owner:</span> {motor.previousOwner}
            </p>
          </div>

          {/* Financial Information */}
          <div className="space-y-3">
            {statusInfo.showProfit && motor.soldPrice ? (
              // Show profit/loss for sold motors
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Sold Price:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(motor.soldPrice)}</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-xl border-2 ${
                  calculateProfit() >= 0 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <span className={`font-semibold text-sm ${calculateProfit() >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Profit/Loss:
                  </span>
                  <div className={`flex items-center gap-1 font-bold ${
                    calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateProfit() >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {calculateProfit() >= 0 ? '+' : ''}{formatCurrency(calculateProfit())}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Show accumulated cost for in-progress and listed motors
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Bought In Cost:</span>
                  <span className="font-semibold text-gray-900">
                    {motor.boughtInCost ? formatCurrency(motor.boughtInCost) : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Restoration Cost:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(motor.restoreCost)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-blue-800 font-semibold text-sm">Total Investment:</span>
                  <span className="font-bold text-blue-900">{formatCurrency(calculateTotalCost())}</span>
                </div>
              </div>
            )}
          </div>

          {/* Date Information */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {motor.soldDate 
                  ? `Sold: ${motor.soldDate.toLocaleDateString('en-MY')}`
                  : motor.listingDate 
                    ? `Listed: ${motor.listingDate.toLocaleDateString('en-MY')}`
                    : motor.boughtInDate 
                      ? `Bought: ${motor.boughtInDate.toLocaleDateString('en-MY')}`
                      : 'Date not set'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MotorCard;

