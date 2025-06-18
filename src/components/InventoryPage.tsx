'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    getInventoryItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
} from '@/lib/firestore';
import { InventoryItem } from '@/types';
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    Package,
    Search,
    X,
    CheckCircle
} from 'lucide-react';

const InventoryPage: React.FC = () => {
    const router = useRouter();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState({ name: '', quantity: 0, cost: 0, paidBy: '', paymentClear: false });

    useEffect(() => {
        loadInventoryItems();
    }, []);

    const loadInventoryItems = async () => {
        try {
            setLoading(true);
            const inventoryItems = await getInventoryItems();
            setItems(inventoryItems);
        } catch (error) {
            console.error('Error loading inventory items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            await createInventoryItem({
                name: formData.name.trim(),
                quantity: formData.quantity,
                cost: formData.cost,
                paidBy: formData.paidBy as 'dh' | 'ks' | 'zc',
                paymentClear: formData.paymentClear
            });
            setFormData({ name: '', quantity: 0, cost: 0, paidBy: '', paymentClear: false });
            setShowModal(false);
            loadInventoryItems();
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item. Please try again.');
        }
    };

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !formData.name.trim()) return;

        try {
            await updateInventoryItem(editingItem.id, {
                name: formData.name.trim(),
                quantity: formData.quantity,
                cost: formData.cost,
                paidBy: formData.paidBy as 'dh' | 'ks' | 'zc',
                paymentClear: formData.paymentClear
            });
            setEditingItem(null);
            setFormData({ name: '', quantity: 0, cost: 0, paidBy: '', paymentClear: false });
            setShowModal(false);
            loadInventoryItems();
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item. Please try again.');
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await deleteInventoryItem(itemId);
            loadInventoryItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again.');
        }
    };

    const startEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            quantity: item.quantity,
            cost: item.cost,
            paidBy: item.paidBy,
            paymentClear: item.paymentClear
        });
        setShowModal(true);
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setFormData({ name: '', quantity: 0, cost: 0, paidBy: '', paymentClear: false });
        setShowModal(false);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-lg text-gray-600">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
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
                                    Inventory Management
                                </h1>
                                <p className="text-sm lg:text-base text-gray-600 hidden sm:block">
                                    Manage your parts and supplies
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
                {/* Stats and Controls */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                        {/* Stats Cards */}
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{items.length}</div>
                                    <div className="text-sm text-gray-600">Total Items</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Package className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
                                    <div className="text-sm text-gray-600">Total Quantity</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={() => {
                                    setFormData({ name: '', quantity: 0, cost: 0, paidBy: '', paymentClear: false });
                                    setShowModal(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Add Item</span>
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search inventory items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Inventory List */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {searchQuery ? 'No items found' : 'No inventory items'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery
                                    ? 'Try adjusting your search terms'
                                    : 'Start by adding your first inventory item'
                                }
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => {
                                        setFormData({ name: '', quantity: 0, cost: 0, paidBy: '', paymentClear: false });
                                        setShowModal(true);
                                    }}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add First Item
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {/* Mobile View */}
                            <div className="block md:hidden">
                                {filteredItems.map((item) => (
                                    <div key={item.id} className="p-4 border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="space-y-1">
                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                                    <div>RM {item.cost.toFixed(2)}</div>
                                                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                                        {item.paidBy || 'N/A'}
                                                    </div>
                                                    {item.paymentClear ? (
                                                        <span className="inline-flex items-center gap-1 text-green-600">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-red-600">
                                                            <X className="w-4 h-4" />
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="text-gray-900">
                                                Quantity: <span className="font-medium">{item.quantity}</span>
                                            </div>
                                            <div className="text-gray-600">
                                                {item.updatedAt.toLocaleDateString('en-MY')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View */}
                            <table className="hidden md:table w-full">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200/50">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div>RM {item.cost.toFixed(2)}</div>
                                                        <div>
                                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                                                {item.paidBy || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            {item.paymentClear ? (
                                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Paid
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-red-600">
                                                                    <X className="w-4 h-4" />
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-900">{item.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.updatedAt.toLocaleDateString('en-MY')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => startEdit(item)}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Item Modal (Add/Edit) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </h2>
                            <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Item Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter item name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                        min="0"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter quantity"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cost" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cost (RM)
                                    </label>
                                    <input
                                        type="number"
                                        id="cost"
                                        value={formData.cost}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter cost"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="paidBy" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Paid By
                                    </label>
                                    <select
                                        id="paidBy"
                                        value={formData.paidBy}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paidBy: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="">Select...</option>
                                        <option value="dh">dh</option>
                                        <option value="ks">ks</option>
                                        <option value="zc">zc</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="paymentClear"
                                        checked={formData.paymentClear}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paymentClear: e.target.checked }))}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="paymentClear" className="ml-2 block text-sm font-semibold text-gray-700">
                                        Payment Clear
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
                                    >
                                        {editingItem ? 'Save Changes' : 'Add Item'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
