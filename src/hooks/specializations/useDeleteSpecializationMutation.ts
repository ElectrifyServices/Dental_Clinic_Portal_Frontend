import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";

export function useDeleteSpecializationMutation() {
  return useApiMutation<ApiAny, string>({
    getEndpoint: (id) => `/specialization/delete/${id}`,
    method: "delete",
  });
}
