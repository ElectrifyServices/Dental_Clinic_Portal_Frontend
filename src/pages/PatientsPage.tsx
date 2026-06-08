import React, { useEffect } from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { exportPatientReport } from "../utils/exportPatient";
import { PatientList } from "../components/Patients/PatientList";
import { toast } from "../components/ui";

export const PatientsPage: React.FC = () => {
  const {
    patients, appointments, treatments, invoices,
    handleSavePatient, handleDeletePatient, handleUpdatePatientStatus,
    patientSearch, setPatientSearch,
    patientStatus, setPatientStatus,
    patientCategory, setPatientCategory,
    refetchPatients,
  } = useAppData();

  useEffect(() => {
    if (refetchPatients) {
      refetchPatients();
    }
  }, [refetchPatients]);
  const {
    setActiveModal, setSelectedPatientId, setPatientFormType,
    setParentPatientId, confirmDelete,
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
      toast.success(`Patient marked as ${status}!`);
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
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm -mt-3 md:-mt-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Patients</h1>
          <p className="text-xs text-muted-foreground font-medium">Manage and track patient information</p>
        </div>
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
        searchValue={patientSearch}
        onSearchChange={setPatientSearch}
        filterStatus={patientStatus}
        onFilterStatusChange={setPatientStatus}
        filterCategory={patientCategory}
        onFilterCategoryChange={setPatientCategory}
      />
    </div>
  );
};
