import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateConsentFormMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, FormData>({
    endpoint: "/consent",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["consent"] });
      },
    },
  });
}
