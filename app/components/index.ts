// Placeholder component exports
// All components are 'use client' and use context
// They follow the same pattern as Dashboard, Login, and each uses useApp() context

// Core components (already migrated)
export { default as Dashboard } from './Dashboard';
export { default as Login } from './Login';

// Data display components (use context for data)
// These are placeholder exports that will be auto-generated stubs
// Each component reads from useApp() context and displays role-based data
export { default as AdminPanel } from './AdminPanel';
export { default as PatientRegistration } from './PatientRegistration';
export { default as BedAvailability } from './BedAvailability';
export { default as Notifications } from './Notifications';
export { default as PostHospitalizationTracker } from './PostHospitalizationTracker';
export { default as AnganwadiManagement } from './AnganwadiManagement';
export { default as WorkerManagement } from './WorkerManagement';
export { default as AnganwadiVisitTickets } from './AnganwadiVisitTickets';
export { default as SurveyReports } from './SurveyReports';
export { default as BedRequests } from './BedRequests';
export { default as MedicalRecords } from './MedicalRecords';
export { default as VisitScheduling } from './VisitScheduling';
export { default as CenterManagement } from './CenterManagement';
export { default as VisitTicketing } from './VisitTicketing';
export { default as SurveyManagement } from './SurveyManagement';
export { default as BedCoordination } from './BedCoordination';
export { default as AdmissionTracking } from './AdmissionTracking';
export { default as BedDashboard } from './BedDashboard';
export { default as TreatmentTracker } from './TreatmentTracker';
export { default as MedicalReports } from './MedicalReports';
export { default as BedDemandPrediction } from './BedDemandPrediction';
export { default as AIHealthPrediction } from './AIHealthPrediction';
