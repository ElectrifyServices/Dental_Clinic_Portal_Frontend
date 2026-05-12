import React from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { DoctorManagement } from "../components/Staff/DoctorManagement";

export const StaffPage: React.FC = () => {
  const { staffMembers, handleSaveStaff, handleDeleteStaff } = useAppData();
  const {
    setActiveModal, setSelectedItemId, setSelectedStaffForSalary,
    confirmDelete,
  } = useModal();

  return (
    <div className="space-y-6">
      <DoctorManagement
        staffMembers={staffMembers}
        onAddDoctor={() => setActiveModal("doctorForm")}
        onEditDoctor={(id: string) => { setSelectedItemId(id); setActiveModal("doctorForm"); }}
        onDeleteDoctor={(id: string) => {
          const s = staffMembers.find((x: any) => x.id === id);
          confirmDelete("Delete Staff", `Delete ${s?.name}?`, () => handleDeleteStaff(id));
        }}
        onUpdateStaff={handleSaveStaff}
        onManageSchedule={(id: string) => { setSelectedItemId(id); setActiveModal("scheduleManager"); }}
        onPaySalary={(id: string, name: string) => {
          setSelectedStaffForSalary({ id, name });
          setActiveModal("salaryModal");
        }}
        onViewSalaryHistory={(id: string, name: string) => {
          setSelectedStaffForSalary({ id, name });
          setActiveModal("salaryHistory");
        }}
      />
    </div>
  );
};
