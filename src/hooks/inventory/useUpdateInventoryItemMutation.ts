import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { CreateInventoryItemPayload } from "./useCreateInventoryItemMutation";

export interface UpdateInventoryItemPayload extends CreateInventoryItemPayload {
  id: string;
}

export function useUpdateInventoryItemMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateInventoryItemPayload>({
    getEndpoint: (variables) => `/inventory/${variables.id}`,
    method: "put",
    options: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.invalidateQueries({ queryKey: ["inventorySummary"] });
        queryClient.invalidateQueries({ queryKey: ["inventoryItem", variables.id] });
      },
    },
  });
}
