import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateInventoryItemPayload {
  name: string;
  category: string;
  description?: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  batch_number?: string;
  expiry_date?: string;
  unit_cost?: number;
  supplier?: string;
  warranty?: string;
}

export interface CreateInventoryItemResponse {
  id: string;
  [key: string]: any;
}

export function useCreateInventoryItemMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<CreateInventoryItemResponse, CreateInventoryItemPayload>({
    endpoint: "/inventory",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.invalidateQueries({ queryKey: ["inventorySummary"] });
      },
    },
  });
}
