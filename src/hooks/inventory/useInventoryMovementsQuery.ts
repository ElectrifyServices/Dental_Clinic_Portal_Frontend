import { useApiQuery } from "../useApiQuery";

export interface InventoryMovement {
  id: string;
  item_id: string;
  movement_type: "RESTOCK" | "USAGE" | "ADJUSTMENT" | string;
  quantity: number;
  before_stock: number;
  after_stock: number;
  reason: string;
  reference_id: string | null;
  reference_type: string | null;
  performed_by: string | null;
  created_at: string;
}

export function useInventoryMovementsQuery(id?: string, page = 1, limit = 20) {
  return useApiQuery<InventoryMovement[]>({
    endpoint: `/inventory/${id}/movements?page=${page}&limit=${limit}`,
    queryKey: ["inventoryMovements", id, page, limit],
    options: {
      enabled: !!id,
      refetchOnMount: "always",
    },
  });
}
