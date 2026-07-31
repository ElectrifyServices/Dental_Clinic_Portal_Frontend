import { useApiQuery } from "../useApiQuery";

export interface InventoryQueryParams {
  search?: string;
  category?: string;
  low_stock?: boolean;
}

export function useInventoryListQuery(params?: InventoryQueryParams, options?: any) {
  // Construct body payload for POST request
  const apiParams: Record<string, any> = {};
  if (params?.search) apiParams.search = params.search;
  if (params?.category && params.category !== "all") {
    apiParams.filters = {
      category: [params.category]
    };
  }
  if (params?.low_stock) apiParams.low_stock = "true";

  return useApiQuery<any[]>({
    queryKey: ["inventory", params],
    endpoint: "/inventory/list",
    method: "post",
    data: apiParams,
    options,
  });
}
