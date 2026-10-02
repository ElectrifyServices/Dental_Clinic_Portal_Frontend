import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteInventoryItemPayload {
  id: string;
}

export function useDeleteInventoryItemMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, DeleteInventoryItemPayload>({
    getEndpoint: (variables) => `/inventory/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.invalidateQueries({ queryKey: ["inventorySummary"] });
      },
    },
  });
}
