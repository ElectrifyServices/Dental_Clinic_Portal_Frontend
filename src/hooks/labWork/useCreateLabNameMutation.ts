import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateLabNameVariables {
  name: string;
}

export function useCreateLabNameMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, CreateLabNameVariables>({
    endpoint: "/labName",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labNames"] });
      },
    },
  });
}
