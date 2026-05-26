import React from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { exportPatientReport } from "../utils/exportPatient";
import { PatientList } from "../components/Patients/PatientList";

export const PatientsPage: React.FC = () => {
  const {
    patients, appointments, treatments, invoices,
    handleSavePatient, handleDeletePatient, handleUpdatePatientStatus,
  } = useAppData();
  const {
    setActiveModal, setSelectedPatientId, setPatientFormType,
    setParentPatientId, confirmDelete, showToast,
  } = useModal();

  const handleExportPatient = (id: string) =>
    exportPatientReport(id, patients, appointments, treatments, invoices);

  const handleViewPatient = (id: string) => {
    setSelectedPatientId(id);
    setActiveModal("patientDetails");
  };

  const handleEditPatient = (id: string) => {
    setSelectedPatientId(id);
    setActiveModal("patientForm");
  };

  const handleDeletePatientWrapper = (id: string) => {
    const p = patients.find((x: any) => x.id === id);
    confirmDelete(
      "Delete Patient",
      `Delete patient ${p?.name}? All history will be removed.`,
      () => handleDeletePatient(id)
    );
  };

  const handleToggleStatus = async (id: string, status: "active" | "inactive") => {
    const p = patients.find((x: any) => x.id === id);
    if (p) {
      await handleUpdatePatientStatus(id, status === "active" ? "ACTIVE" : "INACTIVE");
      showToast(`Patient marked as ${status}!`);
    }
  };

  const handleAddPatient = (type?: string, patientId?: string) => {
    if (type === "person" && patientId) {
      setParentPatientId(patientId);
      setPatientFormType("person");
    } else {
      setPatientFormType("normal");
    }
    setSelectedPatientId("");
    setActiveModal("patientForm");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patients</h1>
        <p className="text-muted-foreground mt-1">Manage and track patient information</p>
      </div>
      <PatientList
        patients={patients}
        onAddPatient={handleAddPatient}
        onViewPatient={handleViewPatient}
        onEditPatient={handleEditPatient}
        onDeletePatient={handleDeletePatientWrapper}
        onExportPatient={handleExportPatient}
        onToggleStatus={handleToggleStatus}
        onShowCorporateManagement={() => setActiveModal("corporateModal")}
      />
    </div>
  );
};
