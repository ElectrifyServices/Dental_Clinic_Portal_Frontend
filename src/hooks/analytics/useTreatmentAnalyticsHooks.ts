import { useApiQuery } from "../useApiQuery";
import apiClient from "../../services/apiClient";
export interface TreatmentAnalyticsFilter {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * 1. Total Procedures API
 * Endpoint: POST /treatmentAnalytics/total-procedures
 */
export function useTotalProceduresQuery(filter: TreatmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["treatmentAnalytics", "total-procedures", filter],
    endpoint: "/treatmentAnalytics/total-procedures",
    method: "post",
    data: filter,
  });
}

/**
 * 2. Completion Rate API
 * Endpoint: POST /treatmentAnalytics/completion-rate
 */
export function useCompletionRateQuery(filter: TreatmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["treatmentAnalytics", "completion-rate", filter],
    endpoint: "/treatmentAnalytics/completion-rate",
    method: "post",
    data: filter,
  });
}

/**
 * 3. Avg Procedure Cost API
 * Endpoint: POST /treatmentAnalytics/avg-procedure-cost
 */
export function useAvgProcedureCostQuery(filter: TreatmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["treatmentAnalytics", "avg-procedure-cost", filter],
    endpoint: "/treatmentAnalytics/avg-procedure-cost",
    method: "post",
    data: filter,
  });
}

/**
 * 4. Highest Revenue API
 * Endpoint: POST /treatmentAnalytics/highest-revenue
 */
export function useHighestRevenueQuery(filter: TreatmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["treatmentAnalytics", "highest-revenue", filter],
    endpoint: "/treatmentAnalytics/highest-revenue",
    method: "post",
    data: filter,
  });
}

/**
 * 5. Top Treatments By Revenue API
 * Endpoint: POST /treatmentAnalytics/top-treatments-by-revenue
 */
export function useTopTreatmentsByRevenueQuery(filter: TreatmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["treatmentAnalytics", "top-treatments-by-revenue", filter],
    endpoint: "/treatmentAnalytics/top-treatments-by-revenue",
    method: "post",
    data: filter,
  });
}

/**
 * 6. All Treatment Revenue API (paginated)
 * Endpoint: POST /treatmentAnalytics/all-treatment-revenue
 */
export function useAllTreatmentRevenueQuery(filter: TreatmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["treatmentAnalytics", "all-treatment-revenue", filter],
    endpoint: "/treatmentAnalytics/all-treatment-revenue",
    method: "post",
    data: filter,
  });
}

/**
 * 7. Procedures By Volume API
 * Endpoint: POST /treatmentAnalytics/procedures-by-volume
 */
export function useProceduresByVolumeQuery(filter: TreatmentAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["treatmentAnalytics", "procedures-by-volume", filter],
    endpoint: "/treatmentAnalytics/procedures-by-volume",
    method: "post",
    data: filter,
  });
}

export const exportTreatmentAnalytics = async (filter: any) => {
  return apiClient.post("/treatmentAnalytics/export", { ...filter, format: "xlsx" }, { responseType: "blob" });
};
