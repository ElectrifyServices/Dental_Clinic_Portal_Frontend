import React, { useEffect } from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { exportPatientReport } from "../utils/exportPatient";
import { PatientList } from "../components/Patients/PatientList";
import { toast, PageHeader } from "../components/ui";

export const PatientsPage: React.FC = () => {
  const {
    patients, appointments, treatments, invoices,
    handleSavePatient, handleDeletePatient, handleUpdatePatientStatus,
    patientSearch, setPatientSearch,
    patientStatus, setPatientStatus,
    patientCategory, setPatientCategory,
    patientPage, setPatientPage,
    totalItems, totalPages,
    refetchPatients,
    isPatientsLoading,
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
      <PageHeader
        title="Patients"
        subtitle="Manage and track patient information"
      />
      <PatientList
        patients={patients}
        isLoading={isPatientsLoading}
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
        currentPage={patientPage}
        onPageChange={setPatientPage}
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
};
