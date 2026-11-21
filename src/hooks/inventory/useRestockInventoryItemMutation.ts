import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface RestockInventoryItemPayload {
  id: string;
  quantity: number;
  reason?: string;
  reference_id?: string;
}

export function useRestockInventoryItemMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, RestockInventoryItemPayload>({
    getEndpoint: (variables) => `/inventory/${variables.id}/restock`,
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
