'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, User, Clock, CheckCircle, AlertTriangle, RefreshCw, Calendar, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ReleaseBed: React.FC = () => {
    const {
        notifications,
        loadNotifications,
        markNotificationRead,
        patients,
        beds,
        dischargePatient,
        updateBed,
        loadPatients,
        loadBeds,
        t
    } = useApp();

    const [processingId, setProcessingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        loadNotifications();
        loadPatients();
        loadBeds();
    }, []);

    // Filter notifications for patient discharge requests
    const dischargeRequests = notifications.filter(
        n => n.type === 'patient_discharge_request' && !n.is_read
    );

    const processedRequests = notifications.filter(
        n => n.type === 'patient_discharge_request' && n.is_read
    );

    // Handle release bed action
    const handleReleaseBed = async (notification: typeof notifications[0]) => {
        setProcessingId(notification.id);
        setSuccessMessage(null);

        try {
            // Extract patient ID from the notification message
            const idMatch = notification.message.match(/\(ID: ([a-f0-9-]+)\)/i);

            if (idMatch && idMatch[1]) {
                const patientId = idMatch[1];
                const patient = patients.find(p => p.id === patientId);

                if (patient) {
                    // Find the bed assigned to this patient
                    const bed = beds.find(b => b.patient_id === patientId);
                    const bedId = bed?.id || patient.bed_id || '';

                    console.log('🔍 Release Bed Debug:', {
                        patientId,
                        patientName: patient.name,
                        bedFromList: bed?.id,
                        bedFromPatient: patient.bed_id,
                        finalBedId: bedId,
                        bedsCount: beds.length
                    });

                    // Discharge the patient (will also update bed status)
                    await dischargePatient(patientId, bedId, 'Discharged via Release Bed - Health worker request');

                    // Mark notification as read
                    await markNotificationRead(notification.id);

                    setSuccessMessage(`✅ ${patient.name} has been discharged and bed released successfully!`);

                    // Refresh data
                    await loadNotifications();
                    await loadBeds();
                } else {
                    setSuccessMessage('⚠️ Patient not found. They may have already been discharged.');
                    await markNotificationRead(notification.id);
                }
            } else {
                setSuccessMessage('⚠️ Could not find patient ID in notification.');
            }
        } catch (error) {
            console.error('Error releasing bed:', error);
            setSuccessMessage('❌ Error processing discharge. Please try again.');
        } finally {
            setProcessingId(null);
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
        }
    };

    // Extract patient info from notification message
    const getPatientFromNotification = (notification: typeof notifications[0]) => {
        const idMatch = notification.message.match(/\(ID: ([a-f0-9-]+)\)/i);
        if (idMatch && idMatch[1]) {
            return patients.find(p => p.id === idMatch[1]);
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Release Bed</h2>
                        <p className="text-gray-600">Process discharge requests from Anganwadi Workers</p>
                    </div>
                    <button
                        onClick={() => {
                            loadNotifications();
                            loadPatients();
                            loadBeds();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className={`p-4 rounded-lg border ${successMessage.startsWith('✅')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : successMessage.startsWith('⚠️')
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                        <div>
                            <p className="text-sm text-orange-600">Pending Requests</p>
                            <p className="text-2xl font-bold text-orange-800">{dischargeRequests.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                        <div>
                            <p className="text-sm text-green-600">Processed Today</p>
                            <p className="text-2xl font-bold text-green-800">{processedRequests.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center">
                        <LogOut className="w-6 h-6 text-blue-600 mr-2" />
                        <div>
                            <p className="text-sm text-blue-600">Beds in Maintenance</p>
                            <p className="text-2xl font-bold text-blue-800">{beds.filter(b => b.status === 'maintenance').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Discharge Requests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Discharge Requests</h3>
                </div>

                {dischargeRequests.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                        <p className="text-gray-500">No pending discharge requests</p>
                        <p className="text-sm text-gray-400 mt-1">All requests have been processed</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {dischargeRequests.map(notification => {
                            const patient = getPatientFromNotification(notification);
                            const bed = patient ? beds.find(b => b.patient_id === patient.id) : null;

                            return (
                                <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {patient?.name || 'Unknown Patient'}
                                                    </h4>
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                                        {notification.priority} priority
                                                    </span>
                                                </div>

                                                {patient && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Type:</span>{' '}
                                                            {patient.type === 'child' ? 'Child' : 'Pregnant Woman'}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Age:</span>{' '}
                                                            {patient.age} years
                                                        </div>
                                                        {bed && (
                                                            <div>
                                                                <span className="font-medium">Bed:</span>{' '}
                                                                {bed.bed_number} ({bed.ward})
                                                            </div>
                                                        )}
                                                        {patient.contact_number && (
                                                            <div className="flex items-center space-x-1">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{patient.contact_number}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-700">{notification.message}</p>
                                                </div>

                                                <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Requested: {new Date(notification.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            {Math.round((Date.now() - new Date(notification.created_at).getTime()) / 60000)} mins ago
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleReleaseBed(notification)}
                                            disabled={processingId === notification.id}
                                            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors ${processingId === notification.id
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>{processingId === notification.id ? 'Processing...' : 'Release Bed'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recently Processed */}
            {processedRequests.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Recently Processed</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {processedRequests.slice(0, 5).map(notification => {
                            const patient = getPatientFromNotification(notification);

                            return (
                                <div key={notification.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{patient?.name || 'Unknown Patient'}</p>
                                            <p className="text-sm text-gray-500">
                                                Processed on {new Date(notification.updated_at || notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        Completed
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReleaseBed;
