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
const MOCK_LAB_WORKS: LabWork[] = [
  {
    id: 'mock-1',
    patientId: 'mock-patient-1',
    patientName: 'Rohan Mehta',
    treatmentId: 'mock-treatment-1',
    treatmentName: 'Root Canal Treatment - #14',
    labName: 'Smile Dental Lab',
    workType: 'Crown - #14',
    unitsCount: 1,
    hasWarranty: true,
    warrantyYears: 2,
    warrantyEndDate: new Date(Date.now() + (2 * 365 - 6) * 86400000).toISOString().split('T')[0],
    createdDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    price: 4500,
    status: 'ordered',
  },
  {
    id: 'mock-2',
    patientId: 'mock-patient-2',
    patientName: 'Priya Shah',
    treatmentId: 'mock-treatment-2',
    treatmentName: 'Bridge Placement - #24-26',
    labName: 'PrecisionCraft Dental Lab',
    workType: 'Bridge - #24-26',
    unitsCount: 3,
    hasWarranty: false,
    createdDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    price: 12000,
    status: 'received',
  },
  {
    id: 'mock-3',
    patientId: 'mock-patient-1',
    patientName: 'Rohan Mehta',
    treatmentId: 'mock-treatment-1',
    treatmentName: 'Root Canal Treatment - #14',
    labName: 'Crown & Bridge Works',
    workType: 'Denture - Full Upper',
    unitsCount: 1,
    hasWarranty: true,
    warrantyYears: 5,
    warrantyEndDate: new Date(Date.now() + (5 * 365 - 20) * 86400000).toISOString().split('T')[0],
    createdDate: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    price: 18000,
    status: 'paid',
  },
];

export function useLabWorkData(params?: { search?: string; status?: string }, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const isEnabled = options?.enabled !== false;

  const queryParams = useMemo(() => {
    const filters: any = {};
    if (params?.status && params.status !== "all") {
      filters.status = [params.status.toUpperCase()];
    }
    return {
      page: 1,
      limit: 1000,
      search: params?.search || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
  }, [params?.search, params?.status]);

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

  const handleCreateLabWork = async (data: CreateLabWorkVariables) => {
    const newEntry: LabWork = {
      id: `local-${Date.now()}`,
      patientId: data.patient_id,
      patientName: data.patient_name || data.patient_id,
      treatmentId: data.treatment_id,
      treatmentName: data.treatment_name,
      labName: data.lab_name,
      workType: data.work_type,
      unitsCount: data.units_count,
      hasWarranty: data.has_warranty,
      warrantyYears: data.warranty_years,
      warrantyEndDate: data.warranty_end_date,
      createdDate: data.created_date,
      price: data.price,
      notes: data.notes,
      attachments: buildLocalAttachments(data.rawFiles),
      status: 'ordered',
    };
    setLocalLabWorks((prev) => [newEntry, ...prev]);
    try {
      await createLabWorkMutation(data);
    } catch (err) {
      // Backend not available yet — the local entry above still stands.
    }
    return newEntry;
  };

  const handleUpdateLabWork = async (data: UpdateLabWorkVariables) => {
    setLocalLabWorks((prev) =>
      prev.map((lw) =>
        lw.id === data.id
          ? {
              ...lw,
              patientId: data.patient_id,
              patientName: data.patient_name || lw.patientName,
              treatmentId: data.treatment_id,
              treatmentName: data.treatment_name || lw.treatmentName,
              labName: data.lab_name,
              workType: data.work_type,
              unitsCount: data.units_count,
              hasWarranty: data.has_warranty,
              warrantyYears: data.warranty_years,
              warrantyEndDate: data.warranty_end_date,
              createdDate: data.created_date,
              price: data.price,
              notes: data.notes,
              attachments: [
                ...(lw.attachments || []).filter((a) =>
                  data.existing_attachment_ids ? data.existing_attachment_ids.includes(a.id) : true,
                ),
                ...buildLocalAttachments(data.rawFiles),
              ],
            }
          : lw,
      ),
    );
    try {
      await updateLabWorkMutation(data);
    } catch (err) {
      // Backend not available yet — the local update above still stands.
    }
  };

  const handleDeleteLabWork = async (id: string) => {
    setLocalLabWorks((prev) => prev.filter((lw) => lw.id !== id));
    try {
      await deleteLabWorkMutation({ id });
    } catch (err) {
      // Backend not available yet — the local removal above still stands.
    }
  };

  const handleUpdateLabWorkStatus = async (id: string, status: LabWorkStatus) => {
    setLocalLabWorks((prev) => prev.map((lw) => (lw.id === id ? { ...lw, status } : lw)));
    try {
      await updateStatusMutation({ id, status });
    } catch (err) {
      // Backend not available yet — the local status change above still stands.
    }
  };

  const refetchLabWorks = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['labWorks'] });
  }, [queryClient]);

  const apiDerivedLabWorks = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(apiLabWorks)) {
      rawList = apiLabWorks;
    } else if (apiLabWorks && Array.isArray((apiLabWorks as any).labWorks)) {
      rawList = (apiLabWorks as any).labWorks;
    } else if (apiLabWorks && Array.isArray((apiLabWorks as any).data?.data)) {
      rawList = (apiLabWorks as any).data.data;
    } else if (apiLabWorks && Array.isArray((apiLabWorks as any).data)) {
      rawList = (apiLabWorks as any).data;
    } else if (apiLabWorks && Array.isArray((apiLabWorks as any).responseObject?.data)) {
      rawList = (apiLabWorks as any).responseObject.data;
    }

    return rawList
      .map((lw: any) => normalizeLabWork(lw))
      .filter((lw): lw is NonNullable<typeof lw> => lw !== null);
  }, [apiLabWorks]);

  // Merge real API results (once the backend exists) with the local/mock entries,
  // preferring the API's version of any entry that exists in both.
  const labWorks = useMemo(() => {
    const apiIds = new Set(apiDerivedLabWorks.map((lw) => lw.id));
    return [...apiDerivedLabWorks, ...localLabWorks.filter((lw) => !apiIds.has(lw.id))];
  }, [apiDerivedLabWorks, localLabWorks]);

  return {
    labWorks,
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
