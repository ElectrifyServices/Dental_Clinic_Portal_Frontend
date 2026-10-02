import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateServiceDescriptionVariables {
  id: string;
  name?: string;
  rate?: number;
  [key: string]: ApiAny;
}

export function useUpdateServiceDescriptionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, UpdateServiceDescriptionVariables>({
    getEndpoint: (variables) => `/billingDescription/${variables.id}`,
    method: "patch",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["billingDescriptions"] });
      },
    },
  });
}
