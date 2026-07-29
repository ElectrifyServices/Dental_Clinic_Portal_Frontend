import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateLabNameVariables {
  name: string;
}

export function useCreateLabNameMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateLabNameVariables>({
    endpoint: "/labName",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labNames"] });
      },
    },
  });
}
