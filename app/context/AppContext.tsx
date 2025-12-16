'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  employee_id: string;
  username: string;
  name: string;
  role: 'anganwadi_worker' | 'supervisor' | 'hospital' | 'admin';
  contact_number?: string;
  email?: string;
}

export interface Patient {
  id: string;
  registration_number: string;
  aadhaar_number?: string;
  name: string;
  age: number;
  type: 'child' | 'pregnant_woman' | 'lactating_mother';
  pregnancy_week?: number;
  contact_number: string;
  contactNumber?: string;
  emergency_contact?: string;
  address: string;
  weight?: number;
  height?: number;
  blood_pressure?: string;
  temperature?: number;
  hemoglobin?: number;
  nutrition_status: string;
  medical_history?: any[];
  symptoms?: any[];
  remarks?: string;
  risk_score?: number;
  nutritional_deficiency?: any[];
  bed_id?: string;
  last_visit_date?: string;
  next_visit_date?: string;
  registered_by?: string;
  registration_date: string;
  is_active: boolean;
  // Discharge tracking fields
  discharge_date?: string;
  discharge_reason?: string;
  last_bed_id?: string;
  last_admission_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: string;
  hospital_id: string;
  bed_number: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patient_id?: string;
  admission_date?: string;
  patient_name?: string;
  patient_type?: string;
  nutrition_status?: string;
  hospital_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  user_role: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  action_required: boolean;
  is_read: boolean;
  action_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  scheduled_date: string;
  visit_type: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BedRequest {
  id: string;
  patient_id: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  medical_justification: string;
  current_condition: string;
  estimated_stay_duration: number;
  special_requirements?: string;
  requested_by?: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'declined';
  hospitalReferral?: { hospitalName: string; contactNumber: string; referralReason: string; referralDate: string; urgencyLevel?: string };
  reviewedBy?: string;
  reviewDate?: string;
  reviewComments?: string;
  created_at: string;
  updated_at: string;
}

export interface TreatmentTracker {
  id: string;
  patient_id: string;
  hospital_id: string;
  admission_date: string;
  discharge_date?: string;
  treatment_plan: string[];
  medicine_schedule: Array<{ medicine: string; dosage: string; frequency: string }>;
  doctor_remarks: string[];
  daily_progress: Array<{ date: string; weight?: number; appetite?: string; notes?: string }>;
  lab_reports: Array<{ date: string; type: string; results: string }>;
  created_at: string;
  updated_at: string;
}

export interface Anganwadi {
  id: string;
  name: string;
  code?: string;
  location: { area: string; district: string; state?: string; pincode?: string; coordinates?: { latitude: number; longitude: number } };
  contact_number?: string;
  supervisor_id?: string;
  supervisor?: { id: string; name: string; contactNumber?: string; employeeId?: string };
  is_active: boolean;
  capacity?: { pregnantWomen: number; children: number };
  facilities?: string[];
  coverageAreas?: string[];
  establishedDate?: string;
  created_at: string;
  updated_at: string;
}

export interface AnganwadiWorker {
  id: string;
  name: string;
  employee_id: string;
  anganwadi_id?: string;
  role: string;
  contact_number?: string;
  contactNumber?: string;
  workingHours?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnganwadiVisitTicket {
  id: string;
  anganwadi_id: string;
  workerId: string;
  scheduledDate: string;
  scheduledTime: string;
  visitType: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  assignedArea: string;
  targetBeneficiaries: { pregnantWomen: number; children: number };
  reportedBy?: string;
  reportedDate?: string;
  escalationLevel?: string;
  coverageAreas?: string[];
  created_at?: string;
  updated_at?: string;
}

interface AppContextType {
  // Language & Localization
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // User Management
  currentUser: User | null;
  userRole: string | null;
  setCurrentUser: (user: User, role?: string) => void;
  logout: () => void;
  hasAccess: (feature: string) => boolean;

