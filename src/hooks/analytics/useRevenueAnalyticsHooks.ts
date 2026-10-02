import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";
import apiClient from "../../services/apiClient";

export interface RevenueAnalyticsFilter {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

export function useTotalRevenueQuery(filter: RevenueAnalyticsFilter = {}) {
  return useApiQuery<ApiAny>({
    queryKey: ["revenueAnalytics", "total-revenue", filter],
    endpoint: "/revenueAnalytics/total-revenue",
    method: "post",
    data: filter,
    options: {
      refetchOnMount: true,
      staleTime: 0,
      select: (res: ApiAny) => res?.data ?? res
    }
  });
}

export function useAvgDailyRevenueQuery(filter: RevenueAnalyticsFilter = {}) {
  return useApiQuery<ApiAny>({
    queryKey: ["revenueAnalytics", "avg-daily-revenue", filter],
    endpoint: "/revenueAnalytics/avg-daily-revenue",
    method: "post",
    data: filter,
    options: {
      refetchOnMount: true,
      staleTime: 0,
      select: (res: ApiAny) => res?.data ?? res
    }
  });
}

export function useCollectionRateQuery(filter: RevenueAnalyticsFilter = {}) {
  return useApiQuery<ApiAny>({
    queryKey: ["revenueAnalytics", "collection-rate", filter],
    endpoint: "/revenueAnalytics/collection-rate",
    method: "post",
    data: filter,
    options: {
      refetchOnMount: true,
      staleTime: 0,
      select: (res: ApiAny) => res?.data ?? res
    }
  });
}

export function useTopProcedureQuery(filter: RevenueAnalyticsFilter = {}) {
  return useApiQuery<ApiAny>({
    queryKey: ["revenueAnalytics", "top-procedure", filter],
    endpoint: "/revenueAnalytics/top-procedure",
    method: "post",
    data: filter,
    options: {
      refetchOnMount: true,
      staleTime: 0,
      select: (res: ApiAny) => res?.data ?? res
    }
  });
}

export function useRevenueByPaymentModeQuery(filter: RevenueAnalyticsFilter = {}) {
  return useApiQuery<ApiAny[]>({
    queryKey: ["revenueAnalytics", "revenue-by-payment-mode", filter],
    endpoint: "/revenueAnalytics/revenue-by-payment-mode",
    method: "post",
    data: filter,
    options: {
      refetchOnMount: true,
      staleTime: 0,
      select: (res: ApiAny) => res?.data ?? res
    }
  });
}

export function useDailyRevenueQuery(filter: RevenueAnalyticsFilter = {}) {
  return useApiQuery<ApiAny[]>({
    queryKey: ["revenueAnalytics", "daily-revenue", filter],
    endpoint: "/revenueAnalytics/daily-revenue",
    method: "post",
    data: filter,
    options: {
      refetchOnMount: true,
      staleTime: 0,
      select: (res: ApiAny) => res?.data ?? res
    }
  });
}

export const exportRevenueAnalytics = async (filter: ApiAny) => {
  return apiClient.post("/revenueAnalytics/export", { ...filter, format: "xlsx" }, { responseType: "blob" });
};
