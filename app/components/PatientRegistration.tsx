'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Baby, Heart, FileText, Camera, Upload, AlertTriangle } from 'lucide-react';
import { useApp, Patient } from '../context/AppContext';

const PatientRegistration: React.FC = () => {
  const { patients, addPatient, currentUser, loadPatients, t } = useApp();

  useEffect(() => {
    loadPatients();
  }, []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    aadhaar_number: '',
    age: '',
    type: 'child' as 'child' | 'pregnant_woman' | 'lactating_mother',
    pregnancy_week: '',
    contact_number: '',
    address: '',
    weight: '',
    height: '',
    blood_pressure: '',
    temperature: '',
    symptoms: '',
    documents: '',
    photos: '',
    remarks: '',
    nutrition_status: 'severely_malnourished' as 'normal' | 'malnourished' | 'severely_malnourished'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPatient: Omit<Patient, 'id' | 'registration_number' | 'created_at' | 'updated_at'> = {
      name: formData.name,
      aadhaar_number: formData.aadhaar_number || undefined,
      age: parseInt(formData.age),
      type: formData.type as 'child' | 'pregnant_woman' | 'lactating_mother',
      pregnancy_week: formData.pregnancy_week ? parseInt(formData.pregnancy_week) : undefined,
      contact_number: formData.contact_number,
      address: formData.address,
      weight: parseFloat(formData.weight) || undefined,
      height: parseFloat(formData.height) || undefined,
      blood_pressure: formData.blood_pressure || undefined,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      medical_history: [],
      symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s),
      remarks: formData.remarks || undefined,
      nutrition_status: formData.nutrition_status,
      risk_score: formData.nutrition_status === 'severely_malnourished' ? 85 :
                 formData.nutrition_status === 'malnourished' ? 60 : 30,
      nutritional_deficiency: formData.nutrition_status === 'severely_malnourished' ?
                           ['Protein', 'Iron', 'Vitamin D'] :
                           formData.nutrition_status === 'malnourished' ?
                           ['Iron', 'Vitamin D'] : [],
      registration_date: new Date().toISOString().split('T')[0],
      registered_by: currentUser?.id,
      is_active: true,
      next_visit_date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    addPatient(newPatient);
    setShowAddForm(false);
    setFormData({
      name: '',
      aadhaar_number: '',
      age: '',
      type: 'child',
      pregnancy_week: '',
      contact_number: '',
      address: '',
      weight: '',
      height: '',
      blood_pressure: '',
      temperature: '',
      symptoms: '',
      documents: '',
      photos: '',
      remarks: '',
      nutrition_status: 'severely_malnourished'
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.aadhaar_number && patient.aadhaar_number.includes(searchTerm))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'malnourished': return 'bg-yellow-100 text-yellow-800';
      case 'severely_malnourished': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('patient.registration')}</h2>
            <p className="text-gray-600">Register SAM children and pregnant women with Aadhaar verification</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or Aadhaar number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <User className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">Total Registered</p>
              <p className="text-2xl font-bold text-blue-800">{patients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Baby className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">Children</p>
              <p className="text-2xl font-bold text-green-800">
                {patients.filter(p => p.type === 'child').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Heart className="w-6 h-6 text-pink-600 mr-2" />
            <div>
              <p className="text-sm text-pink-600">Pregnant Women</p>
              <p className="text-2xl font-bold text-pink-800">
                {patients.filter(p => p.type === 'pregnant_woman').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600">SAM Cases</p>
              <p className="text-2xl font-bold text-red-800">
                {patients.filter(p => p.nutrition_status === 'severely_malnourished').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registered Patients</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredPatients.map((patient: Patient) => (
            <div key={patient.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {patient.type === 'child' ? (
                      <Baby className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Heart className="w-6 h-6 text-pink-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                    <p className="text-sm text-gray-600">
                      {patient.type === 'child' ? 'Child' : 'Pregnant Woman'} • Age: {patient.age}
                      {patient.pregnancy_week && ` • ${patient.pregnancy_week} weeks`}
                    </p>
                    <p className="text-xs text-gray-500">Aadhaar: {patient.aadhaar_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.nutrition_status)}`}>
                      {patient.nutrition_status === 'severely_malnourished' ? 'SAM' : 
                       patient.nutrition_status === 'malnourished' ? 'MAM' : 'Normal'}
                    </span>
                    {patient.risk_score && (
                      <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(patient.risk_score)}`}>
                        Risk: {patient.risk_score}%
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Weight: {patient.weight} kg</div>
                    <div>Height: {patient.height} cm</div>
                  </div>
                </div>
              </div>
              
              {patient.symptoms && patient.symptoms.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.symptoms.map((symptom: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.nutritional_deficiency && patient.nutritional_deficiency.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Nutritional Deficiencies:</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.nutritional_deficiency.map((deficiency: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                        {deficiency}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {patient.remarks && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{patient.remarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Register New Patient</h3>
              <p className="text-sm text-gray-600">Register SAM children or pregnant women with complete details</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}"
                      placeholder="1234-5678-9012"
                      value={formData.aadhaar_number}
                      onChange={(e) => setFormData({...formData, aadhaar_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'child' | 'pregnant_woman' | 'lactating_mother'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="child">Child</option>
                      <option value="pregnant_woman">Pregnant Woman</option>
                      <option value="lactating_mother">Lactating Mother</option>
                    </select>
                  </div>
                  {formData.type === 'pregnant_woman' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy Week</label>
                      <input
                        type="number"
                        min="1"
                        max="42"
                        value={formData.pregnancy_week}
                        onChange={(e) => setFormData({...formData, pregnancy_week: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_number}
                      onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Medical Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm) *</label>
                    <input
                      type="number"
                      required
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={formData.blood_pressure}
                      onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nutrition Status *</label>
                    <select
                      value={formData.nutrition_status}
                      onChange={(e) => setFormData({...formData, nutrition_status: e.target.value as 'normal' | 'malnourished' | 'severely_malnourished'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="severely_malnourished">Severely Malnourished (SAM)</option>
                      <option value="malnourished">Malnourished (MAM)</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Weakness, Loss of appetite, Frequent infections"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Documents & Photos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documents (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Aadhaar Card, Birth Certificate"
                      value={formData.documents}
                      onChange={(e) => setFormData({...formData, documents: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photos (comma separated)</label>
                    <input
                      type="text"
                      placeholder="patient_photo.jpg, growth_chart.jpg"
                      value={formData.photos}
                      onChange={(e) => setFormData({...formData, photos: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    rows={3}
                    placeholder="Additional observations and notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegistration;
