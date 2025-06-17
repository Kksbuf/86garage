'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateMotor, deleteMotor } from '@/lib/firestore';
import { Motor } from '@/types';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface EditMotorModalProps {
  motor: Motor;
  onClose: () => void;
  onMotorUpdated: () => void;
}

const EditMotorModal: React.FC<EditMotorModalProps> = ({ motor, onClose, onMotorUpdated }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    carPlate: motor.carPlate,
    name: motor.name,
    year: motor.year,
    previousOwner: motor.previousOwner,
    boughtInDate: motor.boughtInDate ? motor.boughtInDate.toISOString().split('T')[0] : '',
    boughtInCost: motor.boughtInCost?.toString() || '',
    changedName: motor.changedName,
    paidBy: motor.paidBy || "" as "dh" | "ks" | "zc" | "", // <--- UPDATE THIS LINE
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const updates: Partial<Motor> = {
        carPlate: formData.carPlate,
        name: formData.name,
        year: formData.year,
        previousOwner: formData.previousOwner,
        boughtInDate: formData.boughtInDate ? new Date(formData.boughtInDate) : undefined,
        boughtInCost: formData.boughtInCost ? parseFloat(formData.boughtInCost) : undefined,
        changedName: formData.changedName,
        paidBy: formData.paidBy === "" ? undefined : formData.paidBy, // <--- ADD THIS LINE
      };

      await updateMotor(motor.id, updates);
      onMotorUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating motor:', error);
      alert('Failed to update motor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMotor = async () => {
    try {
      setDeleting(true);
      await deleteMotor(motor.id);
      onClose();
      router.push('/');
    } catch (error) {
      console.error('Error deleting motor:', error);
      alert('Failed to delete motor. Please try again.');
    } finally {
      setDeleting(false);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Edit Motor
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="carPlate" className="block text-sm font-semibold text-gray-700 mb-2">
              Car Plate *
            </label>
            <input
              type="text"
              id="carPlate"
              name="carPlate"
              value={formData.carPlate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Motor Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <div>
            <label htmlFor="previousOwner" className="block text-sm font-semibold text-gray-700 mb-2">
              Previous Owner *
            </label>
            <input
              type="text"
              id="previousOwner"
              name="previousOwner"
              value={formData.previousOwner}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <div>
            <label htmlFor="boughtInDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Bought In Date
            </label>
            <input
              type="date"
              id="boughtInDate"
              name="boughtInDate"
              value={formData.boughtInDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <div>
            <label htmlFor="boughtInCost" className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
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


          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="changedName"
              name="changedName"
              checked={formData.changedName}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
            />
            <label htmlFor="changedName" className="ml-3 block text-sm font-medium text-gray-700">
              Name has been changed
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              >
                {loading ? 'Updating...' : 'Update Motor'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Motor</span>
            </button>
          </div>
        </form>
      </div >

      {/* Delete Confirmation Modal */}
      {
        showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-60">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-200/50 max-w-sm w-full">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Motor</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <strong>{motor.name}</strong>? This will also delete all associated restoration costs and media.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteMotor}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default EditMotorModal;

