import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateInventoryCategoryPayload {
  name: string;
  description?: string;
}

export function useCreateInventoryCategoryMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateInventoryCategoryPayload>({
    endpoint: "/inventory/categories",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["inventoryCategories"] });
      },
    },
  });
}
