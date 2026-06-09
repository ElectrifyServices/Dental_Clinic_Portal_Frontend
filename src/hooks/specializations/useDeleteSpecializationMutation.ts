import { useApiMutation } from "../useApiMutation";

export function useDeleteSpecializationMutation() {
  return useApiMutation<any, string>({
    getEndpoint: (id) => `/specialization/delete/${id}`,
    method: "delete",
  });
}
