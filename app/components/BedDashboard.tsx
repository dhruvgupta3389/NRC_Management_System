'use client';

import React, { useState, useEffect } from 'react';
import { Bed, Plus, CheckCircle, XCircle, Wrench, User, Calendar, AlertCircle, FileText, Clock } from 'lucide-react';
import { useApp, Bed as BedType } from '../context/AppContext';

const BedDashboard: React.FC = () => {
  const { beds, patients, bedRequests, updateBed, loadBeds, loadPatients, loadBedRequests, dischargePatient, t } = useApp();
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischargeTarget, setDischargeTarget] = useState<{ bedId: string; patientId: string; patientName: string } | null>(null);
  const [dischargeReason, setDischargeReason] = useState('');
  const [isDischarging, setIsDischarging] = useState(false);

  useEffect(() => {
    loadBeds();
    loadPatients();
    loadBedRequests();
  }, []);

  const wards = ['all', ...Array.from(new Set(beds.map(bed => bed.ward)))];

  const filteredBeds = beds.filter(bed => {
    const matchesWard = selectedWard === 'all' || bed.ward === selectedWard;
    const matchesStatus = selectedStatus === 'all' || bed.status === selectedStatus;
    return matchesWard && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'occupied': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-yellow-600" />;
      default: return <Bed className="w-4 h-4 text-gray-600" />;
    }
  };

  const availableBeds = beds.filter(bed => bed.status === 'available');
  const occupiedBeds = beds.filter(bed => bed.status === 'occupied');
  const maintenanceBeds = beds.filter(bed => bed.status === 'maintenance');
  const pendingRequests = bedRequests.filter(req => req.status === 'pending');

  const openDischargeModal = (bedId: string, patientId: string, patientName: string) => {
    setDischargeTarget({ bedId, patientId, patientName });
    setDischargeReason('');
    setShowDischargeModal(true);
  };

  const handleDischarge = async () => {
    if (!dischargeTarget) return;

    setIsDischarging(true);
    try {
      await dischargePatient(dischargeTarget.patientId, dischargeTarget.bedId, dischargeReason || 'Patient discharged');
      setShowDischargeModal(false);
      setDischargeTarget(null);
      setDischargeReason('');
    } catch (error) {
      console.error('Error discharging patient:', error);
    } finally {
      setIsDischarging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bed Availability Dashboard</h2>
            <p className="text-gray-600">Real-time bed status and management for NRC-equipped hospital</p>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">{t('bed.available')}</p>
                <p className="text-2xl font-bold text-green-800">{availableBeds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">{t('bed.occupied')}</p>
                <p className="text-2xl font-bold text-red-800">{occupiedBeds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Wrench className="w-6 h-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600">{t('bed.maintenance')}</p>
                <p className="text-2xl font-bold text-yellow-800">{maintenanceBeds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Bed className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Total Beds</p>
                <p className="text-2xl font-bold text-blue-800">{beds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-orange-600">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-800">{pendingRequests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {wards.map(ward => (
                <option key={ward} value={ward}>
                  {ward === 'all' ? 'All Wards' : ward}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by {t('common.status')}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="available">{t('bed.available')}</option>
              <option value="occupied">{t('bed.occupied')}</option>
              <option value="maintenance">{t('bed.maintenance')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Capacity Alert */}
      {availableBeds.length <= 2 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Critical Bed Shortage</h3>
              <p className="text-sm text-red-600 mt-1">
                Only {availableBeds.length} beds available. Immediate capacity management required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Bed Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Bed Requests ({pendingRequests.length})</h3>
          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map(request => {
              const patient = patients.find(p => p.id === request.patient_id);
              return (
                <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{patient?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {request.urgency_level} urgency • {request.estimated_stay_duration} days • {patient?.type === 'child' ? 'Pediatric' : 'Maternity'} ward
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {new Date(request.request_date).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {request.urgency_level}
                    </span>
                  </div>
                </div>
              );
            })}
            {pendingRequests.length > 5 && (
              <div className="text-center text-sm text-gray-500">
                +{pendingRequests.length - 5} more pending requests
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeds.map(bed => {
          const patient = bed.patient_id ? patients.find(p => p.id === bed.patient_id) : null;

          return (
            <div key={bed.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bed className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Bed {bed.bed_number}</h3>
                    <p className="text-sm text-gray-600">{bed.ward} Ward</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(bed.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bed.status)}`}>
                    {t(`bed.${bed.status}`)}
                  </span>
                </div>
              </div>

              {bed.status === 'occupied' && patient && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{patient.name}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>Admitted: {bed.admission_date ? new Date(bed.admission_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')}
                    </div>
                    <div>
                      <span className="font-medium">{t('common.status')}:</span> {patient.nutrition_status.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {bed.admission_date ?
                        Math.ceil((new Date().getTime() - new Date(bed.admission_date).getTime()) / (1000 * 60 * 60 * 24)) : 0
                      } days
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {bed.status === 'occupied' && patient && (
                  <button
                    onClick={() => openDischargeModal(bed.id, patient.id, patient.name)}
                    className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
                  >
                    Discharge Patient
                  </button>
                )}
                {bed.status === 'maintenance' && (
                  <button
                    onClick={() => updateBed(bed.id, { status: 'available' })}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Mark Available
                  </button>
                )}
                {bed.status === 'available' && (
                  <>
                    <button
                      onClick={() => updateBed(bed.id, { status: 'maintenance' })}
                      className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                    >
                      {t('bed.maintenance')}
                    </button>
                    {pendingRequests.length > 0 && (
                      <button
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Assign Patient
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ward Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ward Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wards.filter(ward => ward !== 'all').map(ward => {
            const wardBeds = beds.filter(bed => bed.ward === ward);
            const wardAvailable = wardBeds.filter(bed => bed.status === 'available').length;
            const wardOccupied = wardBeds.filter(bed => bed.status === 'occupied').length;
            const wardMaintenance = wardBeds.filter(bed => bed.status === 'maintenance').length;
            const occupancyRate = wardBeds.length > 0 ? Math.round((wardOccupied / wardBeds.length) * 100) : 0;

            return (
              <div key={ward} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">{ward} Ward</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Beds:</span>
                    <span className="font-medium">{wardBeds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Available:</span>
                    <span className="font-medium text-green-600">{wardAvailable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Occupied:</span>
                    <span className="font-medium text-red-600">{wardOccupied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Maintenance:</span>
                    <span className="font-medium text-yellow-600">{wardMaintenance}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Occupancy Rate:</span>
                    <span className={`font-medium ${occupancyRate > 80 ? 'text-red-600' : occupancyRate > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {occupancyRate}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discharge Modal */}
      {showDischargeModal && dischargeTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Discharge Patient</h3>
              <p className="text-sm text-gray-600 mt-1">
                You are discharging <strong>{dischargeTarget.patientName}</strong>
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> The bed will be set to "Maintenance" after discharge.
                  The patient record will be archived but can be reactivated later.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discharge Reason / Notes
                </label>
                <textarea
                  value={dischargeReason}
                  onChange={(e) => setDischargeReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter discharge reason or notes (optional)..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDischargeModal(false);
                  setDischargeTarget(null);
                  setDischargeReason('');
                }}
                disabled={isDischarging}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDischarge}
                disabled={isDischarging}
                className={`px-4 py-2 text-white rounded-md transition-colors ${isDischarging
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                  }`}
              >
                {isDischarging ? 'Processing...' : 'Confirm Discharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedDashboard;
