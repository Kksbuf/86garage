'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createMotor } from '@/lib/firestore';
import { X } from 'lucide-react';

interface AddMotorModalProps {
  onClose: () => void;
  onMotorAdded: () => void;
}

const AddMotorModal: React.FC<AddMotorModalProps> = ({ onClose, onMotorAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    carPlate: '',
    name: '',
    previousOwner: '',
    year: new Date().getFullYear(),
    boughtInDate: '',
    boughtInCost: '',
    paidBy: "" as "dh" | "ks" | "zc" | "", 
    changedName: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const motorData = {
        carPlate: formData.carPlate,
        name: formData.name,
        previousOwner: formData.previousOwner,
        year: formData.year,
        boughtInDate: formData.boughtInDate ? new Date(formData.boughtInDate) : undefined,
        boughtInCost: formData.boughtInCost ? parseFloat(formData.boughtInCost) : undefined,
        changedName: formData.changedName,
        paidBy: formData.paidBy === "" ? undefined : formData.paidBy, // <--- ADD THIS LINE
        images: [],
        videos: [],
      };

      await createMotor(motorData);
      onMotorAdded();
      onClose();
    } catch (error) {
      console.error('Error creating motor:', error);
      alert('Failed to create motor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Motor</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="carPlate" className="block text-sm font-medium text-gray-700 mb-1">
              Car Plate *
            </label>
            <input
              type="text"
              id="carPlate"
              name="carPlate"
              value={formData.carPlate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., ABC 1234"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Motor Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., My AE86 Project"
            />
          </div>

          <div>
            <label htmlFor="previousOwner" className="block text-sm font-medium text-gray-700 mb-1">
              Previous Owner *
            </label>
            <input
              type="text"
              id="previousOwner"
              name="previousOwner"
              value={formData.previousOwner}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Aeon Credit"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="boughtInDate" className="block text-sm font-medium text-gray-700 mb-1">
              Bought In Date
            </label>
            <input
              type="date"
              id="boughtInDate"
              name="boughtInDate"
              value={formData.boughtInDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="boughtInCost" className="block text-sm font-medium text-gray-700 mb-1">
              Bought In Cost (RM)
            </label>
            <input
              type="number"
              id="boughtInCost"
              name="boughtInCost"
              value={formData.boughtInCost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div> {/* <--- ADD THIS NEW DIV */} 
          <label htmlFor="paidBy" className="block text-sm font-semibold text-gray-700 mb-2">
            Paid By
          </label>
          <select
            id="paidBy"
            name="paidBy"
            value={formData.paidBy}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200 hover:bg-gray-50"
          >
            <option value="">Select Payer</option>
            <option value="dh">dh</option>
            <option value="ks">ks</option>
            <option value="zc">zc</option>
          </select>
        </div>


          <div className="flex items-center">
            <input
              type="checkbox"
              id="changedName"
              name="changedName"
              checked={formData.changedName}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="changedName" className="ml-2 block text-sm text-gray-700">
              Name has been changed
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Motor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMotorModal;

