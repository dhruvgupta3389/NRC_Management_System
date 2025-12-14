'use client';

import React, { useState, useEffect } from 'react';
import { User, Search, Bed, Calendar, RefreshCcw, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { useApp, Patient } from '../context/AppContext';

const DischargedPatients: React.FC = () => {
    const { archivedPatients, beds, loadArchivedPatients, loadBeds, reactivatePatient, t } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showReAdmitModal, setShowReAdmitModal] = useState(false);
    const [selectedBedId, setSelectedBedId] = useState<string>('');
    const [isReactivating, setIsReactivating] = useState(false);

    useEffect(() => {
        loadArchivedPatients();
        loadBeds();
    }, []);

    const availableBeds = beds.filter(bed => bed.status === 'available');

    const filteredPatients = archivedPatients.filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        return (
            patient.name.toLowerCase().includes(searchLower) ||
            patient.registration_number.toLowerCase().includes(searchLower) ||
            (patient.contact_number && patient.contact_number.includes(searchTerm))
        );
    });

    const openReAdmitModal = (patient: Patient) => {
        setSelectedPatient(patient);
        setSelectedBedId('');
        setShowReAdmitModal(true);
    };

    const handleReAdmit = async () => {
        if (!selectedPatient) return;

        setIsReactivating(true);
        try {
            await reactivatePatient(selectedPatient.id, selectedBedId || undefined);
            setShowReAdmitModal(false);
            setSelectedPatient(null);
            setSelectedBedId('');
            // Reload the archived patients list
            loadArchivedPatients();
        } catch (error) {
            console.error('Error re-admitting patient:', error);
        } finally {
            setIsReactivating(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Discharged Patients</h2>
                            <p className="text-gray-600">View and manage previously discharged patient records</p>
                        </div>
                    </div>
                    <button
                        onClick={() => loadArchivedPatients()}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <User className="w-6 h-6 text-gray-600 mr-2" />
                            <div>
                                <p className="text-sm text-gray-600">Total Discharged</p>
                                <p className="text-2xl font-bold text-gray-800">{archivedPatients.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Bed className="w-6 h-6 text-green-600 mr-2" />
                            <div>
                                <p className="text-sm text-green-600">Available Beds</p>
                                <p className="text-2xl font-bold text-green-800">{availableBeds.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
                            <div>
                                <p className="text-sm text-blue-600">Can Re-admit</p>
                                <p className="text-2xl font-bold text-blue-800">{availableBeds.length > 0 ? 'Yes' : 'No Beds'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, registration number, or contact..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Patient List */}
            <div className="space-y-4">
                {filteredPatients.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">
                            {searchTerm ? 'No patients found matching your search' : 'No discharged patients found'}
                        </p>
                    </div>
                ) : (
                    filteredPatients.map(patient => (
                        <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {patient.registration_number} • {patient.type === 'child' ? 'Child' : 'Pregnant Woman'} • Age: {patient.age}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openReAdmitModal(patient)}
                                    disabled={availableBeds.length === 0}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${availableBeds.length === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    <span>Re-admit</span>
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Discharge Date</span>
                                    </div>
                                    <p className="font-medium text-gray-900">{formatDate(patient.discharge_date)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span>Last Admission</span>
                                    </div>
                                    <p className="font-medium text-gray-900">{formatDate(patient.last_admission_date)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Nutrition Status</span>
                                    </div>
                                    <p className="font-medium text-gray-900">{patient.nutrition_status || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                        <FileText className="w-4 h-4" />
                                        <span>Discharge Reason</span>
                                    </div>
                                    <p className="font-medium text-gray-900 truncate">{patient.discharge_reason || 'Not specified'}</p>
                                </div>
                            </div>

                            {patient.contact_number && (
                                <div className="mt-3 text-sm text-gray-600">
                                    <span className="font-medium">Contact:</span> {patient.contact_number}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Re-admit Modal */}
            {showReAdmitModal && selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Re-admit Patient</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Re-admitting <strong>{selectedPatient.name}</strong>
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Patient Info:</strong><br />
                                    Registration: {selectedPatient.registration_number}<br />
                                    Type: {selectedPatient.type === 'child' ? 'Child' : 'Pregnant Woman'}<br />
                                    Last Discharge: {formatDate(selectedPatient.discharge_date)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Bed (Optional)
                                </label>
                                {availableBeds.length === 0 ? (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-sm text-yellow-800">
                                            No available beds. Patient will be reactivated without bed assignment.
                                        </p>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedBedId}
                                        onChange={(e) => setSelectedBedId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">No bed assignment (reactivate only)</option>
                                        {availableBeds.map(bed => (
                                            <option key={bed.id} value={bed.id}>
                                                Bed {bed.bed_number} - {bed.ward} Ward
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowReAdmitModal(false);
                                    setSelectedPatient(null);
                                    setSelectedBedId('');
                                }}
                                disabled={isReactivating}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReAdmit}
                                disabled={isReactivating}
                                className={`px-4 py-2 text-white rounded-md transition-colors ${isReactivating
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {isReactivating ? 'Processing...' : 'Confirm Re-admit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DischargedPatients;
