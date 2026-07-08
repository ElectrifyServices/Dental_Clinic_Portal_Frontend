import { useApiMutation } from "../useApiMutation";

export function useDownloadTreatmentMutation() {
  return useApiMutation<any, { id: string }>({
    getEndpoint: (variables) => `/treatment/download/${variables.id}`,
    method: "get" as any,
  });
}
