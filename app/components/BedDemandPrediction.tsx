'use client';

import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const BedDemandPrediction: React.FC = () => {
  const { beds, patients } = useApp();

  const occupancyRate = (beds.filter(b => b.status === 'occupied').length / beds.length) * 100;
  const prediction = occupancyRate > 70 ? 'High Demand' : occupancyRate > 50 ? 'Medium Demand' : 'Low Demand';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bed Demand Prediction</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Current Occupancy</p>
                <p className="text-2xl font-bold text-blue-800">{Math.round(occupancyRate)}%</p>
              </div>
            </div>
          </div>
          <div className={`${prediction === 'High Demand' ? 'bg-red-50' : prediction === 'Medium Demand' ? 'bg-yellow-50' : 'bg-green-50'} p-4 rounded-lg`}>
            <div className="flex items-center">
              <AlertTriangle className={`w-6 h-6 mr-2 ${
                prediction === 'High Demand' ? 'text-red-600' : 
                prediction === 'Medium Demand' ? 'text-yellow-600' : 
                'text-green-600'
              }`} />
              <div>
                <p className={`text-sm ${
                  prediction === 'High Demand' ? 'text-red-600' : 
                  prediction === 'Medium Demand' ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>Predicted Demand</p>
                <p className={`text-2xl font-bold ${
                  prediction === 'High Demand' ? 'text-red-800' : 
                  prediction === 'Medium Demand' ? 'text-yellow-800' : 
                  'text-green-800'
                }`}>{prediction}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600">Growth Rate</p>
                <p className="text-2xl font-bold text-purple-800">+12%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">This Week</span>
              <span className="text-sm text-gray-600">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Last Week</span>
              <span className="text-sm text-gray-600">58%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '58%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedDemandPrediction;
