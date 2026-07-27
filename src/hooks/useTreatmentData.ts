import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTreatmentPlansQuery, TreatmentPlansFilters } from './treatment/useTreatmentPlansQuery';
import { useTreatmentPlanQuery } from './treatment/useTreatmentPlanQuery';
import { useCreateTreatmentPlanMutation } from './treatment/useCreateTreatmentPlanMutation';
import { useUpdateTreatmentPlanMutation } from './treatment/useUpdateTreatmentPlanMutation';
import { useTreatmentPlanStatsQuery } from './treatment/useTreatmentPlanStatsQuery';

import { useUpdateTreatmentPlanStatusMutation } from './treatment/useUpdateTreatmentPlanStatusMutation';
import {
  toUiTreatment,
  toApiCreatePlan,
  toApiUpdatePlan,
} from '../utils/treatmentPlanUtils';

export function useTreatmentData(params?: { enabled?: boolean }) {
  const isEnabled = params?.enabled !== false;
  
  const [filters, setFilters] = useState<TreatmentPlansFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [shouldFetchSingle, setShouldFetchSingle] = useState(false);

  
  const {
    data: plansRaw,
    isLoading,
    refetch,
    isFetching
  } = useTreatmentPlansQuery(filters, { enabled: isEnabled });

  const { data: statsRaw, isLoading: isStatsLoading } = useTreatmentPlanStatsQuery(
    undefined,
    { enabled: isEnabled }
  );

  
  const {
    data: singleTreatmentRaw,
    isLoading: isLoadingSingle,
    refetch: refetchSingle,
  } = useTreatmentPlanQuery(selectedTreatmentId || undefined, {
    enabled: shouldFetchSingle && !!selectedTreatmentId,
  });

  const [localTreatments, setLocalTreatments] = useState<any[]>([]);
  const [completedConsultations, setCompletedConsultations] = useState<any[]>([]);

  
  const apiTreatments = useMemo(() => {
    if (!plansRaw) return [];

    
    const dataArray = Array.isArray(plansRaw.data)
      ? plansRaw.data
      : (plansRaw.data?.data || []);

    
    if (!Array.isArray(dataArray)) {
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

  
  const selectedTreatment = useMemo(() => {
    if (!singleTreatmentRaw) return null;
    
    const treatmentData = singleTreatmentRaw.data?.data || singleTreatmentRaw.data || singleTreatmentRaw;
    return toUiTreatment(treatmentData);
  }, [singleTreatmentRaw]);

  const createPlan = useCreateTreatmentPlanMutation();
  const updatePlan = useUpdateTreatmentPlanMutation();

  const updateStatus = useUpdateTreatmentPlanStatusMutation();

  
  const fetchSingleTreatment = useCallback((id: string) => {
    setSelectedTreatmentId(id);
    setShouldFetchSingle(true);
  }, []);

  
  const clearSelectedTreatment = useCallback(() => {
    setSelectedTreatmentId(null);
    setShouldFetchSingle(false);
  }, []);

  
  const refreshSingleTreatment = useCallback(async () => {
    if (selectedTreatmentId) {
      await refetchSingle();
    }
  }, [selectedTreatmentId, refetchSingle]);

  
  const updateFilters = (newFilters: Partial<TreatmentPlansFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      
      page: newFilters.page !== undefined ? newFilters.page :
        (newFilters.search !== undefined || newFilters.filters ? 1 : prev.page),
    }));
  };

  
  const handleFiltersChange = (searchFilters: any) => {
    
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
    filters: { status?: string[]; doctorId?: string[]; procedure?: string[] };
    startDate?: Date;
    endDate?: Date;
  }) => {
    const next: Partial<TreatmentPlansFilters> = {
      page: params.page,
      search: params.search || undefined,
    };

    const currentFilters = { ...(filters.filters ?? {}) };

    if (params.filters.status?.length) currentFilters.status = params.filters.status;
    else delete currentFilters.status;

    if (params.filters.doctorId?.length) currentFilters.doctorId = params.filters.doctorId;
    else delete currentFilters.doctorId;

    if (params.filters.procedure?.length) currentFilters.procedure = params.filters.procedure;
    else delete currentFilters.procedure;

    next.filters = Object.keys(currentFilters).length ? currentFilters : undefined;

    if (params.startDate) next.startDate = params.startDate;
    else next.startDate = undefined;
    if (params.endDate) next.endDate = params.endDate;
    else next.endDate = undefined;

    setFilters(prev => ({ ...prev, ...next }));
  }, [filters.filters]);

  const handleSaveTreatment = async (treatment: any) => {
    const isEdit = Boolean(
      treatment.id && treatment.id !== "new" && treatment.id !== "create",
    );

    if (isEdit) {
      const updated = await updatePlan.mutateAsync(toApiUpdatePlan(treatment));
      const updatedUi = toUiTreatment(updated);
      setLocalTreatments((prev) => [
        ...prev.filter((item) => item && item.id !== updatedUi.id),
        updatedUi,
      ]);
      await refetch(); 
      
      
      if (selectedTreatmentId === treatment.id) {
        await refreshSingleTreatment();
      }
      
      return updatedUi;
    }

    const created = await createPlan.mutateAsync(toApiCreatePlan(treatment));
    const createdUi = toUiTreatment(created);
    setLocalTreatments((prev) => [
      ...prev.filter((item) => item && item.id !== createdUi.id),
      createdUi,
    ]);
    await refetch(); 
    return createdUi;
  };



  const handleStartTreatment = async (id: string) => {
    const updated = await updateStatus.mutateAsync({ id, status: 'IN_PROGRESS' });
    const updatedUi = toUiTreatment(updated);
    setLocalTreatments((prev) => [
      ...prev.filter((item) => item && item.id !== updatedUi.id),
      updatedUi,
    ]);
    await refetch(); 
    
    
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

  
  const stats = (statsRaw as any)?.data || statsRaw || {
    total: 0,
    planned: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    projected_revenue: 0,
  };

  const totals = {
    all: Number(stats.total || 0),
    active: Number(stats.in_progress || 0),
    completed: Number(stats.completed || 0),
    planned: Number(stats.planned || 0),
    revenue: Number(stats.projected_revenue || 0),
  };

  return {
    
    treatments,
    setTreatments,
    completedConsultations,
    setCompletedConsultations,
    isLoading: isLoading || isFetching || isStatsLoading,
    isInitialLoading: isLoading && !plansRaw,
    isTableFetching: isFetching,
    isStatsLoading,
    totals,
    totalItems: (plansRaw as any)?.pagination?.total || (plansRaw as any)?.pagination?.total_items || (plansRaw as any)?.data?.pagination?.total || (plansRaw as any)?.data?.pagination?.total_items || (plansRaw as any)?.total || (plansRaw as any)?.total_elements || (plansRaw as any)?.totalElements || (plansRaw as any)?.count || treatments.length || 0,
    totalPages: (plansRaw as any)?.pagination?.totalPages || (plansRaw as any)?.pagination?.total_pages || (plansRaw as any)?.data?.pagination?.totalPages || (plansRaw as any)?.data?.pagination?.total_pages || (plansRaw as any)?.totalPages || (plansRaw as any)?.total_pages || Math.max(1, Math.ceil(treatments.length / (filters.limit || 10))),
    currentPage: filters.page || 1,
    
    
    selectedTreatment,
    isLoadingSingle,
    fetchSingleTreatment,
    clearSelectedTreatment,
    refreshSingleTreatment,
    
    
    handleSaveTreatment,
    handleUpdateConsultation,

    handleStartTreatment,
    
    
    filters,
    updateFilters,
    handleFiltersChange,
    handlePageChange,
    handleLimitChange,
    handleSortChange,
    handleParamsChange,
    
    
    refetch,
  };
}