  // Patients
  patients: Patient[];
  archivedPatients: Patient[];
  loadPatients: (registeredBy?: string) => Promise<void>;
  loadArchivedPatients: () => Promise<void>;
  addPatient: (patient: Partial<Patient>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  dischargePatient: (patientId: string, bedId: string, reason?: string) => Promise<void>;
  reactivatePatient: (patientId: string, bedId?: string) => Promise<void>;

  // Beds
  beds: Bed[];
  loadBeds: (hospitalId?: string, status?: string) => Promise<void>;
  updateBed: (id: string, updates: Partial<Bed>) => Promise<void>;

  // Notifications
  notifications: Notification[];
  loadNotifications: (userId?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;

  // Visits
  visits: Visit[];
  loadVisits: (patientId?: string) => Promise<void>;

  // Bed Requests
  bedRequests: BedRequest[];
  loadBedRequests: () => Promise<void>;
  addBedRequest: (request: Omit<BedRequest, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBedRequest: (id: string, updates: Partial<BedRequest>) => Promise<void>;

  // Treatment Trackers
  treatmentTrackers: TreatmentTracker[];
  loadTreatmentTrackers: (patientId?: string) => Promise<void>;
  addTreatmentTracker: (tracker: Omit<TreatmentTracker, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTreatmentTracker: (id: string, updates: Partial<TreatmentTracker>) => Promise<void>;

  // Anganwadi Management
  anganwadis: Anganwadi[];
  workers: AnganwadiWorker[];
  visitTickets: AnganwadiVisitTicket[];
  loadAnganwadis: () => Promise<void>;
  loadWorkers: () => Promise<void>;
  addAnganwadi: (anganwadi: Omit<Anganwadi, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addWorker: (worker: Omit<AnganwadiWorker, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addVisitTicket: (ticket: Omit<AnganwadiVisitTicket, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateVisitTicket: (id: string, updates: Partial<AnganwadiVisitTicket>) => Promise<void>;

  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Translations
const translations: Record<string, Record<string, string>> = {
  en: {
    // System
    'system.title': 'NRC Management System',
    'system.subtitle': 'Nutrition Rehabilitation Center',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.patientRegistration': 'Patient Registration',
    'nav.bedAvailability': 'Bed Availability',
    'nav.notifications': 'Notifications',
    'nav.postHospitalization': 'Post-Hospitalization',
    'nav.aiPrediction': 'AI Predictions',
    'nav.medicalRecords': 'Medical Records',
    'nav.visitScheduling': 'Visit Scheduling',
    'nav.centerManagement': 'Center Management',
    'nav.workerManagement': 'Worker Management',
    'nav.visitTicketing': 'Visit Ticketing',
    'nav.surveyManagement': 'Survey Management',
    'nav.bedCoordination': 'Bed Coordination',
    'nav.admissionTracking': 'Admission Tracking',
    'nav.bedRequests': 'Bed Requests',
    'nav.bedDashboard': 'Bed Dashboard',
    'nav.treatmentTracker': 'Treatment Tracker',
    'nav.medicalReports': 'Medical Reports',
    'nav.bedDemandPrediction': 'Bed Demand Prediction',

    // Medical Records
    'medical.records': 'Medical Records',
    'medical.reports': 'Medical Reports',
    'medical.addMedical': 'Add Medical Record',
    'medical.addRecord': 'Add Record',
    'medical.visitType': 'Visit Type',
    'medical.routine': 'Routine Checkup',
    'medical.followUp': 'Follow-up',
    'medical.emergency': 'Emergency',
    'medical.admission': 'Admission',
    'medical.discharge': 'Discharge',
    'medical.vitalSigns': 'Vital Signs',
    'medical.vitals': 'Vitals',
    'medical.temperature': 'Temperature',
    'medical.temp': 'Temp',
    'medical.bp': 'BP',
    'medical.symptoms': 'Symptoms',
    'medical.diagnosis': 'Diagnosis',
    'medical.nutritionAssessment': 'Nutrition Assessment',
    'medical.clinicalNotes': 'Clinical Notes',
    'medical.followUpRequired': 'Follow-up Required',
    'medical.next_visit_date': 'Next Visit Date',
    'medical.saveRecord': 'Save Record',
    'medical.recordDetails': 'Record Details',
    'medical.medications': 'Medications',
    'medical.labResults': 'Lab Results',
    'medical.hb': 'Hemoglobin',
    'medical.sugar': 'Blood Sugar',
    'medical.protein': 'Protein Level',
    'medical.completeHistory': 'Complete patient medical history',
    'medical.selectPatient': 'Select Patient',
    'medical.choosePatient': 'Choose a patient...',
    'medical.registration': 'Registration',
    'medical.currentWeight': 'Current Weight',
    'medical.totalRecords': 'Total Records',
    'medical.noRecords': 'No medical records found',
    'medical.keyFindings': 'Key Findings',
    'medical.more': 'more',
    'medical.followUpStatus': 'Follow-up Status',

    // Patient
    'patient.child': 'Child',
    'patient.pregnant': 'Pregnant Woman',
    'patient.patient': 'Patient',
    'patient.selectPatient': 'Select Patient',
    'patient.registration': 'Patient Registration',
    'patient.blood_pressure': 'Blood Pressure',
    'patient.nutrition_status': 'Nutrition Status',

    // Common
    'common.commaSeparated': 'comma separated',
    'common.age': 'Age',
    'common.name': 'Name',
    'common.contact': 'Contact',
    'common.status': 'Status',
    'common.filter': 'Filter',
    'common.cancel': 'Cancel',
    'common.notes': 'Notes',
    'common.actions': 'Actions',
    'common.weight': 'Weight',
    'common.height': 'Height',
    'common.download': 'Download',
    'common.required': 'Required',
    'common.pending': 'Pending',
    'common.approved': 'Approved',
    'common.declined': 'Declined',
    'common.all': 'All',

    // Visit
    'visit.scheduling': 'Visit Scheduling',
    'visit.scheduleNew': 'Schedule New Visit',
    'visit.scheduled_date': 'Scheduled Date',
    'visit.schedule': 'Schedule Visit',
    'visit.selectDate': 'Select Date',
    'visit.statusFilter': 'Status Filter',
    'visit.allStatuses': 'All Statuses',
    'visit.scheduled': 'Scheduled',
    'visit.completed': 'Completed',
    'visit.missed': 'Missed',
    'visit.missedVisitsAlert': 'Missed Visits Alert',
    'visit.reschedule': 'Reschedule',
    'visit.viewTicket': 'View Ticket',
    'visit.visitsFor': 'Visits for {date}',
    'visit.noVisits': 'No visits scheduled for this date',
    'visit.healthWorker': 'Health Worker',
    'visit.healthWorkerId': 'Health Worker ID',
    'visit.markComplete': 'Mark Complete',
    'visit.markMissed': 'Mark Missed',
    'visit.nextAttempt': 'Next attempt: {date}',

    // Bed
    'bed.availability': 'Bed Availability',
    'bed.request': 'Request Bed',
    'bed.available': 'Available',
    'bed.occupied': 'Occupied',
    'bed.maintenance': 'Maintenance',
    'bed.urgencyLevel': 'Urgency Level',
    'bed.medicalJustification': 'Medical Justification',
    'bed.estimatedStay': 'Estimated Stay (days)',
    'bed.specialRequirements': 'Special Requirements',
    'bed.requestApproval': 'Bed Request Approval',
    'bed.reviewComments': 'Review Comments',
    'bed.approve': 'Approve',
    'bed.decline': 'Decline',
    'bed.referToHospital': 'Refer to Hospital',
    'bed.hospitalReferral': 'Hospital Referral',
    'bed.hospitalName': 'Hospital Name',
    'bed.referralReason': 'Referral Reason',

    // Survey
    'survey.management': 'Survey Management',
    'survey.reports': 'Survey Reports',
    'survey.submitReport': 'Submit Survey Report',
    'survey.submit': 'Submit',
    'survey.observations': 'Observations',
    'survey.appetite': 'Appetite',
    'survey.poor': 'Poor',
    'survey.moderate': 'Moderate',
    'survey.good': 'Good',
    'survey.foodIntake': 'Food Intake',
    'survey.inadequate': 'Inadequate',
    'survey.adequate': 'Adequate',
    'survey.excessive': 'Excessive',
    'survey.supplements': 'Supplements',
    'survey.symptoms': 'Symptoms',
    'survey.searchReports': 'Search reports...',
    'survey.allPatients': 'All Patients',
    'survey.noReports': 'No survey reports found',
    'survey.medicalObservations': 'Medical Observations',
    'survey.nutritionAssessment': 'Nutrition Assessment',
    'survey.symptomsObserved': 'Symptoms Observed',

    // Worker
    'worker.management': 'Worker Management',
    'worker.head': 'Head',
    'worker.supervisor': 'Supervisor',
    'worker.helper': 'Helper',
    'worker.asha': 'ASHA Worker',

    // Anganwadi
    'anganwadi.centers': 'Anganwadi Centers',

    // AI
    'ai.recommendations': 'AI Recommendations',
  },
  hi: {
    // System
    'system.title': 'एनआरसी प्रबंधन प्रणाली',
    'system.subtitle': 'पोषण पुनर्वास केंद्र',

    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.patientRegistration': 'रोगी पंजीकरण',
    'nav.bedAvailability': 'बिस्तर उपलब्धता',
    'nav.notifications': 'सूचनाएं',
    'nav.postHospitalization': 'पोस्ट-अस्पताल',
    'nav.aiPrediction': 'एआई भविष्यवाणी',
    'nav.medicalRecords': 'चिकित्सा रिकॉर्ड',
    'nav.visitScheduling': 'दौरे की योजना',
    'nav.centerManagement': 'केंद्र प्रबंधन',
    'nav.workerManagement': 'कार्यकर्ता प्रबंधन',
    'nav.visitTicketing': 'दौरा टिकटिंग',
    'nav.surveyManagement': 'सर्वेक्षण प्रबंधन',
    'nav.bedCoordination': 'बिस्तर समन्वय',
    'nav.admissionTracking': 'प्रवेश ट्रैकिंग',
    'nav.bedRequests': 'बिस्तर अनुरोध',
    'nav.bedDashboard': 'बिस्तर डैशबोर्ड',
    'nav.treatmentTracker': 'उपचार ट्रैकर',
    'nav.medicalReports': 'चिकित्सा रिपोर्टें',
    'nav.bedDemandPrediction': 'बिस्तर मांग भविष्यवाणी',

    // Medical Records
    'medical.records': 'चिकित्सा रिकॉर्ड',
    'medical.reports': 'चिकित्सा रिपोर्टें',
    'medical.addMedical': 'चिकित्सा रिकॉर्ड जोड़ें',
    'medical.addRecord': 'रिकॉर्ड जोड़ें',
    'medical.visitType': 'दौरे का प्रकार',
    'medical.routine': 'नियमित जांच',
    'medical.followUp': 'फॉलो-अप',
    'medical.emergency': 'आपातकालीन',
    'medical.admission': 'प्रवेश',
    'medical.discharge': 'छुट्टी',
    'medical.vitalSigns': 'जीवन संकेत',
    'medical.vitals': 'वाइटल्स',
    'medical.temperature': 'तापमान',
    'medical.temp': 'तापमान',
    'medical.bp': 'रक्तचाप',
    'medical.symptoms': 'लक्षण',
    'medical.diagnosis': 'निदान',
    'medical.nutritionAssessment': 'पोषण मूल्यांकन',
    'medical.clinicalNotes': 'क्लिनिकल नोट्स',
    'medical.followUpRequired': 'फॉलो-अप आवश्यक',
    'medical.next_visit_date': 'अगली दौरे की तारीख',
    'medical.saveRecord': 'रिकॉर्ड सहेजें',
    'medical.recordDetails': 'रिकॉर्ड विवरण',
    'medical.medications': 'दवाइयां',
    'medical.labResults': 'लैब परिणाम',
    'medical.hb': 'हीमोग्लोबिन',
    'medical.sugar': 'रक्त शर्करा',
    'medical.protein': 'प्रोटीन स्तर',
    'medical.completeHistory': 'पूर्ण रोगी चिकित्सा इतिहास',
    'medical.selectPatient': 'रोगी चुनें',
    'medical.choosePatient': 'एक रोगी चुनें...',
    'medical.registration': 'पंजीकरण',
    'medical.currentWeight': 'वर्तमान वजन',
    'medical.totalRecords': 'कुल रिकॉर्ड',
    'medical.noRecords': 'कोई चिकित्सा रिकॉर्ड नहीं मिला',
    'medical.keyFindings': 'मुख्य निष्कर्ष',
    'medical.more': 'और',
    'medical.followUpStatus': 'फॉलो-अप स्थिति',

    // Patient
    'patient.child': 'बच्चा',
    'patient.pregnant': 'गर्भवती महिला',
    'patient.patient': 'रोगी',
    'patient.selectPatient': 'रोगी चुनें',
    'patient.registration': 'रोगी पंजीकरण',
    'patient.blood_pressure': 'रक्तचाप',
    'patient.nutrition_status': 'पोषण स्थिति',

    // Common
    'common.commaSeparated': 'अल्पविराम से अलग',
    'common.age': 'आयु',
    'common.name': 'नाम',
    'common.contact': 'संपर्क',
    'common.status': 'स्थिति',
    'common.filter': 'फ़िल्टर',
    'common.cancel': 'रद्द करें',
    'common.notes': 'नोट्स',
    'common.actions': 'कार्रवाई',
    'common.weight': 'वजन',
    'common.height': 'ऊंचाई',
    'common.download': 'डाउनलोड',
    'common.required': 'आवश्यक',
    'common.pending': 'लंबित',
    'common.approved': 'स्वीकृत',
    'common.declined': 'अस्वीकृत',
    'common.all': 'सभी',

    // Visit
    'visit.scheduling': 'दौरे की योजना',
    'visit.scheduleNew': 'नया दौरा निर्धारित करें',
    'visit.scheduled_date': 'निर्धारित तिथि',
    'visit.schedule': 'दौरा निर्धारित करें',
    'visit.selectDate': 'तिथि चुनें',
    'visit.statusFilter': 'स्थिति फ़िल्टर',
    'visit.allStatuses': 'सभी स्थितियां',
    'visit.scheduled': 'निर्धारित',
    'visit.completed': 'पूर्ण',
    'visit.missed': 'छूटा हुआ',
    'visit.missedVisitsAlert': 'छूटे दौरों की चेतावनी',
    'visit.reschedule': 'पुनर्निर्धारित करें',
    'visit.viewTicket': 'टिकट देखें',
    'visit.visitsFor': '{date} के लिए दौरे',
    'visit.noVisits': 'इस तिथि के लिए कोई दौरा निर्धारित नहीं',
    'visit.healthWorker': 'स्वास्थ्य कार्यकर्ता',
    'visit.healthWorkerId': 'स्वास्थ्य कार्यकर्ता आईडी',
    'visit.markComplete': 'पूर्ण चिह्नित करें',
    'visit.markMissed': 'छूटा चिह्नित करें',
    'visit.nextAttempt': 'अगला प्रयास: {date}',

    // Bed
    'bed.availability': 'बिस्तर उपलब्धता',
    'bed.request': 'बिस्तर का अनुरोध',
    'bed.available': 'उपलब्ध',
    'bed.occupied': 'भरा हुआ',
    'bed.maintenance': 'रखरखाव',
    'bed.urgencyLevel': 'तात्कालिकता स्तर',
    'bed.medicalJustification': 'चिकित्सा औचित्य',
    'bed.estimatedStay': 'अनुमानित रहने की अवधि (दिन)',
    'bed.specialRequirements': 'विशेष आवश्यकताएं',
    'bed.requestApproval': 'बिस्तर अनुरोध अनुमोदन',
    'bed.reviewComments': 'समीक्षा टिप्पणियां',
    'bed.approve': 'स्वीकृत करें',
    'bed.decline': 'अस्वीकार करें',
    'bed.referToHospital': 'अस्पताल रेफर करें',
    'bed.hospitalReferral': 'अस्पताल रेफरल',
    'bed.hospitalName': 'अस्पताल का नाम',
    'bed.referralReason': 'रेफरल कारण',

    // Survey
    'survey.management': 'सर्वेक्षण प्रबंधन',
    'survey.reports': 'सर्वेक्षण रिपोर्ट',
    'survey.submitReport': 'सर्वेक्षण रिपोर्ट जमा करें',
    'survey.submit': 'जमा करें',
    'survey.observations': 'अवलोकन',
    'survey.appetite': 'भूख',
    'survey.poor': 'कम',
    'survey.moderate': 'मध्यम',
    'survey.good': 'अच्छी',
    'survey.foodIntake': 'खाद्य सेवन',
    'survey.inadequate': 'अपर्याप्त',
    'survey.adequate': 'पर्याप्त',
    'survey.excessive': 'अत्यधिक',
    'survey.supplements': 'पूरक',
    'survey.symptoms': 'लक्षण',
    'survey.searchReports': 'रिपोर्ट खोजें...',
    'survey.allPatients': 'सभी रोगी',
    'survey.noReports': 'कोई सर्वेक्षण रिपोर्ट नहीं मिली',
    'survey.medicalObservations': 'चिकित्सा अवलोकन',
    'survey.nutritionAssessment': 'पोषण मूल्यांकन',
    'survey.symptomsObserved': 'देखे गए लक्षण',

    // Worker
    'worker.management': 'कार्यकर्ता प्रबंधन',
    'worker.head': 'प्रमुख',
    'worker.supervisor': 'पर्यवेक्षक',
    'worker.helper': 'सहायक',
    'worker.asha': 'आशा कार्यकर्ता',

    // Anganwadi
    'anganwadi.centers': 'आंगनवाड़ी केंद्र',

    // AI
    'ai.recommendations': 'एआई सिफारिशें',
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'hi'>('en');
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [userRole, setUserRoleState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [archivedPatients, setArchivedPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [bedRequests, setBedRequests] = useState<BedRequest[]>([]);
  const [treatmentTrackers, setTreatmentTrackers] = useState<TreatmentTracker[]>([]);
  const [anganwadis, setAnganwadis] = useState<Anganwadi[]>([]);
  const [workers, setWorkers] = useState<AnganwadiWorker[]>([]);
  const [visitTickets, setVisitTickets] = useState<AnganwadiVisitTicket[]>([]);

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return text;
  };

  // Set language
  const setLanguage = (lang: 'en' | 'hi') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Set current user
  const setCurrentUser = (user: User, role?: string) => {
    setCurrentUserState(user);
    setUserRoleState(role || user.role);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userRole', role || user.role);
  };

  // Logout
  const logout = () => {
    setCurrentUserState(null);
    setUserRoleState(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
  };

  // Check access for feature
  const hasAccess = (feature: string): boolean => {
    if (!userRole) return false;

    const roleAccess: Record<string, string[]> = {
      admin: ['all'],
      anganwadi_worker: [
        'patientRegistration', 'medicalRecords', 'visitScheduling',
        'bedAvailability', 'notifications', 'aiPrediction', 'postHospitalization'
      ],
      supervisor: [
        'centerManagement', 'workerManagement', 'patientRegistration',
        'medicalRecords', 'visitTicketing', 'surveyManagement',
        'bedCoordination', 'admissionTracking', 'notifications'
      ],
      hospital: [
        'bedDashboard', 'bedRequests', 'treatmentTracker', 'admissionTracking',
        'medicalReports', 'bedDemandPrediction', 'notifications', 'addBed',
        'patientRegistration', 'medicalRecords', 'dischargedPatients', 'releaseBed'
      ]
    };

    const allowed = roleAccess[userRole] || [];
    return allowed.includes('all') || allowed.includes(feature);
  };

  // Patient Operations
  const loadPatients = async (registeredBy?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (registeredBy) params.append('registeredBy', registeredBy);

      const response = await fetch(`/api/patients?${params.toString()}`);

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load patients');
      }

      setPatients(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading patients';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patient: Partial<Patient>): Promise<Patient> => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: patient.name,
          age: patient.age,
          type: patient.type,
          pregnancyWeek: patient.pregnancy_week,
          contactNumber: patient.contact_number,
          emergencyContact: patient.emergency_contact,
          address: patient.address,
          weight: patient.weight,
          height: patient.height,
          bloodPressure: patient.blood_pressure,
          temperature: patient.temperature,
          hemoglobin: patient.hemoglobin,
          nutritionStatus: patient.nutrition_status,
          medicalHistory: patient.medical_history || [],
          symptoms: patient.symptoms || [],
          documents: (patient as any).documents || [],
          photos: (patient as any).photos || [],
          remarks: patient.remarks,
          riskScore: patient.risk_score,
          nutritionalDeficiency: patient.nutritional_deficiency || [],
          registeredBy: currentUser?.id,
          aadhaarNumber: patient.aadhaar_number,
          lastVisitDate: patient.last_visit_date,
          nextVisitDate: patient.next_visit_date
        })
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            data = { error: responseText };
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
        data = { error: 'Failed to read server response' };
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add patient');
      }

      setPatients([...patients, data]);
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding patient';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      setLoading(true);
      const updatePayload: Record<string, any> = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        const camelCaseMap: Record<string, string> = {
          pregnancy_week: 'pregnancyWeek',
          contact_number: 'contactNumber',
          emergency_contact: 'emergencyContact',
          blood_pressure: 'bloodPressure',
          nutrition_status: 'nutritionStatus',
          medical_history: 'medicalHistory',
          risk_score: 'riskScore',
          nutritional_deficiency: 'nutritionalDeficiency',
          registered_by: 'registeredBy',
          aadhaar_number: 'aadhaarNumber',
          last_visit_date: 'lastVisitDate',
          next_visit_date: 'nextVisitDate'
        };

        const camelKey = camelCaseMap[key] || key;
        updatePayload[camelKey] = value;
      });

      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update patient');
      }

      setPatients(patients.map(p => p.id === id ? data : p));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating patient';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load archived (discharged) patients
  const loadArchivedPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients?isActive=false');

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load archived patients');
      }

      setArchivedPatients(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading archived patients';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  // Discharge patient - marks patient as inactive and sets bed to maintenance
  const dischargePatient = async (patientId: string, bedId: string, reason?: string) => {
    try {
      setLoading(true);
      console.log('🏥 dischargePatient called:', { patientId, bedId, reason });

      // Update patient: set is_active to false, clear bed_id, set discharge info
      const patientResponse = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: false,
          bedId: null,
          dischargeDate: new Date().toISOString(),
          dischargeReason: reason || 'Discharged',
          lastBedId: bedId || null,
        }),
      });

      console.log('👤 Patient update response:', patientResponse.status, patientResponse.ok);

      if (!patientResponse.ok) {
        const errorText = await patientResponse.text();
        console.error('❌ Patient update failed:', errorText);
        throw new Error('Failed to update patient discharge status');
      }

      // Update bed: set status to maintenance and clear patient reference (only if bedId exists)
      if (bedId && bedId.trim() !== '') {
        console.log('🛏️ Updating bed:', bedId);
        const bedResponse = await fetch(`/api/beds/${bedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'maintenance',
            patient_id: null,
            admission_date: null,
          }),
        });

        console.log('🛏️ Bed update response:', bedResponse.status, bedResponse.ok);

        if (!bedResponse.ok) {
          const errorText = await bedResponse.text();
          console.warn(`Failed to update bed ${bedId}:`, errorText);
        } else {
          console.log('✅ Bed updated to maintenance');
        }
      } else {
        console.log('⚠️ No bedId provided, skipping bed update');
      }

      // Update local state
      const dischargedPatient = patients.find(p => p.id === patientId);
      if (dischargedPatient) {
        setPatients(patients.filter(p => p.id !== patientId));
        setArchivedPatients([...archivedPatients, {
          ...dischargedPatient,
          is_active: false,
          discharge_date: new Date().toISOString(),
          discharge_reason: reason || 'Discharged',
          last_bed_id: bedId,
          bed_id: undefined
        }]);
      }

      // Update bed in local state
      setBeds(beds.map(b => b.id === bedId ? {
        ...b,
        status: 'maintenance',
        patient_id: undefined,
        admission_date: undefined,
      } : b));

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error discharging patient';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reactivate patient - marks patient as active and optionally assigns a bed
  const reactivatePatient = async (patientId: string, bedId?: string) => {
    try {
      setLoading(true);

      // Update patient: set is_active to true
      const patientPayload: any = {
        isActive: true,
        dischargeDate: null,
        dischargeReason: null,
      };

      if (bedId) {
        patientPayload.bedId = bedId;
        patientPayload.lastAdmissionDate = new Date().toISOString().split('T')[0];
      }

      const patientResponse = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientPayload),
      });

      if (!patientResponse.ok) {
        throw new Error('Failed to reactivate patient');
      }

      // If a bed is assigned, update the bed status
      if (bedId) {
        const patient = archivedPatients.find(p => p.id === patientId);
        const bedResponse = await fetch(`/api/beds/${bedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'occupied',
            patient_id: patientId,
            admission_date: new Date().toISOString().split('T')[0],
          }),
        });

        if (!bedResponse.ok) {
          throw new Error('Failed to update bed status');
        }

        // Update bed in local state
        setBeds(beds.map(b => b.id === bedId ? {
          ...b,
          status: 'occupied',
          patient_id: patientId,
          admission_date: new Date().toISOString().split('T')[0],
        } : b));
      }

      // Move patient from archived to active
      const reactivatedPatient = archivedPatients.find(p => p.id === patientId);
      if (reactivatedPatient) {
        setArchivedPatients(archivedPatients.filter(p => p.id !== patientId));
        setPatients([...patients, {
          ...reactivatedPatient,
          is_active: true,
          discharge_date: undefined,
          discharge_reason: undefined,
          bed_id: bedId,
        }]);
      }

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error reactivating patient';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bed Operations
  const loadBeds = async (hospitalId?: string, status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (hospitalId) params.append('hospitalId', hospitalId);
      if (status) params.append('status', status);

      const response = await fetch(`/api/beds?${params.toString()}`);

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load beds');
      }

      setBeds(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading beds';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const updateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/beds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update bed');
      }

      setBeds(beds.map(b => b.id === id ? data : b));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating bed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Notification Operations
  const loadNotifications = async (userId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/notifications?${params.toString()}`);

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load notifications');
      }

      setNotifications(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading notifications';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark notification as read');
      }

      setNotifications(notifications.map(n => n.id === id ? data : n));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error marking notification as read';
      setError(message);
      throw err;
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add notification');
      }

      setNotifications([...notifications, data]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding notification';
      setError(message);
      throw err;
    }
  };

  // Visit Operations
  const loadVisits = async (patientId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);

      const response = await fetch(`/api/visits?${params.toString()}`);

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load visits');
      }

      setVisits(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading visits';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  // Bed Request Operations
  const loadBedRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bed-requests');

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load bed requests');
      }

      setBedRequests(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading bed requests';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addBedRequest = async (request: Omit<BedRequest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/bed-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add bed request');
      }

      setBedRequests([...bedRequests, data]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding bed request';
      setError(message);
      throw err;
    }
  };

  const updateBedRequest = async (id: string, updates: Partial<BedRequest>) => {
    try {
      const response = await fetch(`/api/bed-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update bed request');
      }

      setBedRequests(bedRequests.map(req => req.id === id ? data : req));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating bed request';
      setError(message);
      throw err;
    }
  };

