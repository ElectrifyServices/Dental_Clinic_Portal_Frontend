import React, { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLabWorkData } from "../hooks/useLabWorkData";
import { useModal } from "../contexts/ModalContext";
import { LabWorkList } from "../components/LabWork/LabWorkList";
import { LabWorkForm } from "../components/LabWork/LabWorkForm";
import { LabWorkViewer } from "../components/LabWork/LabWorkViewer";
import { toast, Pagination } from "@/components/ui";
import { useLabWorkQuery, normalizeLabWork } from "../hooks/labWork/useLabWorkQuery";
import type { LabWorkFormSaveData } from "../components/LabWork/LabWorkForm";
import type { LabWorkStatus } from "../types";

export const LabWorkPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [activeLabWorkId, setActiveLabWorkId] = useState<string | null>(null);
  const [viewingLabWorkId, setViewingLabWorkId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"patient" | "lab">("patient");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setPage(1); // Reset page on status filter change
  }, [status]);

  useEffect(() => {
    setPage(1); // Reset page on grouping filter change
  }, [groupBy]);

  const {
    labWorks,
    pagination,
    isLabWorksLoading,
    isCreating,
    isUpdating,
    refetchLabWorks,
    handleCreateLabWork,
    handleUpdateLabWork,
    handleDeleteLabWork,
    handleUpdateLabWorkStatus,
  } = useLabWorkData({ search, status, page, limit, groupBy });

  const { confirmDelete, showConfirm } = useModal();

  useEffect(() => {
    refetchLabWorks();
  }, [refetchLabWorks]);

  // Live single-entry query for edit form
  const { data: rawActiveLabWork, isLoading: isActiveLoading } = useLabWorkQuery(activeLabWorkId || "", {
    enabled: !!activeLabWorkId && formMode === "edit",
  });

  // Live single-entry query for viewer modal
  const { data: rawViewingLabWork, isLoading: isViewingLoading } = useLabWorkQuery(viewingLabWorkId || "", {
    enabled: !!viewingLabWorkId,
  });

  const activeLabWork = useMemo(() => {
    if (!activeLabWorkId) return undefined;
    if (!rawActiveLabWork) {
      return labWorks.find((lw) => lw.id === activeLabWorkId) || undefined;
    }
    return normalizeLabWork(rawActiveLabWork) || undefined;
  }, [rawActiveLabWork, labWorks, activeLabWorkId]);

  const viewingLabWork = useMemo(() => {
    if (!viewingLabWorkId) return undefined;
    if (!rawViewingLabWork) {
      return labWorks.find((lw) => lw.id === viewingLabWorkId) || undefined;
    }
    return normalizeLabWork(rawViewingLabWork) || undefined;
  }, [rawViewingLabWork, labWorks, viewingLabWorkId]);

  const existingLabNames = useMemo(
    () => labWorks.map((lw) => lw.labName).filter(Boolean),
    [labWorks],
  );

  const closeForm = () => {
    setFormMode(null);
    setActiveLabWorkId(null);
  };

  const handleSave = async (data: LabWorkFormSaveData) => {
    try {
      if (formMode === "edit" && activeLabWorkId) {
        const removedFileIds = (activeLabWork?.attachments || [])
          .map((a) => a.id)
          .filter((id) => !data.existingAttachmentIds.includes(id));

        await handleUpdateLabWork({
          id: activeLabWorkId,
          patientId: data.patientId,
          patientName: data.patientName,
          treatmentId: data.treatmentId,
          treatmentName: data.treatmentName,
          labName: data.labName,
          labNameId: data.labNameId,
          workType: data.workType,
          unitsCount: data.unitsCount,
          hasWarranty: data.hasWarranty,
          warrantyYears: data.warrantyYears,
          warrantyEndDate: data.warrantyEndDate,
          createdDate: data.createdDate,
          price: data.price,
          notes: data.notes,
          rawFiles: data.rawFiles as File[],
          removedFileIds,
        });
        toast.success("Lab work updated successfully");
      } else {
        await handleCreateLabWork({
          patientId: data.patientId,
          patientName: data.patientName,
          treatmentId: data.treatmentId,
          treatmentName: data.treatmentName,
          labName: data.labName,
          labNameId: data.labNameId,
          workType: data.workType,
          unitsCount: data.unitsCount,
          hasWarranty: data.hasWarranty,
          warrantyYears: data.warrantyYears,
          warrantyEndDate: data.warrantyEndDate,
          createdDate: data.createdDate,
          price: data.price,
          notes: data.notes,
          rawFiles: data.rawFiles as File[],
        });
        toast.success("Lab work added successfully");
      }
      closeForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save lab work");
    }
  };

  const handleStatusChange = (id: string, newStatus: LabWorkStatus) => {
    const statusLabels: Record<LabWorkStatus, string> = {
      ordered: "Ordered",
      received: "Received",
      paid: "Paid",
    };
    showConfirm(
      "Change Status",
      `Are you sure you want to change the status of this lab work to "${statusLabels[newStatus]}"?`,
      async () => {
        try {
          await handleUpdateLabWorkStatus(id, newStatus);
          toast.success(`Marked as ${statusLabels[newStatus]} successfully`);
        } catch (err: any) {
          toast.error(err?.message || "Failed to update status");
        }
      },
      "Update Status",
      "primary"
    );
  };

  return (
    <div className="space-y-6">
      <LabWorkList
        labWorks={labWorks}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        isLoading={isLabWorksLoading}
        onAdd={() => setFormMode("add")}
        onView={(id) => {
          queryClient.invalidateQueries({ queryKey: ["labWork", id] });
          setViewingLabWorkId(id);
        }}
        onEdit={(id) => {
          queryClient.invalidateQueries({ queryKey: ["labWork", id] });
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

      {pagination && pagination.total > 0 && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            perPage={limit}
            onPageChange={setPage}
            onPerPageChange={setLimit}
          />
        </div>
      )}

      {formMode && (
        <LabWorkForm
          onClose={closeForm}
          onSave={handleSave}
          labWork={formMode === "edit" ? activeLabWork : undefined}
          existingLabNames={existingLabNames}
          isSaving={isCreating || isUpdating}
          isLoading={formMode === "edit" && isActiveLoading}
        />
      )}

      {viewingLabWorkId && (
        <LabWorkViewer
          labWork={viewingLabWork}
          isLoading={isViewingLoading}
          onClose={() => setViewingLabWorkId(null)}
        />
      )}
    </div>
  );
};
