import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteConsentFormVariables {
  id: string;
}

export function useDeleteConsentFormMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteConsentFormVariables>({
    getEndpoint: (variables) => `/consent/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["consent"] });
      },
    },
  });
}
