// hooks/treatment/useTreatmentPlanStatsQuery.ts
import { useApiQuery } from "../useApiQuery";

export interface TreatmentPlanStats {
  total: number;
  planned: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  projected_revenue: number;
  // Additional stats
  average_cost?: number;
  min_cost?: number;
  max_cost?: number;
  status_breakdown?: Record<string, number>;
  doctor_breakdown?: Array<{
    doctor_id: string;
    count: number;
    total_revenue: number;
  }>;
  procedure_breakdown?: Array<{
    procedure: string;
    count: number;
    total_revenue: number;
  }>;
}

export interface StatsFilters {
  patientId?: string | string[];
  doctorId?: string | string[];
  status?: string | string[];
  procedure?: string | string[];
  startDate?: Date;
  endDate?: Date;
  minCost?: number;
  maxCost?: number;
}

export function useTreatmentPlanStatsQuery(
  filters?: StatsFilters,
  options?: { enabled?: boolean },
) {
  // Build query parameters
  const buildQueryParams = () => {
    const params: any = {};
    
    if (!filters) return params;
    
    // Handle single or multiple IDs
    if (filters.patientId) {
      params.patientId = Array.isArray(filters.patientId) 
        ? filters.patientId.join(',') 
        : filters.patientId;
    }
    
    if (filters.doctorId) {
      params.doctorId = Array.isArray(filters.doctorId)
        ? filters.doctorId.join(',')
        : filters.doctorId;
    }
    
    // Handle multiple statuses
    if (filters.status) {
      params.status = Array.isArray(filters.status)
        ? filters.status.join(',')
        : filters.status;
    }
    
    // Handle multiple procedures
    if (filters.procedure) {
      params.procedure = Array.isArray(filters.procedure)
        ? filters.procedure.join(',')
        : filters.procedure;
    }
    
    // Date ranges
    if (filters.startDate) {
      params.startDate = filters.startDate.toISOString();
    }
    if (filters.endDate) {
      params.endDate = filters.endDate.toISOString();
    }
    
    // Cost ranges
    if (filters.minCost !== undefined) {
      params.minCost = filters.minCost;
    }
    if (filters.maxCost !== undefined) {
      params.maxCost = filters.maxCost;
    }
    
    return params;
  };
  
  const queryParams = buildQueryParams();
  const queryString = new URLSearchParams();
  
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] !== undefined && queryParams[key] !== null) {
      queryString.set(key, queryParams[key].toString());
    }
  });
  
  const endpoint = `/treatment/stats${queryString.toString() ? `?${queryString.toString()}` : ""}`;

  return useApiQuery<TreatmentPlanStats>({
    queryKey: ["treatmentPlanStats", filters],
    endpoint,
    method: "get",
    options: {
      enabled: options?.enabled ?? true,
      staleTime: 0,
    },
  });
}