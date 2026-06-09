import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTreatmentPlansQuery, TreatmentPlansFilters } from './treatment/useTreatmentPlansQuery';
import { useTreatmentPlanQuery } from './treatment/useTreatmentPlanQuery';
import { useCreateTreatmentPlanMutation } from './treatment/useCreateTreatmentPlanMutation';
import { useUpdateTreatmentPlanMutation } from './treatment/useUpdateTreatmentPlanMutation';
import { useMarkTreatmentPlanDoneMutation } from './treatment/useMarkTreatmentPlanDoneMutation';
import { useUpdateTreatmentPlanStatusMutation } from './treatment/useUpdateTreatmentPlanStatusMutation';
import {
  toUiTreatment,
  toApiCreatePlan,
  toApiUpdatePlan,
} from '../utils/treatmentPlanUtils';

export function useTreatmentData() {
  // State for filters that will be sent in the POST body
  const [filters, setFilters] = useState<TreatmentPlansFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // State for single treatment selection
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [shouldFetchSingle, setShouldFetchSingle] = useState(false);

  // Use the hook with the current filters - sends POST request with body
  const {
    data: plansRaw,
    isLoading,
    refetch,
    isFetching
  } = useTreatmentPlansQuery(filters);

  // Hook for fetching single treatment
  const {
    data: singleTreatmentRaw,
    isLoading: isLoadingSingle,
    refetch: refetchSingle,
  } = useTreatmentPlanQuery(selectedTreatmentId || undefined, {
    enabled: shouldFetchSingle && !!selectedTreatmentId,
  });

  const [localTreatments, setLocalTreatments] = useState<any[]>([]);
  const [completedConsultations, setCompletedConsultations] = useState<any[]>([]);

  // Debug log to see the response structure
  /* console.log removed */
  /* console.log removed */
  /* console.log removed */

  // Safely extract the data array from the response
  const apiTreatments = useMemo(() => {
    if (!plansRaw) return [];

    // The response could contain the array directly in data, or nested inside data.data
    const dataArray = Array.isArray(plansRaw.data)
      ? plansRaw.data
      : (plansRaw.data?.data || []);

    // Ensure it's an array before mapping
    if (!Array.isArray(dataArray)) {
      /* console.warn removed */
      return [];
    }

    return dataArray.map(toUiTreatment);
  }, [plansRaw]);

  const treatments = useMemo(() => {
    const merged = new Map<string, any>();
    apiTreatments.forEach((t: any) => {
      if (t && t.id) merged.set(t.id, t);
    });
    localTreatments.forEach((t: any) => {
      if (t && t.id) merged.set(t.id, t);
    });
    return Array.from(merged.values());
  }, [apiTreatments, localTreatments]);

  // Selected treatment in UI format
  const selectedTreatment = useMemo(() => {
    if (!singleTreatmentRaw) return null;
    // Check if the response has the treatment data nested
    const treatmentData = singleTreatmentRaw.data?.data || singleTreatmentRaw.data || singleTreatmentRaw;
    return toUiTreatment(treatmentData);
  }, [singleTreatmentRaw]);

  const createPlan = useCreateTreatmentPlanMutation();
  const updatePlan = useUpdateTreatmentPlanMutation();
  const markDone = useMarkTreatmentPlanDoneMutation();
  const updateStatus = useUpdateTreatmentPlanStatusMutation();

  // Function to fetch a single treatment
  const fetchSingleTreatment = useCallback((id: string) => {
    setSelectedTreatmentId(id);
    setShouldFetchSingle(true);
  }, []);

  // Function to clear selected treatment
  const clearSelectedTreatment = useCallback(() => {
    setSelectedTreatmentId(null);
    setShouldFetchSingle(false);
  }, []);

  // Function to refresh single treatment
  const refreshSingleTreatment = useCallback(async () => {
    if (selectedTreatmentId) {
      await refetchSingle();
    }
  }, [selectedTreatmentId, refetchSingle]);

  // Function to update filters and trigger a new POST request
  const updateFilters = (newFilters: Partial<TreatmentPlansFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except when explicitly changing page)
      page: newFilters.page !== undefined ? newFilters.page :
        (newFilters.search !== undefined || newFilters.filters ? 1 : prev.page),
    }));
  };

  // Handlers for TreatmentList component
  const handleFiltersChange = (searchFilters: any) => {
    // Convert the searchFilters from TreatmentList to the format expected by your API
    const newFilters: TreatmentPlansFilters = {};

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

    if (searchFilters.procedure) {
      newFilters.filters = {
        ...newFilters.filters,
        procedure: Array.isArray(searchFilters.procedure) ? searchFilters.procedure : [searchFilters.procedure],
      };
    }

    if (searchFilters.minCost !== undefined) {
      newFilters.filters = {
        ...newFilters.filters,
        minCost: searchFilters.minCost,
      };
    }

    if (searchFilters.maxCost !== undefined) {
      newFilters.filters = {
        ...newFilters.filters,
        maxCost: searchFilters.maxCost,
      };
    }

    if (searchFilters.startDate) {
      newFilters.startDate = searchFilters.startDate;
    }

    if (searchFilters.endDate) {
      newFilters.endDate = searchFilters.endDate;
    }

    updateFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleLimitChange = (limit: number) => {
    updateFilters({ limit, page: 1 });
  };

  const handleSortChange = (sortBy: string, sortOrder: 'ASC' | 'DESC') => {
    updateFilters({ sortBy, sortOrder });
  };

  const handleParamsChange = useCallback((params: {
    page: number;
    search: string;
    filters: { status?: string[] };
    startDate?: Date;
    endDate?: Date;
  }) => {
    const next: Partial<TreatmentPlansFilters> = {
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

  const handleSaveTreatment = async (treatment: any) => {
    const isEdit = Boolean(
      treatment.id && apiTreatments.some((plan: any) => plan && plan.id === treatment.id),
    );

    if (isEdit) {
      const updated = await updatePlan.mutateAsync(toApiUpdatePlan(treatment));
      const updatedUi = toUiTreatment(updated);
      setLocalTreatments((prev) => [
        ...prev.filter((item) => item && item.id !== updatedUi.id),
        updatedUi,
      ]);
      await refetch(); // Refetch to sync with server
      
      // Refresh single treatment if it's the one being edited
      if (selectedTreatmentId === treatment.id) {
        await refreshSingleTreatment();
      }
      
      return updatedUi;
    }

    /* console.log removed */

    const created = await createPlan.mutateAsync(toApiCreatePlan(treatment));
    const createdUi = toUiTreatment(created);
    setLocalTreatments((prev) => [
      ...prev.filter((item) => item && item.id !== createdUi.id),
      createdUi,
    ]);
    await refetch(); // Refetch to sync with server
    return createdUi;
  };

  const handleMarkCompleted = async (id: string) => {
    const updated = await markDone.mutateAsync({ id });
    const updatedUi = toUiTreatment(updated);
    setLocalTreatments((prev) => [
      ...prev.filter((item) => item && item.id !== updatedUi.id),
      updatedUi,
    ]);
    await refetch(); // Refetch to sync with server
    
    // Refresh single treatment if it's the one being marked
    if (selectedTreatmentId === id) {
      await refreshSingleTreatment();
    }
    
    return updatedUi;
  };

  const handleStartTreatment = async (id: string) => {
    const updated = await updateStatus.mutateAsync({ id, status: 'IN_PROGRESS' });
    const updatedUi = toUiTreatment(updated);
    setLocalTreatments((prev) => [
      ...prev.filter((item) => item && item.id !== updatedUi.id),
      updatedUi,
    ]);
    await refetch(); // Refetch to sync with server
    
    // Refresh single treatment if it's the one being started
    if (selectedTreatmentId === id) {
      await refreshSingleTreatment();
    }
    
    return updatedUi;
  };

  const setTreatments = (updater: (current: any[]) => any[]) => {
    setLocalTreatments(() => updater(treatments));
  };

  const handleUpdateConsultation = (consultation: any) => {
    setCompletedConsultations((prev) =>
      prev.map((c) => (c && c.id === consultation.id ? consultation : c)),
    );
  };

  // Get summary data from the response (can be nested in plansRaw.summary or plansRaw.data.summary)
  const summary = plansRaw?.summary || plansRaw?.data?.summary || {
    all: 0,
    active: 0,
    completed: 0,
    planned: 0,
    cancelled: 0,
    revenue: 0,
    averageCost: 0,
    minCost: 0,
    maxCost: 0,
    statusBreakdown: {},
  };

  const totals = {
    all: summary.all || 0,
    active: summary.active || 0,
    completed: summary.completed || 0,
    planned: summary.planned || 0,
    revenue: summary.revenue || 0,
  };

  return {
    // List data
    treatments,
    setTreatments,
    completedConsultations,
    setCompletedConsultations,
    isLoading: isLoading || isFetching,
    totals,
    totalItems: plansRaw?.pagination?.total || plansRaw?.data?.pagination?.total || 0,
    totalPages: plansRaw?.pagination?.totalPages || plansRaw?.data?.pagination?.totalPages || 1,
    currentPage: filters.page || 1,
    
    // Single treatment data
    selectedTreatment,
    isLoadingSingle,
    fetchSingleTreatment,
    clearSelectedTreatment,
    refreshSingleTreatment,
    
    // CRUD operations
    handleSaveTreatment,
    handleUpdateConsultation,
    handleMarkCompleted,
    handleStartTreatment,
    
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