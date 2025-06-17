'use client';

import React, { useState } from 'react';
import { RestoreCost } from '@/types';
import { deleteRestoreCost, updateRestoreCost } from '@/lib/firestore';
import { Calendar, DollarSign, User, Trash2, CheckCircle, XCircle, Edit, Save, X } from 'lucide-react';

interface CostCardProps {
  cost: RestoreCost;
  onUpdate: () => void;
}

const CostCard: React.FC<CostCardProps> = ({ cost, onUpdate }) => {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editData, setEditData] = useState({
    paymentClear: cost.paymentClear
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this cost entry?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteRestoreCost(cost.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting cost:', error);
      alert('Failed to delete cost. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      await updateRestoreCost(cost.id, {
        paymentClear: editData.paymentClear
      });
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating cost:', error);
      alert('Failed to update cost. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData({ paymentClear: cost.paymentClear });
    setEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const payerNames = {
    dh: 'DH',
    ks: 'KS',
    zc: 'ZC',
  };

  const payerColors = {
    dh: 'bg-blue-100 text-blue-800',
    ks: 'bg-green-100 text-green-800',
    zc: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{cost.description}</h4>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              {/* <DollarSign className="w-4 h-4" /> */}
              <span className="font-semibold">{formatCurrency(cost.amount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(cost.date)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit payment status"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Delete cost"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={updating}
                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                title="Save changes"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                disabled={updating}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                title="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${payerColors[cost.paidBy]}`}>
            {payerNames[cost.paidBy]}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {editing ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editData.paymentClear}
                onChange={(e) => setEditData(prev => ({ ...prev, paymentClear: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Payment Clear</span>
            </label>
          ) : (
            <>
              {cost.paymentClear ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Payment Clear</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Payment Pending</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostCard;