  // Treatment Tracker Operations
  const loadTreatmentTrackers = async (patientId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);

      const response = await fetch(`/api/treatment-trackers?${params.toString()}`);

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load treatment trackers');
      }

      setTreatmentTrackers(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading treatment trackers';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addTreatmentTracker = async (tracker: Omit<TreatmentTracker, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/treatment-trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tracker)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add treatment tracker');
      }

      setTreatmentTrackers([...treatmentTrackers, data]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding treatment tracker';
      setError(message);
      throw err;
    }
  };

  const updateTreatmentTracker = async (id: string, updates: Partial<TreatmentTracker>) => {
    try {
      const response = await fetch(`/api/treatment-trackers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update treatment tracker');
      }

      setTreatmentTrackers(treatmentTrackers.map(tracker => tracker.id === id ? data : tracker));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating treatment tracker';
      setError(message);
      throw err;
    }
  };

  // Anganwadi Operations
  const loadAnganwadis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/anganwadis');

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load anganwadis');
      }

      setAnganwadis(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading anganwadis';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workers');

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load workers');
      }

      setWorkers(data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading workers';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addAnganwadi = async (anganwadi: Omit<Anganwadi, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/anganwadis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anganwadi)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add anganwadi');
      }

      setAnganwadis([...anganwadis, data]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding anganwadi';
      setError(message);
      throw err;
    }
  };

  const addWorker = async (worker: Omit<AnganwadiWorker, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(worker)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add worker');
      }

      setWorkers([...workers, data]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding worker';
      setError(message);
      throw err;
    }
  };

  const addVisitTicket = async (ticket: Omit<AnganwadiVisitTicket, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/visit-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add visit ticket');
      }

      setVisitTickets([...visitTickets, data]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding visit ticket';
      setError(message);
      throw err;
    }
  };

  const updateVisitTicket = async (id: string, updates: Partial<AnganwadiVisitTicket>) => {
    try {
      const response = await fetch(`/api/visit-tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      let data: any = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse response:', parseError);
          }
        }
      } catch (readError) {
        console.error('Failed to read response body:', readError);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update visit ticket');
      }

      setVisitTickets(visitTickets.map(ticket => ticket.id === id ? data : ticket));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating visit ticket';
      setError(message);
      throw err;
    }
  };

  // Load current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('userRole');
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi' | null;

    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUserState(user);
        setUserRoleState(savedRole || user.role);
      } catch (err) {
        console.error('Failed to parse saved user:', err);
      }
    }
  }, []);

  const value: AppContextType = {
    language,
    setLanguage,
    t,
    currentUser,
    userRole,
    setCurrentUser,
    logout,
    hasAccess,
    patients,
    archivedPatients,
    loadPatients,
    loadArchivedPatients,
    addPatient,
    updatePatient,
    dischargePatient,
    reactivatePatient,
    beds,
    loadBeds,
    updateBed,
    notifications,
    loadNotifications,
    markNotificationRead,
    addNotification,
    visits,
    loadVisits,
    bedRequests,
    loadBedRequests,
    addBedRequest,
    updateBedRequest,
    treatmentTrackers,
    loadTreatmentTrackers,
    addTreatmentTracker,
    updateTreatmentTracker,
    anganwadis,
    workers,
    visitTickets,
    loadAnganwadis,
    loadWorkers,
    addAnganwadi,
    addWorker,
    addVisitTicket,
    updateVisitTicket,
    loading,
    error
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Export both hooks for compatibility
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useApp = (): AppContextType => {
  return useAppContext();
};
