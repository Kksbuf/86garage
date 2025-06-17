'use client';

import React, { useState, useRef, useEffect } from 'react';
import { updateMotor, getMotor } from '@/lib/firestore';
import { Motor } from '@/types';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

interface MediaUploadProps {
  motorId: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ motorId, onClose, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [motor, setMotor] = useState<Motor | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadMotor = async () => {
      try {
        const motorData = await getMotor(motorId);
        setMotor(motorData);
      } catch (error) {
        console.error('Error loading motor:', error);
        alert('Failed to load motor data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMotor();
  }, [motorId]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !motor) return;

    setUploading(true);
    const uploadedUrls: string[] = [];
    const uploadedVideos: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('motorId', motor.id);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        
        if (result.resourceType === 'video') {
          uploadedVideos.push(result.url);
        } else {
          uploadedUrls.push(result.url);
        }
      }

      // Update motor with new media URLs
      const updatedImages = [...(motor.images || []), ...uploadedUrls];
      const updatedVideos = [...(motor.videos || []), ...uploadedVideos];

      await updateMotor(motor.id, {
        images: updatedImages,
        videos: updatedVideos,
      });

      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-900">Loading motor data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!motor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load motor data</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Upload Media</h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {uploading ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-900 font-medium mb-2">Uploading files...</p>
              <p className="text-sm text-gray-600">{uploadProgress}</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  Upload images and videos for <strong>{motor.name}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG, GIF, MP4, MOV, AVI
                </p>
              </div>

              <div
                onClick={handleFileSelect}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to select files or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  You can select multiple files at once
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="mt-6 flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Images</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Videos</span>
                </div>
              </div>
            </>
          )}
        </div>

        {!uploading && (
          <div className="flex justify-end gap-3 p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUpload;

