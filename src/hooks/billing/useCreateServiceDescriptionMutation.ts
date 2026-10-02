import type { ApiAny, ApiRecord } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateServiceDescriptionVariables {
  name: string;
  rate?: number;
  [key: string]: ApiAny; // Allow flexibility for other payload properties
}

export function useCreateServiceDescriptionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiRecord, CreateServiceDescriptionVariables>({
    getEndpoint: () => "/billingDescription",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["billingDescriptions"] });
      },
    },
  });
}
