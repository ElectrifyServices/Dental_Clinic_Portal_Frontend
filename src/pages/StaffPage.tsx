import React, { useState, useEffect } from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { DoctorManagement } from "../components/Staff/DoctorManagement";
import { useStaffQuery } from "../hooks/staff/useStaffQuery";

export const StaffPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { staffMembers, handleDeleteStaff, handleUpdateStaffStatus, refetchStaff } = useAppData({
    search: debouncedSearch,
    role: roleFilter,
  });
  const { isLoading } = useStaffQuery({
    search: debouncedSearch,
    role: roleFilter,
  });

  useEffect(() => {
    if (refetchStaff) {
      refetchStaff();
    }
  }, [refetchStaff]);
  const {
    setActiveModal, setSelectedItemId, setSelectedStaffForSalary,
    confirmDelete,
  } = useModal();

  return (
    <div className="space-y-6">
      <DoctorManagement
        staffMembers={staffMembers}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        isLoading={isLoading}
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
    </div>
  );
};

