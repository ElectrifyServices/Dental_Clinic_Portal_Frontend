import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateServiceDescriptionVariables {
  name: string;
  rate?: number;
  [key: string]: any; // Allow flexibility for other payload properties
}

export function useCreateServiceDescriptionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateServiceDescriptionVariables>({
    getEndpoint: () => "/serviceDescription",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["serviceDescriptions"] });
      },
    },
  });
}
