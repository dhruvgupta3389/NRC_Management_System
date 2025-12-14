'use client';

import React, { useState } from 'react';
import { Bed, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AddBed: React.FC = () => {
    const { loadBeds, t } = useApp();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        bedNumber: '',
        ward: 'Pediatric',
        status: 'available' as 'available' | 'occupied' | 'maintenance' | 'reserved',
        hospitalId: '', // Will be set based on logged-in hospital user or default
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await fetch('/api/beds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bedNumber: formData.bedNumber,
                    ward: formData.ward,
                    status: formData.status,
                    hospitalId: formData.hospitalId || undefined,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create bed');
            }

            setSuccessMessage(`Bed ${formData.bedNumber} has been successfully added to ${formData.ward} Ward!`);
            setFormData({
                bedNumber: '',
                ward: 'Pediatric',
                status: 'available',
                hospitalId: '',
            });

            // Reload beds to reflect the new addition
            loadBeds();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to add bed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Add New Bed</h2>
                        <p className="text-gray-600">Register a new bed in the hospital inventory</p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium text-green-800">Success!</h3>
                            <p className="text-sm text-green-600 mt-1">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Bed Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bed Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bed Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.bedNumber}
                                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., B001, P-101"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter a unique bed identifier</p>
                        </div>

                        {/* Ward */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ward <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.ward}
                                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Pediatric">Pediatric Ward</option>
                                <option value="Maternity">Maternity Ward</option>
                                <option value="General">General Ward</option>
                                <option value="ICU">ICU</option>
                                <option value="Emergency">Emergency Ward</option>
                                <option value="Recovery">Recovery Ward</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Select the ward for this bed</p>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Initial Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'occupied' | 'maintenance' | 'reserved' })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="available">Available</option>
                                <option value="maintenance">Under Maintenance</option>
                                <option value="reserved">Reserved</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Set the initial availability status</p>
                        </div>

                        {/* Hospital ID (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hospital ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.hospitalId}
                                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Auto-assigned if left empty"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty for default hospital</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setFormData({
                                bedNumber: '',
                                ward: 'Pediatric',
                                status: 'available',
                                hospitalId: '',
                            })}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Reset Form
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <Bed className="w-5 h-5" />
                            <span>{isSubmitting ? 'Adding Bed...' : 'Add Bed'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Tips</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Use a consistent bed numbering format (e.g., P-101 for Pediatric bed 101)</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>New beds are typically added as "Available" unless under maintenance</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>You can manage bed status from the Bed Dashboard after creation</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Pediatric and Maternity wards are primary wards for NRC patients</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AddBed;
