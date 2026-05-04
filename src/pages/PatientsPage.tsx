import React from 'react';
import { PatientList } from '../components/Patients/PatientList';

interface PatientsPageProps {
  patients: any[];
  handleViewPatient: (id: string) => void;
  handleEditPatient: (id: string) => void;
  handleDeletePatient: (id: string) => void;
  setActiveModal: (modal: string | null) => void;
  setPatientFormType: (type: "normal" | "person") => void;
  setParentPatientId: (id: string) => void;
  setSelectedPatientId: (id: string) => void;
  handleExportPatient?: (id: string) => void;
  handleToggleStatus?: (id: string, newStatus: 'active' | 'inactive') => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  patients,
  handleViewPatient,
  handleEditPatient,
  handleDeletePatient,
  setActiveModal,
  setPatientFormType,
  setParentPatientId,
  setSelectedPatientId,
  handleExportPatient,
  handleToggleStatus
}) => {
  const handleAddPatient = (type?: string, patientId?: string) => {
    if (type === "person" && patientId) {
      setParentPatientId(patientId);
      setPatientFormType("person");
    } else {
      setPatientFormType("normal");
    }
    setSelectedPatientId("");
    setActiveModal('patientForm');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-600 mt-1">Manage and track patient information</p>
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
