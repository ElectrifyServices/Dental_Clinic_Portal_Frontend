import { useApiQuery } from "../useApiQuery";

export interface MembershipAnalyticsFilter {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 1. Total Members API
 * Endpoint: POST /membershipAnalytics/total-members
 */
export function useTotalMembersAnalyticsQuery(filter: MembershipAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["membershipAnalytics", "total-members", filter],
    endpoint: "/membershipAnalytics/total-members",
    method: "post",
    data: filter,
  });
}

/**
 * 2. Revenue (Plans) API
 * Endpoint: POST /membershipAnalytics/revenue
 */
export function useMembershipRevenueAnalyticsQuery(filter: MembershipAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["membershipAnalytics", "revenue", filter],
    endpoint: "/membershipAnalytics/revenue",
    method: "post",
    data: filter,
  });
}

/**
 * 3. Avg Utilization API
 * Endpoint: POST /membershipAnalytics/avg-utilization
 */
export function useAvgUtilizationAnalyticsQuery(filter: MembershipAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["membershipAnalytics", "avg-utilization", filter],
    endpoint: "/membershipAnalytics/avg-utilization",
    method: "post",
    data: filter,
  });
}

/**
 * 4. Renewal Rate API
 * Endpoint: POST /membershipAnalytics/renewal-rate
 */
export function useRenewalRateAnalyticsQuery(filter: MembershipAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["membershipAnalytics", "renewal-rate", filter],
    endpoint: "/membershipAnalytics/renewal-rate",
    method: "post",
    data: filter,
  });
}

/**
 * 5. Plan-Wise Performance API
 * Endpoint: POST /membershipAnalytics/plan-wise-performance
 */
export function usePlanWisePerformanceAnalyticsQuery(filter: MembershipAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["membershipAnalytics", "plan-wise-performance", filter],
    endpoint: "/membershipAnalytics/plan-wise-performance",
    method: "post",
    data: filter,
  });
}
