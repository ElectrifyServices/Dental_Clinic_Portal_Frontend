import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface EMRDetailParams {
  search?: string;
  category?: string;
}

export function useEMRDetailQuery(id: string, params: EMRDetailParams = {}, options?: ApiAny) {
  const queryParams: Record<string, ApiAny> = {};
  if (params.search) {
    queryParams.search = params.search;
  }
  if (params.category && params.category !== "all") {
    queryParams.filters = {
      record_type: [params.category.toUpperCase()]
    };
  }

  return useApiQuery<ApiAny>({
    queryKey: ["medicalRecords", "detail", id, queryParams],
    endpoint: `/medicalRecord/${id}`,
    method: "get",
    data: queryParams,
    options: {
      enabled: !!id,
      ...options,
    },
  });
}
