import { useApiQuery } from "../useApiQuery";

export interface EMRDetailParams {
  search?: string;
  category?: string;
}

export function useEMRDetailQuery(id: string, params: EMRDetailParams = {}, options?: any) {
  const queryParams: Record<string, any> = {};
  if (params.search) {
    queryParams.search = params.search;
  }
  if (params.category && params.category !== "all") {
    queryParams.filters = {
      record_type: [params.category.toUpperCase()]
    };
  }

  return useApiQuery<any>({
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
