import { useApiQuery } from "../useApiQuery";

export interface PatientAnalyticsFilter {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 1. Total Patients API
 * Endpoint: POST /patientAnalytics/total-patients
 */
export function useTotalPatientsAnalyticsQuery(filter: PatientAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["patientAnalytics", "total-patients", filter],
    endpoint: "/patientAnalytics/total-patients",
    method: "post",
    data: filter,
  });
}

/**
 * 2. New Patients API
 * Endpoint: POST /patientAnalytics/new-patients
 */
export function useNewPatientsAnalyticsQuery(filter: PatientAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["patientAnalytics", "new-patients", filter],
    endpoint: "/patientAnalytics/new-patients",
    method: "post",
    data: filter,
  });
}

/**
 * 3. Retention Rate API
 * Endpoint: POST /patientAnalytics/retention-rate
 */
export function useRetentionRateAnalyticsQuery(filter: PatientAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["patientAnalytics", "retention-rate", filter],
    endpoint: "/patientAnalytics/retention-rate",
    method: "post",
    data: filter,
  });
}

/**
 * 4. Churn Risk Count API
 * Endpoint: POST /patientAnalytics/churn-risk-count
 */
export function useChurnRiskCountAnalyticsQuery(filter: PatientAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["patientAnalytics", "churn-risk-count", filter],
    endpoint: "/patientAnalytics/churn-risk-count",
    method: "post",
    data: filter,
  });
}

/**
 * 5. Age Distribution API
 * Endpoint: POST /patientAnalytics/age-distribution
 */
export function useAgeDistributionAnalyticsQuery(filter: PatientAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["patientAnalytics", "age-distribution", filter],
    endpoint: "/patientAnalytics/age-distribution",
    method: "post",
    data: filter,
  });
}

/**
 * 6. Gender Distribution API
 * Endpoint: POST /patientAnalytics/gender-distribution
 */
export function useGenderDistributionAnalyticsQuery(filter: PatientAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["patientAnalytics", "gender-distribution", filter],
    endpoint: "/patientAnalytics/gender-distribution",
    method: "post",
    data: filter,
  });
}

/**
 * 7. Monthly Patient Growth API
 * Endpoint: POST /patientAnalytics/monthly-growth
 */
export function useMonthlyGrowthAnalyticsQuery(filter: PatientAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["patientAnalytics", "monthly-growth", filter],
    endpoint: "/patientAnalytics/monthly-growth",
    method: "post",
    data: filter,
  });
}

/**
 * 8. Churn Risk List API
 * Endpoint: POST /patientAnalytics/churn-risk
 */
export function useChurnRiskAnalyticsQuery(filter: PatientAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["patientAnalytics", "churn-risk", filter],
    endpoint: "/patientAnalytics/churn-risk",
    method: "post",
    data: filter,
  });
}
