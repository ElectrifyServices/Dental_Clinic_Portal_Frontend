import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface ConsumeInventoryItemPayload {
  id: string;
  quantity: number;
  reason?: string;
  reference_id?: string;
}

export function useConsumeInventoryItemMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, ConsumeInventoryItemPayload>({
    getEndpoint: (variables) => `/inventory/${variables.id}/consume`,
    method: "post",
    options: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.invalidateQueries({ queryKey: ["inventorySummary"] });
        queryClient.invalidateQueries({ queryKey: ["inventoryItem", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["inventoryMovements", variables.id] });
      },
    },
  });
}
