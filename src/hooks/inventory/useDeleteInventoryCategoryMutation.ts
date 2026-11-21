import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteInventoryCategoryPayload {
  id: string;
}

export function useDeleteInventoryCategoryMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteInventoryCategoryPayload>({
    getEndpoint: (data) => `/inventory/categories/${data.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["inventoryCategories"] });
      },
    },
  });
}
