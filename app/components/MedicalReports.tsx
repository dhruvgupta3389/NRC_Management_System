'use client';

import React, { useEffect } from 'react';
import { FileText, Download, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MedicalReports: React.FC = () => {
  const { patients, loadPatients, t } = useApp();
  const records: any[] = [];

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('medical.reports')}</h2>
        <p className="text-gray-600">View and download patient medical reports</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Medical Records</h3>
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No medical records available yet</p>
            </div>
          ) : (
            records.slice(0, 10).map((record: any) => {
              const patient = patients.find(p => p.id === record.patientId);
              return (
                <div key={record.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{patient?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {t(`medical.${record.visitType}`)} • {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">{t('common.download')}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalReports;
