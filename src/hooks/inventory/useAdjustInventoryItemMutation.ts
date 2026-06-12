import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface AdjustInventoryItemPayload {
  id: string;
  quantity_delta: number;
  reason?: string;
  reference_id?: string;
}

export function useAdjustInventoryItemMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, AdjustInventoryItemPayload>({
    getEndpoint: (variables) => `/inventory/${variables.id}/adjust`,
    method: "patch",
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
