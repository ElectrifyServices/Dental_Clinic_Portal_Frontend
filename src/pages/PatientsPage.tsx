import React from "react";
import { Plus } from "lucide-react";
import { usePatientData } from "../hooks/usePatientData";
import { useModal } from "../contexts/ModalContext";
import { exportPatientReport } from "../utils/exportPatient";
import { PatientList } from "../components/Patients/PatientList";
import { toast, PageHeader, Button } from "../components/ui";

export const PatientsPage: React.FC = () => {
  const {
    patients,
    handleDeletePatient, handleUpdatePatientStatus,
    patientSearch, setPatientSearch,
    patientStatus, setPatientStatus,
    patientCategory, setPatientCategory,
    patientPage, setPatientPage,
    patientLimit, setPatientLimit,
    totalItems, totalPages,
    isPatientsLoading,
  } = usePatientData();

  const {
    setActiveModal, setSelectedPatientId, setPatientFormType,
    setParentPatientId, confirmDelete,
  } = useModal();

  const handleExportPatient = (id: string) =>
    exportPatientReport(id);

  const handleViewPatient = (id: string) => {
    setSelectedPatientId(id);
    setActiveModal("patientDetails");
  };

  const handleEditPatient = (id: string) => {
    setSelectedPatientId(id);
    setActiveModal("patientForm");
  };

  const handleDeletePatientWrapper = (id: string) => {
    const p = patients.find((x) => x.id === id);
    confirmDelete(
      "Delete Patient",
      `Delete patient ${p?.name}? All history will be removed.`,
      () => handleDeletePatient(id)
    );
  };

  const handleToggleStatus = async (id: string, status: "active" | "inactive") => {
    const p = patients.find((x) => x.id === id);
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
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          title="Patients"
          subtitle="Manage and track patient information"
          action={
            <Button
              onClick={() => handleAddPatient()}
              className="gap-1.5 h-9 px-3 shadow-lg shadow-primary/10 justify-center font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Patient</span>
            </Button>
          }
        />
      </div>
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
        limit={patientLimit}
        onLimitChange={setPatientLimit}
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
};
