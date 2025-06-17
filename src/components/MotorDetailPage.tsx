'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getMotor, getRestoreCostsByMotor, updateMotor, clearAllPayments, deleteImageFromMotor, deleteVideoFromMotor, setPrimaryImage } from '@/lib/firestore';
import { Motor, RestoreCost } from '@/types';
import {
  ArrowLeft,
  Edit,
  Plus,
  Calendar,
  Car,
  Upload,
  FileText,
  Save,
  X,
  Download,
  Play,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Tag,
  User,
  Hash,
  Trash2,
  Star,
  StarOff
} from 'lucide-react';
import AddCostModal from './AddCostModal';
import EditMotorModal from './EditMotorModal';
import CostCard from './CostCard';
import MediaUpload from './MediaUpload';

interface MotorDetailPageProps {
  motorId: string;
}

function getWeeksAndDaysSince(date?: Date): string {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffInMs = now.getTime() - then.getTime();
  const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return `(${weeks} week${weeks !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''})`;
}


const MotorDetailPage: React.FC<MotorDetailPageProps> = ({ motorId }) => {
  const router = useRouter();
  const [motor, setMotor] = useState<Motor | null>(null);
  const [costs, setCosts] = useState<RestoreCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [showEditMotorModal, setShowEditMotorModal] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [clearingPayments, setClearingPayments] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<string | null>(null);

  // Form states for editing
  const [formData, setFormData] = useState({
    boughtInDate: '',
    listingDate: '',
    soldDate: '',
    soldPrice: '',
    status: 'in_progress' as 'in_progress' | 'listing' | 'sold'
  });

  useEffect(() => {
    loadMotorData();
  }, [motorId]);

  useEffect(() => {
    if (motor) {
      setFormData({
        boughtInDate: motor.boughtInDate ? motor.boughtInDate.toISOString().split('T')[0] : '',
        listingDate: motor.listingDate ? motor.listingDate.toISOString().split('T')[0] : '',
        soldDate: motor.soldDate ? motor.soldDate.toISOString().split('T')[0] : '',
        soldPrice: motor.soldPrice?.toString() || '',
        status: motor.soldDate ? 'sold' : motor.listingDate ? 'listing' : 'in_progress'
      });
    }
  }, [motor]);

  const loadMotorData = async () => {
    try {
      setLoading(true);
      const [motorData, costsData] = await Promise.all([
        getMotor(motorId),
        getRestoreCostsByMotor(motorId)
      ]);

      setMotor(motorData);
      setCosts(costsData);
    } catch (error) {
      console.error('Error loading motor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllPayments = async () => {
    if (!confirm('Are you sure you want to mark all restoration costs as payment cleared?')) {
      return;
    }

    try {
      setClearingPayments(true);
      await clearAllPayments(motorId);
      await loadMotorData();
      alert('All payments have been marked as cleared!');
    } catch (error) {
      console.error('Error clearing payments:', error);
      alert('Failed to clear payments. Please try again.');
    } finally {
      setClearingPayments(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setDeletingMedia(imageUrl);
      await deleteImageFromMotor(motorId, imageUrl);
      await loadMotorData();

      // Adjust current image index if necessary
      if (motor?.images && currentImageIndex >= motor.images.length - 1) {
        setCurrentImageIndex(Math.max(0, motor.images.length - 2));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setDeletingMedia(null);
    }
  };

  const handleDeleteVideo = async (videoUrl: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setDeletingMedia(videoUrl);
      await deleteVideoFromMotor(motorId, videoUrl);
      await loadMotorData();

      // Adjust current video index if necessary
      if (motor?.videos && currentVideoIndex >= motor.videos.length - 1) {
        setCurrentVideoIndex(Math.max(0, motor.videos.length - 2));
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setDeletingMedia(null);
    }
  };

  const handleSetPrimaryImage = async (imageIndex: number) => {
    try {
      await setPrimaryImage(motorId, imageIndex);
      await loadMotorData();
      alert('Primary image updated successfully!');
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Failed to set primary image. Please try again.');
    }
  };

  const handleSaveDates = async () => {
    if (!motor) return;

    try {
      const updates: Partial<Motor> = {};

      // Always update bought in date if provided
      if (formData.boughtInDate) {
        updates.boughtInDate = new Date(formData.boughtInDate);
      }

      // Handle status-based updates
      if (formData.status === 'listing' || formData.status === 'sold') {
        if (formData.listingDate) {
          updates.listingDate = new Date(formData.listingDate);
        }
      } else {
        // Clear listing date if status is not listing or sold
        updates.listingDate = null;
      }

      if (formData.status === 'sold') {
        if (formData.soldDate) {
          updates.soldDate = new Date(formData.soldDate);
        }
        if (formData.soldPrice) {
          updates.soldPrice = parseFloat(formData.soldPrice);
        }
      } else {
        // Clear sold data if status is not sold
        updates.soldDate = null;
        updates.soldPrice = null;
      }

      await updateMotor(motor.id, updates);
      await loadMotorData();
      setEditingDates(false);
      alert('Motor details updated successfully!');
    } catch (error) {
      console.error('Error updating motor:', error);
      alert('Failed to update motor. Please try again.');
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
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const calculateTotalRestoreCost = () => {
    return costs.reduce((total, cost) => total + cost.amount, 0);
  };

  const calculateTotalCost = () => {
    const boughtInCost = motor?.boughtInCost || 0;
    const restoreCost = calculateTotalRestoreCost();
    return boughtInCost + restoreCost;
  };

  const calculateProfit = () => {
    if (!motor?.soldPrice) return 0;
    return motor.soldPrice - calculateTotalCost();
  };

  const openMediaViewer = (url: string, type: 'image' | 'video') => {
    setSelectedMedia(url);
    setMediaType(type);
  };

  const closeMediaViewer = () => {
    setSelectedMedia(null);
    setMediaType(null);
  };

  const downloadMedia = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nextImage = () => {
    if (motor?.images && motor.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % motor.images!.length);
    }
  };

  const prevImage = () => {
    if (motor?.images && motor.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + motor.images!.length) % motor.images!.length);
    }
  };

  const nextVideo = () => {
    if (motor?.videos && motor.videos.length > 1) {
      setCurrentVideoIndex((prev) => (prev + 1) % motor.videos!.length);
    }
  };

  const prevVideo = () => {
    if (motor?.videos && motor.videos.length > 1) {
      setCurrentVideoIndex((prev) => (prev - 1 + motor.videos!.length) % motor.videos!.length);
    }
  };

  const getStatusInfo = () => {
    if (motor?.soldDate) {
      return {
        status: 'Sold',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
        date: motor.soldDate
      };
    } else if (motor?.listingDate) {
      return {
        status: 'Listed',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Tag className="w-4 h-4" />,
        date: motor.listingDate
      };
    } else {
      return {
        status: 'In Progress',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Clock className="w-4 h-4" />,
        date: motor?.boughtInDate
      };
    }
  };

  const getPrimaryImageUrl = () => {
    if (!motor?.images || motor.images.length === 0) return null;
    const primaryIndex = motor.primaryImageIndex ?? 0;
    return motor.images[primaryIndex] || motor.images[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Loading motor details...</p>
        </div>
      </div>
    );
  }

  if (!motor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Motor not found</h2>
          <p className="text-gray-600 mb-8">The motor you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const primaryImageUrl = getPrimaryImageUrl();

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
                  {motor.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-medium">{motor.carPlate} • {motor.year ? motor.year : '-'}</span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setShowEditMotorModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
                <span className="font-medium">Edit</span>
              </button>
              <button
                onClick={() => setShowMediaUpload(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <Upload className="w-4 h-4" />
                <span className="font-medium">Upload Media</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowEditMotorModal(true)}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image Carousel */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="h-64 lg:h-80 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {primaryImageUrl ? (
                  <>
                    <Image
                      src={primaryImageUrl}
                      alt={motor.name}
                      fill
                      className="object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onClick={() => openMediaViewer(primaryImageUrl, 'image')}
                    />
                    {motor.images && motor.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {motor.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No image available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
              <button
                onClick={() => setShowMediaUpload(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <Upload className="w-4 h-4" />
                <span className="font-medium">Upload Media</span>
              </button>
            </div>

            {/* Motor Details Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Motor Details</h2>
                  <p className="text-gray-600">Vehicle information and specifications</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Hash className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Car Plate</label>
                      <p className="text-lg font-semibold text-gray-900">{motor.carPlate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <p className="text-lg font-semibold text-gray-900">{motor.year ? motor.year : '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment</label>
                      <p className="text-lg font-semibold text-gray-900">{motor.clear ? 'Clear' : 'Pending'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Previous Owner</label>
                      <p className="text-lg font-semibold text-gray-900">{motor.previousOwner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"> {/* <--- ADD THIS NEW DIV */}
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Paid By</label>
                      <p className="text-lg font-semibold text-gray-900">{motor.paidBy || 'N/A'}</p>
                    </div>

                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {motor.changedName ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name Status</label>
                      <div className={`flex items-center gap-2 ${motor.changedName ? 'text-green-600' : 'text-orange-600'}`}>
                        <span className="font-semibold">
                          {motor.changedName ? 'Name has been changed' : 'Original name - requires update'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Status Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Timeline & Status</h2>
                    <p className="text-gray-600">Track progress and important dates</p>
                  </div>
                </div>

                {!editingDates ? (
                  <button
                    onClick={() => setEditingDates(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="font-medium">Edit</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDates}
                      className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span className="font-medium">Save</span>
                    </button>
                    <button
                      onClick={() => setEditingDates(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                      <span className="font-medium">Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Status Selection */}
                {editingDates && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        status: e.target.value as 'in_progress' | 'listing' | 'sold'
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="listing">Listed for Sale</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                )}

                {/* Timeline Items */}
                <div className="space-y-6">
                  {/* Bought In */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Bought In</h3>
                      {editingDates ? (
                        <input
                          type="date"
                          value={formData.boughtInDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, boughtInDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-600">
                          {formatDate(motor.boughtInDate)}{' '}
                          {!motor.changedName && getWeeksAndDaysSince(motor.boughtInDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Listed */}
                  {(formData.status === 'listing' || formData.status === 'sold' || motor.listingDate) && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Tag className="w-5 h-5 text-yellow-600" />
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Listed for Sale</h3>
                        {editingDates ? (
                          <input
                            type="date"
                            value={formData.listingDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, listingDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-600">{formatDate(motor.listingDate)}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sold */}
                  {(formData.status === 'sold' || motor.soldDate) && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900">Sold</h3>
                        {editingDates ? (
                          <div className="space-y-3">
                            <input
                              type="date"
                              value={formData.soldDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, soldDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Sold Date"
                            />
                            <input
                              type="number"
                              value={formData.soldPrice}
                              onChange={(e) => setFormData(prev => ({ ...prev, soldPrice: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Sold Price (RM)"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-gray-600">{formatDate(motor.soldDate)}</p>
                            {motor.soldPrice && (
                              <p className="text-lg font-semibold text-green-600">
                                {formatCurrency(motor.soldPrice)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Financial Summary */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Financial Summary</h2>
                  <p className="text-gray-600">Investment and returns</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Bought In Cost:</span>
                  <span className="font-bold text-gray-900">
                    {motor.boughtInCost ? formatCurrency(motor.boughtInCost) : 'Not set'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">Restoration Cost:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(calculateTotalRestoreCost())}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <span className="text-blue-800 font-semibold">Total Investment:</span>
                  <span className="font-bold text-blue-900 text-lg">{formatCurrency(calculateTotalCost())}</span>
                </div>

                {motor.soldPrice && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Sold Price:</span>
                      <span className="font-bold text-gray-900">{formatCurrency(motor.soldPrice)}</span>
                    </div>

                    <div className={`flex justify-between items-center p-4 rounded-xl border-2 ${calculateProfit() >= 0
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                      }`}>
                      <span className={`font-semibold ${calculateProfit() >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                        Profit/Loss:
                      </span>
                      <div className={`flex items-center gap-2 font-bold text-lg ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {calculateProfit() >= 0 ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                        <span>
                          {calculateProfit() >= 0 ? '+' : ''}{formatCurrency(calculateProfit())}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Restoration Costs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Restoration Costs</h2>
                    <p className="text-gray-600">Track expenses and payments</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {costs.length > 0 && (
                  <button
                    onClick={handleClearAllPayments}
                    disabled={clearingPayments}
                    className="flex items-center gap-2 px-3 py-2 text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{clearingPayments ? 'Clearing...' : 'Clear All'}</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAddCostModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Cost</span>
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {costs.length > 0 ? (
                  costs.map((cost) => (
                    <CostCard
                      key={cost.id}
                      cost={cost}
                      onUpdate={loadMotorData}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No restoration costs recorded</p>
                    <button
                      onClick={() => setShowAddCostModal(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your first cost
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Media Gallery - Bottom Section */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Media Gallery</h2>
                <p className="text-gray-600">Images and videos of your motor</p>
              </div>
            </div>
            <button
              onClick={() => setShowMediaUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200"
            >
              <Upload className="w-4 h-4" />
              <span className="font-medium">Upload Media</span>
            </button>
          </div>

          {/* Images */}
          {motor.images && motor.images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>Images</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {motor.images.length}
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {motor.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                      <Image
                        src={image}
                        alt={`${motor.name} - Image ${index + 1}`}
                        fill
                        className="object-cover cursor-pointer group-hover:scale-110 transition-transform duration-300"
                        onClick={() => openMediaViewer(image, 'image')}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => handleSetPrimaryImage(index)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${motor.primaryImageIndex === index
                          ? 'bg-yellow-500 text-white'
                          : 'bg-black/50 text-white hover:bg-yellow-500'
                          }`}
                        title={motor.primaryImageIndex === index ? 'Primary image' : 'Set as primary'}
                      >
                        {motor.primaryImageIndex === index ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => downloadMedia(image, `${motor.name}-image-${index + 1}.jpg`)}
                        className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image)}
                        disabled={deletingMedia === image}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
                        title="Delete image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Primary Image Indicator */}
                    {motor.primaryImageIndex === index && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Primary</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {motor.videos && motor.videos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>Videos</span>
                <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {motor.videos.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {motor.videos.map((video, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                      <video
                        src={video}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openMediaViewer(video, 'video')}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => downloadMedia(video, `${motor.name}-video-${index + 1}.mp4`)}
                        className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
                        title="Download video"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video)}
                        disabled={deletingMedia === video}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!motor.images || motor.images.length === 0) && (!motor.videos || motor.videos.length === 0) && (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No media uploaded yet</h3>
              <p className="text-gray-600 mb-6">Start by uploading images or videos of your motor</p>
              <button
                onClick={() => setShowMediaUpload(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload your first media</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeMediaViewer}
              className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 z-10 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => downloadMedia(selectedMedia, `${motor.name}-media.${mediaType === 'image' ? 'jpg' : 'mp4'}`)}
              className="absolute top-4 right-20 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all duration-200 z-10 backdrop-blur-sm"
            >
              <Download className="w-6 h-6" />
            </button>
            {mediaType === 'image' ? (
              <Image
                src={selectedMedia}
                alt="Full size view"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            ) : (
              <video
                src={selectedMedia}
                controls
                className="max-w-full max-h-full rounded-xl"
                autoPlay
              />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddCostModal && (
        <AddCostModal
          motorId={motorId}
          onClose={() => setShowAddCostModal(false)}
          onCostAdded={loadMotorData}
        />
      )}

      {showEditMotorModal && motor && (
        <EditMotorModal
          motor={motor}
          onClose={() => setShowEditMotorModal(false)}
          onMotorUpdated={loadMotorData}
        />
      )}

      {showMediaUpload && (
        <MediaUpload
          motorId={motorId}
          onClose={() => setShowMediaUpload(false)}
          onUploadComplete={loadMotorData}
        />
      )}
    </div>
  );
};

export default MotorDetailPage;

