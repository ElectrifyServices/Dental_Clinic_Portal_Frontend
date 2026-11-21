// hooks/useConsultationData.ts
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useConsultationsQuery, ConsultationsFilters } from './consultation/useConsultationsQuery';
import { useConsultationQuery } from './consultation/useConsultationQuery';
import { useCreateConsultationMutation } from './consultation/useCreateConsultationMutation';
import { useUpdateConsultationMutation } from './consultation/useUpdateConsultationMutation';
import { useCompleteConsultationMutation } from './consultation/useCompleteConsultationMutation';
import { useDeleteConsultationMutation } from './consultation/useDeleteConsultationMutation';
import {
  toUiConsultation,
  toApiCreateConsultation,
  toApiUpdateConsultation,
} from '../utils/consultationUtils';

export function useConsultationData() {
  const unwrapConsultationResponse = (payload: any) =>
    payload?.data?.data ||
    payload?.responseObject?.data?.data ||
    payload?.data ||
    payload?.responseObject?.data ||
    payload;

  // State for filters that will be sent in the POST body
  const [filters, setFilters] = useState<ConsultationsFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // State for single consultation selection
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [shouldFetchSingle, setShouldFetchSingle] = useState(false);

  // Queue management state
  const [queuedPatients, setQueuedPatients] = useState<any[]>([]);
  const [localConsultations, setLocalConsultations] = useState<any[]>([]);

  // Use the hook with the current filters - sends POST request with body
  const {
    data: consultationsRaw,
    isLoading,
    refetch,
    isFetching
  } = useConsultationsQuery(filters);

  // Hook for fetching single consultation
  const {
    data: singleConsultationRaw,
    isLoading: isLoadingSingle,
    refetch: refetchSingle,
  } = useConsultationQuery(selectedConsultationId || undefined, {
    enabled: shouldFetchSingle && !!selectedConsultationId,
  });

  // Safely extract the data array from the response
  const apiConsultations = useMemo(() => {
    if (!consultationsRaw) return [];

    // The response should have a data property containing consultations
    let dataArray = consultationsRaw.data?.consultations || consultationsRaw.consultations || consultationsRaw.data?.data || consultationsRaw.data || [];

    // If it's wrapped inside a data property of the data object
    if (dataArray.data && Array.isArray(dataArray.data)) {
      dataArray = dataArray.data;
    }

    // Ensure it's an array before mapping
    if (!Array.isArray(dataArray)) {
      return [];
    }

    return dataArray.map(toUiConsultation);
  }, [consultationsRaw]);

  // Merge API consultations with local updates
  const consultations = useMemo(() => {
    const merged = new Map<string, any>();
    apiConsultations.forEach((c: any) => {
      if (c && c.id) merged.set(c.id, c);
    });
    localConsultations.forEach((c: any) => {
      if (c && c.id) merged.set(c.id, c);
    });
    return Array.from(merged.values());
  }, [apiConsultations, localConsultations]);

  // Selected consultation in UI format
  const selectedConsultation = useMemo(() => {
    if (!singleConsultationRaw) return null;
    // Check if the response has the consultation data nested
    const consultationData = singleConsultationRaw.data?.data || singleConsultationRaw.data || singleConsultationRaw;
    return toUiConsultation(consultationData);
  }, [singleConsultationRaw]);

  // Mutations
  const createConsultation = useCreateConsultationMutation();
  const updateConsultation = useUpdateConsultationMutation();
  const completeConsultation = useCompleteConsultationMutation();
  const deleteConsultation = useDeleteConsultationMutation();

  // Function to fetch a single consultation
  const fetchSingleConsultation = useCallback((id: string) => {
    setSelectedConsultationId(id);
    setShouldFetchSingle(true);
  }, []);

  // Function to clear selected consultation
  const clearSelectedConsultation = useCallback(() => {
    setSelectedConsultationId(null);
    setShouldFetchSingle(false);
  }, []);

  // Function to refresh single consultation
  const refreshSingleConsultation = useCallback(async () => {
    if (selectedConsultationId) {
      await refetchSingle();
    }
  }, [selectedConsultationId, refetchSingle]);

  // Function to update filters and trigger a new POST request
  const updateFilters = useCallback((newFilters: Partial<ConsultationsFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except when explicitly changing page)
      page: newFilters.page !== undefined ? newFilters.page :
        (newFilters.search !== undefined || newFilters.filters ? 1 : prev.page),
    }));
  }, []);

  // Handlers for filtering consultations
  const handleFiltersChange = useCallback((searchFilters: any) => {
    const newFilters: ConsultationsFilters = {};

    if (searchFilters.search) {
      newFilters.search = searchFilters.search;
    }

    if (searchFilters.status) {
      newFilters.filters = {
        ...newFilters.filters,
        status: Array.isArray(searchFilters.status) ? searchFilters.status : [searchFilters.status],
      };
    }

    if (searchFilters.patientId) {
      newFilters.filters = {
        ...newFilters.filters,
        patientId: Array.isArray(searchFilters.patientId) ? searchFilters.patientId : [searchFilters.patientId],
      };
    }

    if (searchFilters.doctorId) {
      newFilters.filters = {
        ...newFilters.filters,
        doctorId: Array.isArray(searchFilters.doctorId) ? searchFilters.doctorId : [searchFilters.doctorId],
      };
    }

    if (searchFilters.startDate) {
      newFilters.startDate = searchFilters.startDate;
    }

    if (searchFilters.endDate) {
      newFilters.endDate = searchFilters.endDate;
    }

    updateFilters(newFilters);
  }, [updateFilters]);

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const handleLimitChange = useCallback((limit: number) => {
    updateFilters({ limit, page: 1 });
  }, [updateFilters]);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'ASC' | 'DESC') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  const handleParamsChange = useCallback((params: {
    page: number;
    search: string;
    filters: { status?: string[] };
    startDate?: Date;
    endDate?: Date;
  }) => {
    const next: Partial<ConsultationsFilters> = {
      page: params.page,
      search: params.search || undefined,
    };

    if (params.filters.status?.length) {
      next.filters = { ...filters.filters, status: params.filters.status };
    } else {
      // Clear status filter but keep any other existing filters
      const { status: _removed, ...restFilters } = filters.filters ?? {};
      next.filters = Object.keys(restFilters).length ? restFilters : undefined;
    }

    if (params.startDate) next.startDate = params.startDate;
    if (params.endDate) next.endDate = params.endDate;

    setFilters(prev => ({ ...prev, ...next }));
  }, [filters.filters]);

  // Save consultation (create or update)
  const handleSaveConsultation = async (consultation: any) => {
    const isEdit = Boolean(
      consultation.id && apiConsultations.some((c: any) => c && c.id === consultation.id),
    );

    if (isEdit) {
      const updated = await updateConsultation.mutateAsync(toApiUpdateConsultation(consultation));
      const updatedRaw = unwrapConsultationResponse(updated);
      const updatedUi = toUiConsultation(updatedRaw);
      if (updatedUi?.id) {
        setLocalConsultations((prev) => [
          ...prev.filter((item) => item && item.id !== updatedUi.id),
          updatedUi,
        ]);
      }
      await refetch(); // Refetch to sync with server

      // Refresh single consultation if it's the one being edited
      if (selectedConsultationId === consultation.id) {
        await refreshSingleConsultation();
      }

      return updated;
    }
    const created = await createConsultation.mutateAsync(toApiCreateConsultation(consultation));
    const createdRaw = unwrapConsultationResponse(created);
    const createdUi = toUiConsultation(createdRaw);
    if (createdUi?.id) {
      setLocalConsultations((prev) => [
        ...prev.filter((item) => item && item.id !== createdUi.id),
        createdUi,
      ]);
    }
    await refetch(); // Refetch to sync with server
    return created;
  };

  // Mark consultation as completed
  const handleCompleteConsultation = async (id: string, completionData?: any) => {
    try {
      const updated = await completeConsultation.mutateAsync({ id, ...completionData });
      const updatedUi = toUiConsultation(updated);
      setLocalConsultations((prev) => [
        ...prev.filter((item) => item && item.id !== updatedUi.id),
        updatedUi,
      ]);

      // Do not remove from queue, so it shows in 'All' and 'Completed' filters
      setQueuedPatients((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: "completed" } : p)
      );

      await refetch(); // Refetch to sync with server

      // Refresh single consultation if it's the one being completed
      if (selectedConsultationId === id) {
        await refreshSingleConsultation();
      }

      return updatedUi;
    } catch (error) {
      throw error;
    }
  };

  // Delete consultation
  const handleDeleteConsultation = async (id: string) => {
    try {
      await deleteConsultation.mutateAsync({ id });
      setLocalConsultations((prev) => prev.filter((item) => item && item.id !== id));
      setQueuedPatients((prev) => prev.filter((p) => p.id !== id));
      await refetch(); // Refetch to sync with server

      // Clear selected if it was deleted
      if (selectedConsultationId === id) {
        clearSelectedConsultation();
      }
    } catch (error) {
      throw error;
    }
  };

  // Update patient status in queue
  const handleUpdatePatientStatus = useCallback(async (id: string, status: string) => {
    setQueuedPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    const isExistingBackend = id && !String(id).startsWith("WALK-");
    if (isExistingBackend) {
      try {
        await updateConsultation.mutateAsync({ id, status } as any);
      } catch (err) {
      }
    }
  }, [updateConsultation]);

  // Add patient to queue
  const addToQueue = useCallback((patient: any) => {
    setQueuedPatients((prev) => {
      // Check if patient already in queue
      if (prev.some((p) => p.id === patient.id)) {
        return prev;
      }
      return [...prev, patient];
    });
  }, []);

  // Remove from queue
  const removeFromQueue = useCallback((id: string) => {
    setQueuedPatients((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Get summary data from the response
  const summary = consultationsRaw?.summary || {
    all: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    cancelled: 0,
    revenue: 0,
    averageCost: 0,
    minCost: 0,
    maxCost: 0,
    statusBreakdown: {},
  };

  const totals = {
    all: summary.all,
    completed: summary.completed,
    inProgress: summary.inProgress,
    scheduled: summary.scheduled,
    revenue: summary.revenue,
  };

  return {
    // List data
    consultations,
    setConsultations: setLocalConsultations,
    isLoading: isLoading || isFetching,
    totals,
    totalItems: consultationsRaw?.pagination?.total_items || consultationsRaw?.data?.pagination?.total_items || consultationsRaw?.total || 0,
    totalPages: consultationsRaw?.pagination?.total_pages || consultationsRaw?.data?.pagination?.total_pages || consultationsRaw?.totalPages || 1,
    currentPage: filters.page || 1,

    // Queue management
    queuedPatients,
    setQueuedPatients,
    addToQueue,
    removeFromQueue,
    handleUpdatePatientStatus,

    // Single consultation data
    selectedConsultation,
    isLoadingSingle,
    fetchSingleConsultation,
    clearSelectedConsultation,
    refreshSingleConsultation,

    // CRUD operations
    handleSaveConsultation,
    handleCompleteConsultation,
    handleDeleteConsultation,

    // Filter management
    filters,
    updateFilters,
    handleFiltersChange,
    handlePageChange,
    handleLimitChange,
    handleSortChange,
    handleParamsChange,

    // Refetch function
    refetch,
  };
}
