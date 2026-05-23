import React from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { DoctorManagement } from "../components/Staff/DoctorManagement";
import { useStaffQuery } from "../hooks/staff/useStaffQuery";

export const StaffPage: React.FC = () => {
  const { staffMembers, handleDeleteStaff, handleUpdateStaffStatus } = useAppData();
  const { isLoading } = useStaffQuery();
  const {
    setActiveModal, setSelectedItemId, setSelectedStaffForSalary,
    confirmDelete,
  } = useModal();

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">Loading staff...</div>
      ) : (
        <DoctorManagement
          staffMembers={staffMembers}
          onAddDoctor={() => setActiveModal("doctorForm")}
          onEditDoctor={(id: string) => { setSelectedItemId(id); setActiveModal("doctorForm"); }}
          onDeleteDoctor={(id: string) => {
            const s = staffMembers.find((x: any) => x.id === id);
            confirmDelete("Delete Staff", `Delete ${s?.name}?`, () => handleDeleteStaff(id));
          }}
          onUpdateStaff={(staff: any) => handleUpdateStaffStatus(staff.id, staff.isActive ? "ACTIVE" : "INACTIVE")}
          onManageSchedule={(id: string) => {
            setSelectedItemId(id);
            // Use setTimeout(0) to guarantee selectedItemId state is committed
            // before the modal condition (selectedItemId && ...) evaluates.
            setTimeout(() => setActiveModal("scheduleManager"), 0);
          }}
          onPaySalary={(id: string, name: string) => {
            setSelectedStaffForSalary({ id, name });
            setActiveModal("salaryModal");
          }}
          onViewSalaryHistory={(id: string, name: string) => {
            setSelectedStaffForSalary({ id, name });
            setActiveModal("salaryHistory");
          }}
        />
      )}
    </div>
  );
};

