import { useApiQuery } from "../useApiQuery";
import apiClient from "../../services/apiClient";

export interface InventoryAnalyticsFilter {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

export function useTotalSkusAnalyticsQuery(filter: InventoryAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["inventoryAnalytics", "total-skus", filter],
    endpoint: "/inventoryAnalytics/total-skus",
    method: "post",
    data: filter,
  });
}

export function useCriticalItemsAnalyticsQuery(filter: InventoryAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["inventoryAnalytics", "critical-items", filter],
    endpoint: "/inventoryAnalytics/critical-items",
    method: "post",
    data: filter,
  });
}

export function useExpiringSoonAnalyticsQuery(filter: InventoryAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["inventoryAnalytics", "expiring-soon", filter],
    endpoint: "/inventoryAnalytics/expiring-soon",
    method: "post",
    data: filter,
  });
}

export function useMonthlySpendAnalyticsQuery(filter: InventoryAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["inventoryAnalytics", "restock-spend", filter],
    endpoint: "/inventoryAnalytics/restock-spend",
    method: "post",
    data: filter,
  });
}

export function useCriticalStockAnalyticsQuery(filter: InventoryAnalyticsFilter = {}) {
  return useApiQuery<any>({
    queryKey: ["inventoryAnalytics", "critical-stock", filter],
    endpoint: "/inventoryAnalytics/critical-stock",
    method: "post",
    data: filter,
  });
}

export const exportInventoryAnalytics = async (filter: any) => {
  return apiClient.post("/inventoryAnalytics/export", { ...filter, format: "xlsx" }, { responseType: "blob" });
};
