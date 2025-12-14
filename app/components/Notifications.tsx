'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Clock, User, Calendar, Eye, AreaChart as MarkAsUnread, LogOut } from 'lucide-react';
import { useApp, Notification } from '../context/AppContext';

const Notifications: React.FC = () => {
  const { notifications, markNotificationRead, loadNotifications, t, dischargePatient, patients, beds, updateBed } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);
  const [filterType, setFilterType] = useState<'all' | 'admission_status' | 'bed_approval' | 'supervisor_instruction' | 'high_risk_alert' | 'bed_request' | 'discharge_tracking' | 'patient_discharge_request'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' ||
      (filterRead === 'read' && notification.is_read) ||
      (filterRead === 'unread' && !notification.is_read);
    return matchesType && matchesRead;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admission_status': return 'bg-blue-100 text-blue-800';
      case 'bed_approval': return 'bg-green-100 text-green-800';
      case 'supervisor_instruction': return 'bg-purple-100 text-purple-800';
      case 'high_risk_alert': return 'bg-red-100 text-red-800';
      case 'bed_request': return 'bg-yellow-100 text-yellow-800';
      case 'discharge_tracking': return 'bg-indigo-100 text-indigo-800';
      case 'patient_discharge_request': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admission_status': return <User className="w-4 h-4" />;
      case 'bed_approval': return <CheckCircle className="w-4 h-4" />;
      case 'supervisor_instruction': return <Bell className="w-4 h-4" />;
      case 'high_risk_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'bed_request': return <Clock className="w-4 h-4" />;
      case 'discharge_tracking': return <Calendar className="w-4 h-4" />;
      case 'patient_discharge_request': return <User className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.is_read).length;

  // Handle release bed action for patient discharge requests
  const handleReleaseBed = async (notification: Notification) => {
    setProcessingId(notification.id);
    try {
      // Extract patient ID from the notification message
      // Message format: "Patient Name (ID: uuid) is ready to be discharged..."
      const idMatch = notification.message.match(/\(ID: ([a-f0-9-]+)\)/i);
      if (idMatch && idMatch[1]) {
        const patientId = idMatch[1];
        const patient = patients.find(p => p.id === patientId);

        if (patient) {
          // Find the bed assigned to this patient
          const bed = beds.find(b => b.patient_id === patientId);
          const bedId = bed?.id || patient.bed_id || '';

          // Discharge the patient (will also update bed status)
          await dischargePatient(patientId, bedId, 'Discharged via notification - Health worker request');

          // Mark notification as read
          await markNotificationRead(notification.id);

          alert('✅ Patient discharged and bed released successfully!');
        } else {
          alert('⚠️ Patient not found. They may have already been discharged.');
          await markNotificationRead(notification.id);
        }
      } else {
        alert('⚠️ Could not find patient ID in notification. Please use Bed Dashboard.');
      }
    } catch (error) {
      console.error('Error releasing bed:', error);
      alert('❌ Error processing discharge. Please try again or use Bed Dashboard.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('nav.notifications')}</h2>
            <p className="text-gray-600">Stay updated with important alerts and messages</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{unreadCount} unread</span>
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{criticalCount} critical</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'admission_status' | 'bed_approval' | 'supervisor_instruction' | 'high_risk_alert' | 'bed_request' | 'discharge_tracking' | 'patient_discharge_request')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="admission_status">{t('notification.admissionStatus')}</option>
              <option value="bed_approval">{t('notification.bedApproval')}</option>
              <option value="supervisor_instruction">{t('notification.supervisorInstruction')}</option>
              <option value="high_risk_alert">{t('notification.highRiskAlert')}</option>
              <option value="bed_request">{t('notification.bedRequest')}</option>
              <option value="discharge_tracking">{t('notification.dischargeTracking')}</option>
              <option value="patient_discharge_request">Patient Leaving Request</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-800">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <MarkAsUnread className="w-6 h-6 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600">Unread</p>
              <p className="text-2xl font-bold text-orange-800">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600">Critical</p>
              <p className="text-2xl font-bold text-red-800">{criticalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">Action Required</p>
              <p className="text-2xl font-bold text-green-800">
                {notifications.filter(n => n.action_required && !n.is_read).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ${!notification.is_read ? 'border-l-4 border-l-blue-500' : ''
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {t(`notification.${notification.type}`)}
                      </span>
                      {notification.action_required && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'} mb-3`}>
                      {notification.message}
                    </p>
                    {notification.type === 'patient_discharge_request' && notification.action_required && !notification.is_read && (
                      <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-orange-800 font-medium">
                            📋 This patient is ready to be discharged
                          </p>
                          <button
                            onClick={() => handleReleaseBed(notification)}
                            disabled={processingId === notification.id}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${processingId === notification.id
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{processingId === notification.id ? 'Processing...' : 'Release Bed'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{notification.user_role}</span>
                      </div>
                      {notification.priority === 'critical' && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Critical Priority</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => markNotificationRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Mark as read"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-right">
                    <div className={`text-xs ${!notification.is_read ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                      {!notification.is_read ? 'Unread' : 'Read'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
