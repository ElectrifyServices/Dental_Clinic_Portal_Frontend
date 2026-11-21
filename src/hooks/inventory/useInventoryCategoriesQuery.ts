import { useApiQuery } from "../useApiQuery";

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export function useInventoryCategoriesQuery(options?: any) {
  return useApiQuery<InventoryCategory[]>({
    queryKey: ["inventoryCategories"],
    endpoint: "/inventory/categories",
    method: "get",
    options,
  });
}
