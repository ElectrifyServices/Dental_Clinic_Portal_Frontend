import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteLabNameVariables {
  id: string;
}

export function useDeleteLabNameMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, DeleteLabNameVariables>({
    getEndpoint: (variables) => `/labName/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labNames"] });
      },
    },
  });
}
