import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateLabNameVariables {
  id: string;
  name: string;
}

export function useUpdateLabNameMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, UpdateLabNameVariables>({
    getEndpoint: (variables) => `/labName/${variables.id}`,
    method: "put",
    // `id` only selects the endpoint; the body carries just the new name.
    transformRequest: (variables) => ({ name: variables.name }),
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labNames"] });
      },
    },
  });
}
