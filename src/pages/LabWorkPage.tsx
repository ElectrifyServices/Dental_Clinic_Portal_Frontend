import React, { useState, useEffect, useMemo } from "react";
import { useLabWorkData } from "../hooks/useLabWorkData";
import { useModal } from "../contexts/ModalContext";
import { LabWorkList } from "../components/LabWork/LabWorkList";
import { LabWorkForm } from "../components/LabWork/LabWorkForm";
import { LabWorkViewer } from "../components/LabWork/LabWorkViewer";
import { toast } from "@/components/ui";
import type { LabWorkFormData } from "@/lib/schemas/labWork.schema";
import type { LabWorkStatus } from "../types";

export const LabWorkPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [activeLabWorkId, setActiveLabWorkId] = useState<string | null>(null);
  const [viewingLabWorkId, setViewingLabWorkId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    labWorks,
    isLabWorksLoading,
    isCreating,
    isUpdating,
    refetchLabWorks,
    handleCreateLabWork,
    handleUpdateLabWork,
    handleDeleteLabWork,
    handleUpdateLabWorkStatus,
  } = useLabWorkData({ search, status });

  const { confirmDelete } = useModal();

  useEffect(() => {
    refetchLabWorks();
  }, [refetchLabWorks]);

  const activeLabWork = useMemo(
    () => labWorks.find((lw) => lw.id === activeLabWorkId) || undefined,
    [labWorks, activeLabWorkId],
  );

  const viewingLabWork = useMemo(
    () => labWorks.find((lw) => lw.id === viewingLabWorkId) || undefined,
    [labWorks, viewingLabWorkId],
  );

  const existingLabNames = useMemo(
    () => labWorks.map((lw) => lw.labName).filter(Boolean),
    [labWorks],
  );

  const closeForm = () => {
    setFormMode(null);
    setActiveLabWorkId(null);
  };

  const handleSave = async (data: LabWorkFormData) => {
    try {
      if (formMode === "edit" && activeLabWorkId) {
        await handleUpdateLabWork({
          id: activeLabWorkId,
          patient_id: data.patientId,
          patient_name: data.patientName,
          lab_name: data.labName,
          work_type: data.workType,
          units_count: data.unitsCount,
          has_warranty: data.hasWarranty,
          created_date: data.createdDate,
          due_date: data.dueDate,
          price: data.price,
        });
        toast.success("Lab work updated successfully");
      } else {
        await handleCreateLabWork({
          patient_id: data.patientId,
          patient_name: data.patientName,
          lab_name: data.labName,
          work_type: data.workType,
          units_count: data.unitsCount,
          has_warranty: data.hasWarranty,
          created_date: data.createdDate,
          due_date: data.dueDate,
          price: data.price,
        });
        toast.success("Lab work added successfully");
      }
      closeForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save lab work");
    }
  };

  const handleStatusChange = async (id: string, newStatus: LabWorkStatus) => {
    try {
      await handleUpdateLabWorkStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <LabWorkList
        labWorks={labWorks}
        isLoading={isLabWorksLoading}
        onAdd={() => setFormMode("add")}
        onView={(id) => setViewingLabWorkId(id)}
        onEdit={(id) => {
          setActiveLabWorkId(id);
          setFormMode("edit");
        }}
        onDelete={(id, label) =>
          confirmDelete("Delete Lab Work", `Delete lab work entry ${label || id}?`, () => handleDeleteLabWork(id))
        }
        onUpdateStatus={handleStatusChange}
        search={searchInput}
        setSearch={setSearchInput}
        status={status}
        setStatus={setStatus}
      />

      {formMode && (
        <LabWorkForm
          onClose={closeForm}
          onSave={handleSave}
          labWork={formMode === "edit" ? activeLabWork : undefined}
          existingLabNames={existingLabNames}
          isSaving={isCreating || isUpdating}
        />
      )}

      {viewingLabWork && (
        <LabWorkViewer labWork={viewingLabWork} onClose={() => setViewingLabWorkId(null)} />
      )}
    </div>
  );
};
