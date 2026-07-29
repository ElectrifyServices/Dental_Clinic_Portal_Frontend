import { useMemo, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLabWorksQuery } from './labWork/useLabWorksQuery';
import { normalizeLabWork } from './labWork/useLabWorkQuery';
import { useCreateLabWorkMutation, type CreateLabWorkVariables } from './labWork/useCreateLabWorkMutation';
import { useUpdateLabWorkMutation, type UpdateLabWorkVariables } from './labWork/useUpdateLabWorkMutation';
import { useDeleteLabWorkMutation } from './labWork/useDeleteLabWorkMutation';
import { useUpdateLabWorkStatusMutation } from './labWork/useUpdateLabWorkStatusMutation';
import type { LabWork, LabWorkStatus } from '../types';

// Temporary local seed data — shown until the /lab-work backend endpoints exist.
// Safe to delete once the real API is live; the list will then be fully server-driven.
const MOCK_LAB_WORKS: LabWork[] = [];

export function useLabWorkData(
  params?: { search?: string; status?: string; page?: number; limit?: number; groupBy?: "patient" | "lab" },
  options?: { enabled?: boolean }
) {
  const queryClient = useQueryClient();
  const isEnabled = options?.enabled !== false;

  const queryParams = useMemo(() => {
    const filters: any = {};
    if (params?.status && params.status !== "all") {
      filters.status = [params.status.toUpperCase()];
    }
    // Set group_by based on the selected groupBy state
    const group = params?.groupBy === "patient" ? "patient" : "lab";
    filters.group_by = [group];

    return {
      page: params?.page ?? 1,
      limit: params?.limit ?? 5,
      search: params?.search || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [params?.search, params?.status, params?.page, params?.limit, params?.groupBy]);

  const { data: apiLabWorks, isLoading: isLabWorksLoading } = useLabWorksQuery(
    queryParams,
    { enabled: isEnabled }
  );

  const { mutateAsync: createLabWorkMutation, isPending: isCreating } = useCreateLabWorkMutation();
  const { mutateAsync: updateLabWorkMutation, isPending: isUpdating } = useUpdateLabWorkMutation();
  const { mutateAsync: deleteLabWorkMutation } = useDeleteLabWorkMutation();
  const { mutateAsync: updateStatusMutation } = useUpdateLabWorkStatusMutation();

  // Local, optimistic store used until the backend endpoints exist — every
  // create/update/delete/status-change is reflected here immediately so the
  // table is usable end-to-end without a live API.
  const [localLabWorks, setLocalLabWorks] = useState<LabWork[]>(MOCK_LAB_WORKS);

  // Stages newly-picked files as local attachments (blob: preview URLs) so they're
  // viewable immediately, without needing the backend upload endpoint yet.
  const buildLocalAttachments = (files?: File[]) =>
    (files || []).map((file, idx) => ({
      id: `local-file-${Date.now()}-${idx}`,
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      file_size: file.size,
      file_type: file.type,
    }));

  const handleCreateLabWork = async (data: any) => {
    const payload: CreateLabWorkVariables = {
      patient_id: data.patientId || data.patient_id,
      treatment_plan_id: data.treatmentId || data.treatment_plan_id,
      lab_name_id: data.labNameId || data.lab_name_id,
      work_tooth_no: (() => {
        const raw = data.workType || data.work_tooth_no || "";
        if (Array.isArray(raw)) return raw.map(String);
        return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
      })(),
      no_of_units: Number(data.unitsCount || data.no_of_units || 1),
      price: Number(data.price || 0),
      warranty: data.warranty || (data.hasWarranty || data.has_warranty ? "WARRANTY" : "NO_WARRANTY"),
      notes: data.notes || undefined,
      documents: data.rawFiles || data.documents,
      warranty_years: data.hasWarranty || data.has_warranty ? Number(data.warrantyYears ?? data.warranty_years ?? 0) : undefined,
      warranty_valid_till: data.hasWarranty || data.has_warranty ? data.warrantyEndDate || data.warranty_valid_till || undefined : undefined,
    };

    const newEntry: LabWork = {
      id: `local-${Date.now()}`,
      patientId: payload.patient_id,
      patientName: data.patientName || data.patient_name || payload.patient_id,
      treatmentId: payload.treatment_plan_id,
      treatmentName: data.treatmentName || data.treatment_name,
      labName: data.labName || data.lab_name,
      labNameId: payload.lab_name_id,
      workType: payload.work_tooth_no,
      unitsCount: payload.no_of_units,
      hasWarranty: payload.warranty !== "NO_WARRANTY",
      warrantyEndDate: data.warrantyEndDate || data.warranty_end_date,
      createdDate: data.createdDate || data.created_date || new Date().toISOString().split("T")[0],
      price: payload.price,
      notes: payload.notes,
      attachments: buildLocalAttachments(payload.documents),
      status: 'ordered',
    };

    setLocalLabWorks((prev) => [newEntry, ...prev]);
    try {
      await createLabWorkMutation(payload);
      refetchLabWorks();
    } catch (err) {
      console.error("API create failed", err);
      throw err;
    }
    return newEntry;
  };

  const handleUpdateLabWork = async (data: any) => {
    const payload: UpdateLabWorkVariables = {
      id: data.id,
      patient_id: data.patientId || data.patient_id,
      treatment_plan_id: data.treatmentId || data.treatment_plan_id,
      lab_name_id: data.labNameId || data.lab_name_id,
      work_tooth_no: (() => {
        const raw = data.workType || data.work_tooth_no || "";
        if (Array.isArray(raw)) return raw.map(String);
        return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
      })(),
      no_of_units: Number(data.unitsCount || data.no_of_units || 1),
      price: Number(data.price || 0),
      warranty: data.warranty || (data.hasWarranty || data.has_warranty ? "WARRANTY" : "NO_WARRANTY"),
      notes: data.notes || undefined,
      documents: data.rawFiles || data.documents,
      removedFileIds: data.removedFileIds,
      warranty_years: data.hasWarranty || data.has_warranty ? Number(data.warrantyYears ?? data.warranty_years ?? 0) : undefined,
      warranty_valid_till: data.hasWarranty || data.has_warranty ? data.warrantyEndDate || data.warranty_valid_till || undefined : undefined,
    };

    setLocalLabWorks((prev) =>
      prev.map((lw) =>
        lw.id === data.id
          ? {
            ...lw,
            patientId: payload.patient_id,
            patientName: data.patientName || data.patient_name || lw.patientName,
            treatmentId: payload.treatment_plan_id,
            treatmentName: data.treatmentName || data.treatment_name || lw.treatmentName,
            labName: data.labName || data.lab_name || lw.labName,
            labNameId: payload.lab_name_id,
            workType: payload.work_tooth_no,
            unitsCount: payload.no_of_units,
            hasWarranty: payload.warranty !== "NO_WARRANTY",
            price: payload.price,
            notes: payload.notes,
            attachments: [
              ...(lw.attachments || []).filter((a) =>
                payload.removedFileIds ? !payload.removedFileIds.includes(a.id) : true,
              ),
              ...buildLocalAttachments(payload.documents),
            ],
          }
          : lw,
      ),
    );
    try {
      await updateLabWorkMutation(payload);
      refetchLabWorks();
    } catch (err) {
      console.error("API update failed", err);
      throw err;
    }
  };

  const handleDeleteLabWork = async (id: string) => {
    setLocalLabWorks((prev) => prev.filter((lw) => lw.id !== id));
    try {
      await deleteLabWorkMutation({ id });
      refetchLabWorks();
    } catch (err) {
      console.error("API delete failed", err);
      throw err;
    }
  };

  const handleUpdateLabWorkStatus = async (id: string, status: LabWorkStatus) => {
    setLocalLabWorks((prev) => prev.map((lw) => (lw.id === id ? { ...lw, status } : lw)));
    try {
      await updateStatusMutation({ id, status });
      refetchLabWorks();
    } catch (err) {
      console.error("API status update failed", err);
      throw err;
    }
  };

  const refetchLabWorks = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['labWorks'] });
  }, [queryClient]);

  const apiDerivedLabWorks = useMemo(() => {
    let rawList: any[] = [];
    if (!apiLabWorks) return [];

    const target = apiLabWorks.responseObject !== undefined ? apiLabWorks.responseObject : apiLabWorks;

    if (Array.isArray(target)) {
      rawList = target;
    } else if (target && typeof target === "object") {
      if (Array.isArray(target.data)) rawList = target.data;
      else if (Array.isArray(target.labWorks)) rawList = target.labWorks;
      else if (Array.isArray(target.list)) rawList = target.list;
      else if (Array.isArray(target.rows)) rawList = target.rows;
      else if (Array.isArray(target.results)) rawList = target.results;
      else if (target.data && Array.isArray(target.data.data)) rawList = target.data.data;
    }

    // Flat map entries if backend returned grouped data structure
    let flatEntries: any[] = [];
    rawList.forEach((item: any) => {
      if (item && Array.isArray(item.entries)) {
        flatEntries.push(...item.entries);
      } else if (item && Array.isArray(item.data)) {
        flatEntries.push(...item.data);
      } else if (item) {
        flatEntries.push(item);
      }
    });

    return flatEntries
      .map((lw: any) => normalizeLabWork(lw))
      .filter((lw): lw is NonNullable<typeof lw> => lw !== null);
  }, [apiLabWorks]);

  // Merge real API results (once the backend exists) with the local/mock entries,
  // preferring the API's version of any entry that exists in both.
  const labWorks = useMemo(() => {
    if (apiLabWorks !== undefined) {
      return apiDerivedLabWorks;
    }
    return localLabWorks;
  }, [apiLabWorks, apiDerivedLabWorks, localLabWorks]);

  const pagination = useMemo(() => {
    if (apiLabWorks) {
      const target = apiLabWorks?.responseObject?.pagination || apiLabWorks?.pagination;
      if (target) {
        const total = Number(target.total_items ?? target.totalItems ?? target.total ?? apiDerivedLabWorks.length);
        const totalPages = Number(target.total_pages ?? target.totalPages ?? Math.ceil(total / (params?.limit ?? 5)));
        const page = Number(target.current_page ?? target.currentPage ?? target.page ?? 1);
        const limit = Number(target.page_limit ?? target.pageLimit ?? target.limit ?? 5);
        return {
          total,
          totalPages,
          page,
          limit,
        };
      }
    }
    const totalCount = apiLabWorks !== undefined ? apiDerivedLabWorks.length : localLabWorks.length;
    return {
      total: totalCount,
      totalPages: Math.ceil(totalCount / (params?.limit ?? 5)),
      page: params?.page ?? 1,
      limit: params?.limit ?? 5,
    };
  }, [apiLabWorks, apiDerivedLabWorks, localLabWorks, params?.page, params?.limit]);

  return {
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
  };
}
