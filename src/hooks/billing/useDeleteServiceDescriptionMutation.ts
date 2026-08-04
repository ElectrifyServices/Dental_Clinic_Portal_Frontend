import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface DeleteServiceDescriptionVariables {
  id: string;
}

export function useDeleteServiceDescriptionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteServiceDescriptionVariables>({
    getEndpoint: (variables) => `/serviceDescription/${variables.id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["serviceDescriptions"] });
      },
    },
  });
}
