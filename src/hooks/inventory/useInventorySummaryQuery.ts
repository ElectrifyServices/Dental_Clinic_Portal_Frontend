import { useApiQuery } from "../useApiQuery";

export interface InventorySummary {
  total_items: number;
  low_stock_count: number;
  total_categories: number;
  categories_summary: Array<{
    category: string;
    count: number;
  }>;
}

export function useInventorySummaryQuery(options?: any) {
  return useApiQuery<InventorySummary>({
    queryKey: ["inventorySummary"],
    endpoint: "/inventory/summary",
    method: "get",
    options,
  });
}
