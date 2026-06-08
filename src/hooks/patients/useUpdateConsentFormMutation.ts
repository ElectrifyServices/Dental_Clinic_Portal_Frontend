import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateConsentFormVariables {
  id: string;
  formData: FormData;
}

export function useUpdateConsentFormMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateConsentFormVariables>({
    getEndpoint: (variables) => `/consentForm/${variables.id}`,
    method: "put",
    transformRequest: (variables) => variables.formData,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["consentForms"] });
        queryClient.invalidateQueries({ queryKey: ["consentForm"] });
      },
    },
  });
}
