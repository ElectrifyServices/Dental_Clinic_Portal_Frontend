import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateConsentFormMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, FormData>({
    endpoint: "/consentForm/create",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["consentForms"] });
      },
    },
  });
}
