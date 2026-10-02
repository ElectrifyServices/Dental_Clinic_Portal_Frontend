import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateInventoryCategoryPayload {
  id: string;
  name?: string;
  description?: string;
}

export function useUpdateInventoryCategoryMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, UpdateInventoryCategoryPayload>({
    getEndpoint: (data) => `/inventory/categories/${data.id}`,
    method: "patch",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["inventoryCategories"] });
      },
    },
  });
}
