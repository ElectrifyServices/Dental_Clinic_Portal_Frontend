import React from 'react';
import { PatientList } from '../components/Patients/PatientList';

interface PatientsPageProps {
  patients: any[];
  handleViewPatient: (id: string) => void;
  handleEditPatient: (id: string) => void;
  handleDeletePatient: (id: string) => void;
  setShowPatientForm: (show: boolean) => void;
  setPatientFormType: (type: "normal" | "person") => void;
  setParentPatientId: (id: string) => void;
  setSelectedPatientId: (id: string) => void;
  handleExportPatient?: (id: string) => void;
  handleToggleStatus?: (id: string, newStatus: 'active' | 'inactive') => void;
  onShowCorporateManagement?: () => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  patients,
  handleViewPatient,
  handleEditPatient,
  handleDeletePatient,
  setShowPatientForm,
  setPatientFormType,
  setParentPatientId,
  setSelectedPatientId,
  handleExportPatient,
  handleToggleStatus,
  onShowCorporateManagement
}) => {
  const handleAddPatient = (type?: string, patientId?: string) => {
    if (type === "person" && patientId) {
      setParentPatientId(patientId);
      setPatientFormType("person");
    } else {
      setPatientFormType("normal");
    }
    setSelectedPatientId("");
    setShowPatientForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage and track patient information</p>
        </div>
        <button
          onClick={onShowCorporateManagement}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 border border-indigo-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Corporate Management
        </button>
      </div>
      
      <PatientList
        patients={patients}
        onAddPatient={handleAddPatient}
        onViewPatient={handleViewPatient}
        onEditPatient={handleEditPatient}
        onDeletePatient={handleDeletePatient}
        onExportPatient={handleExportPatient}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};
