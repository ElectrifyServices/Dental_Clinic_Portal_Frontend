import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteLabWorkVariables {
  id: string;
}

export function useDeleteLabWorkMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, DeleteLabWorkVariables>({
    getEndpoint: (variables) => `/labWork/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labWorks"] });
      },
    },
  });
}
