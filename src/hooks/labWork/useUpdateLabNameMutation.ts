import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateLabNameVariables {
  id: string;
  name: string;
}

export function useUpdateLabNameMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateLabNameVariables>({
    getEndpoint: (variables) => `/labName/${variables.id}`,
    method: "put",
    transformRequest: (variables) => {
      const { id, ...rest } = variables;
      return rest;
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labNames"] });
      },
    },
  });
}
