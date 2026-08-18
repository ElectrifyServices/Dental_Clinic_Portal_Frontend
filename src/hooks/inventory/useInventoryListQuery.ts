import { useApiQuery } from "../useApiQuery";

export interface InventoryQueryParams {
  search?: string;
  category?: string;
  low_stock?: boolean;
  page?: number;
  limit?: number;
}

export function useInventoryListQuery(params?: InventoryQueryParams, options?: any) {
  // Construct body payload for POST request
  const apiParams: Record<string, any> = {};
  apiParams.page = params?.page ?? 1;
  apiParams.limit = params?.limit ?? 10;
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
    params: {
      page: apiParams.page,
      limit: apiParams.limit,
    },
    options,
  });
}
