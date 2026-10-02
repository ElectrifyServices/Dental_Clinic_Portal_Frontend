import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  [key: string]: ApiAny;
}

export function useInventoryCategoriesQuery(options?: ApiAny) {
  return useApiQuery<InventoryCategory[]>({
    queryKey: ["inventoryCategories"],
    endpoint: "/inventory/categories",
    method: "get",
    options,
  });
}
