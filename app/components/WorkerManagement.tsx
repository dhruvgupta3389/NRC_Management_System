'use client';

import React, { useState } from 'react';
import { Users, Plus, Phone, MapPin, Calendar, Clock, User, Eye, CheckCircle, XCircle, Building } from 'lucide-react';
import { useApp, AnganwadiWorker } from '../context/AppContext';

const WorkerManagement: React.FC = () => {
  const { workers, anganwadis, addWorker, t } = useApp();
  const [selectedWorker, setSelectedWorker] = useState<AnganwadiWorker | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'head' | 'supervisor' | 'helper' | 'asha'>('all');
  const [filterAnganwadi, setFilterAnganwadi] = useState<string>('all');

  const filteredWorkers = workers.filter(worker => {
    const matchesRole = filterRole === 'all' || worker.role === filterRole;
    const matchesAnganwadi = filterAnganwadi === 'all' || worker.anganwadi_id === filterAnganwadi;
    return matchesRole && matchesAnganwadi && worker.is_active;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'head': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'helper': return 'bg-green-100 text-green-800';
      case 'asha': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const WorkerDetailsModal = ({ worker }: { worker: AnganwadiWorker }) => {
    const anganwadi = anganwadis.find(a => a.id === worker.anganwadi_id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                <p className="text-sm text-gray-600">Employee ID: {worker.employee_id}</p>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">{t('common.name')}:</span> {worker.name}</div>
                  <div><span className="font-medium">Employee ID:</span> {worker.employee_id}</div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{worker.contact_number || worker.contactNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Work Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Role:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRoleColor(worker.role)}`}>
                      {t(`worker.${worker.role}`)}
                    </span>
                  </div>
                  {worker.workingHours && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Hours: {worker.workingHours}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    {worker.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={worker.is_active ? 'text-green-600' : 'text-red-600'}>
                      {worker.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {anganwadi && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Anganwadi Assignment</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">{anganwadi?.name}</div>
                      <div className="text-sm text-blue-700">
                        {anganwadi?.location.area}, {anganwadi?.location.district}
                      </div>
                      <div className="text-xs text-blue-600">Code: {anganwadi?.code}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AddWorkerForm = () => {
    const [formData, setFormData] = useState({
      employee_id: '',
      name: '',
      role: 'helper' as string,
      anganwadi_id: '',
      contact_number: '',
      workingHours: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const newWorker: Omit<AnganwadiWorker, 'id' | 'created_at' | 'updated_at'> = {
        employee_id: formData.employee_id,
        name: formData.name,
        role: formData.role,
        anganwadi_id: formData.anganwadi_id || undefined,
        contact_number: formData.contact_number,
        workingHours: formData.workingHours || undefined,
        is_active: true,
      };

      addWorker(newWorker);
      setShowAddForm(false);
      setFormData({
        employee_id: '',
        name: '',
        role: 'helper',
        anganwadi_id: '',
        contact_number: '',
        workingHours: '',
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Add New Worker</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="helper">Helper</option>
                  <option value="head">Head</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="asha">ASHA Worker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anganwadi Assignment</label>
                <select
                  value={formData.anganwadi_id}
                  onChange={(e) => setFormData({ ...formData, anganwadi_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No Assignment</option>
                  {anganwadis.map(anganwadi => (
                    <option key={anganwadi.id} value={anganwadi.id}>
                      {anganwadi.name} - {anganwadi.location.area}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                <input
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="9:00 AM - 5:00 PM"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Worker
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('worker.management')}</h2>
            <p className="text-gray-600">Manage Anganwadi workers and their assignments</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Worker</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Heads</p>
                <p className="text-2xl font-bold text-purple-800">
                  {workers.filter(w => w.role === 'head' && w.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Supervisors</p>
                <p className="text-2xl font-bold text-blue-800">
                  {workers.filter(w => w.role === 'supervisor' && w.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Helpers</p>
                <p className="text-2xl font-bold text-green-800">
                  {workers.filter(w => w.role === 'helper' && w.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-orange-600">ASHA Workers</p>
                <p className="text-2xl font-bold text-orange-800">
                  {workers.filter(w => w.role === 'asha' && w.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.filter')} by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | 'head' | 'supervisor' | 'helper' | 'asha')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="head">{t('worker.head')}</option>
              <option value="supervisor">{t('worker.supervisor')}</option>
              <option value="helper">{t('worker.helper')}</option>
              <option value="asha">{t('worker.asha')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.filter')} by Anganwadi</label>
            <select
              value={filterAnganwadi}
              onChange={(e) => setFilterAnganwadi(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Anganwadis</option>
              {anganwadis.map(anganwadi => (
                <option key={anganwadi.id} value={anganwadi.id}>
                  {anganwadi.name} - {anganwadi.location.area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkers.map(worker => {
          const anganwadi = anganwadis.find(a => a.id === worker.anganwadi_id);

          return (
            <div key={worker.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                    <p className="text-sm text-gray-600">ID: {worker.employee_id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(worker.role)}`}>
                    {t(`worker.${worker.role}`)}
                  </span>
                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{worker.contact_number || worker.contactNumber || 'N/A'}</span>
                </div>

                {anganwadi && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Anganwadi Assignment</h4>
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                      <Building className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm text-blue-900">{anganwadi?.name}</div>
                        <div className="text-xs text-blue-700">{anganwadi?.location.area}</div>
                      </div>
                    </div>
                  </div>
                )}

                {worker.workingHours && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Working Hours</h4>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{worker.workingHours}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs ${worker.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {worker.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedWorker && <WorkerDetailsModal worker={selectedWorker} />}
      {showAddForm && <AddWorkerForm />}
    </div>
  );
};

export default WorkerManagement;
