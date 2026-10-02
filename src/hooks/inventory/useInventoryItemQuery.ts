import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface InventoryItemData {
  id: string;
  name: string;
  category: string;
  description: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  batch_number: string;
  expiry_date: string;
  unit_cost: number;
  supplier: string;
  warranty: string;
  [key: string]: ApiAny;
}

export function useInventoryItemQuery(id?: string) {
  return useApiQuery<InventoryItemData>({
    endpoint: `/inventory/${id}`,
    queryKey: ["inventoryItem", id],
    options: {
      enabled: !!id,
      refetchOnMount: "always",
    },
  });
}
