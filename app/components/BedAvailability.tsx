'use client';

import React, { useState, useEffect } from 'react';
import { Bed, Plus, CheckCircle, XCircle, AlertTriangle, Clock, User, Calendar, Phone, FileText } from 'lucide-react';
import { useApp, BedRequest } from '../context/AppContext';

const BedAvailability: React.FC = () => {
  const { beds, patients, bedRequests, addBedRequest, updateBedRequest, loadBeds, loadPatients, addNotification, currentUser, t } = useApp();

  useEffect(() => {
    loadBeds();
    loadPatients();
  }, []);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedBed, setSelectedBed] = useState<string>('');

  // Patient Leaving Notification State
  const [showLeavingModal, setShowLeavingModal] = useState(false);
  const [leavingPatientId, setLeavingPatientId] = useState('');
  const [leavingReason, setLeavingReason] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

  const availableBeds = beds.filter(bed => bed.status === 'available');
  const occupiedBeds = beds.filter(bed => bed.status === 'occupied');
  const maintenanceBeds = beds.filter(bed => bed.status === 'maintenance');

  // Get patients who have beds assigned (admitted patients)
  const admittedPatients = patients.filter(p => p.bed_id);

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
      case 'maintenance': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Bed className="w-4 h-4 text-gray-600" />;
    }
  };

  // Handle patient leaving notification
  const handleNotifyLeaving = async () => {
    if (!leavingPatientId) return;

    const patient = patients.find(p => p.id === leavingPatientId);
    if (!patient) return;

    setIsNotifying(true);
    try {
      // Create notification for hospital staff
      await addNotification({
        user_role: 'hospital',
        type: 'patient_discharge_request',
        title: 'Patient Ready for Discharge',
        message: `Patient ${patient.name} (ID: ${patient.id}) is ready to be discharged. Reason: ${leavingReason || 'Health worker request'}. Reported by: ${currentUser?.name || 'Health Worker'}`,
        priority: 'high',
        action_required: true,
        is_read: false,
      });

      setNotifySuccess(true);
      setTimeout(() => {
        setShowLeavingModal(false);
        setLeavingPatientId('');
        setLeavingReason('');
        setNotifySuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsNotifying(false);
    }
  };

  const BedRequestForm = () => {
    const [formData, setFormData] = useState({
      patient_id: '',
      urgency_level: 'medium' as 'low' | 'medium' | 'high' | 'critical',
      medical_justification: '',
      current_condition: '',
      estimated_stay_duration: '',
      special_requirements: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addBedRequest({
        ...formData,
        requested_by: currentUser?.id,
        request_date: new Date().toISOString().split('T')[0],
        estimated_stay_duration: parseInt(formData.estimated_stay_duration),
        status: 'pending',
      });
      setShowRequestForm(false);
      setFormData({
        patient_id: '',
        urgency_level: 'medium',
        medical_justification: '',
        current_condition: '',
        estimated_stay_duration: '',
        special_requirements: '',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('bed.request')}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.patient')}</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('patient.selectPatient')}</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.urgencyLevel')}</label>
              <select
                value={formData.urgency_level}
                onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value as 'low' | 'medium' | 'high' | 'critical' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">{t('urgency.low')}</option>
                <option value="medium">{t('urgency.medium')}</option>
                <option value="high">{t('urgency.high')}</option>
                <option value="critical">{t('urgency.critical')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.medicalJustification')}</label>
              <textarea
                required
                value={formData.medical_justification}
                onChange={(e) => setFormData({ ...formData, medical_justification: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide medical justification for bed request..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Condition</label>
              <textarea
                required
                value={formData.current_condition}
                onChange={(e) => setFormData({ ...formData, current_condition: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe patient's current condition..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.estimatedStay')}</label>
              <input
                type="number"
                required
                value={formData.estimated_stay_duration}
                onChange={(e) => setFormData({ ...formData, estimated_stay_duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bed.specialRequirements')}</label>
              <textarea
                value={formData.special_requirements}
                onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or considerations..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('common.submit')} Request
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('bed.availability')}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowLeavingModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Notify Patient Leaving</span>
            </button>
            <button
              onClick={() => setShowRequestForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('bed.request')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beds.map(bed => {
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
                <div className="bg-gray-50 p-4 rounded-md">
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
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bed Requests</h3>
        <div className="space-y-4">
          {bedRequests.slice(0, 5).map(request => {
            const patient = patients.find(p => p.id === request.patient_id);
            return (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{patient?.name}</h4>
                    <p className="text-sm text-gray-600">
                      {request.urgency_level} urgency • {request.estimated_stay_duration} days
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date(request.request_date).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {t(`common.${request.status}`)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showRequestForm && <BedRequestForm />}

      {/* Patient Leaving Notification Modal */}
      {showLeavingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notify Hospital - Patient Leaving</h3>
              <p className="text-sm text-gray-600 mt-1">
                Send a notification to the hospital staff that a patient is ready to be discharged.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {notifySuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">Notification Sent Successfully!</p>
                  <p className="text-green-600 text-sm">Hospital staff has been notified.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Patient
                    </label>
                    <select
                      value={leavingPatientId}
                      onChange={(e) => setLeavingPatientId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} - {patient.type === 'child' ? 'Child' : 'Pregnant Woman'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Leaving (Optional)
                    </label>
                    <textarea
                      value={leavingReason}
                      onChange={(e) => setLeavingReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., Treatment completed, Patient feeling better, Family request..."
                    />
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-800">
                      <strong>Note:</strong> This will notify the hospital staff that the patient is ready to be discharged. They will then process the discharge and free up the bed.
                    </p>
                  </div>
                </>
              )}
            </div>

            {!notifySuccess && (
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowLeavingModal(false);
                    setLeavingPatientId('');
                    setLeavingReason('');
                  }}
                  disabled={isNotifying}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNotifyLeaving}
                  disabled={isNotifying || !leavingPatientId}
                  className={`px-4 py-2 text-white rounded-md transition-colors ${isNotifying || !leavingPatientId
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                >
                  {isNotifying ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BedAvailability;
