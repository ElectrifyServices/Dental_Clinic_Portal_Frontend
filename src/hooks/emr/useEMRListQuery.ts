import { useApiQuery } from "../useApiQuery";

export interface EMRListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    record_type?: string[];
    patient_id?: string | string[];
  };
}

export function useEMRListQuery(params: EMRListParams = {}, options?: any) {
  const body: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };

  if (params.search !== undefined && params.search !== "") {
    body.search = params.search;
  }

  if (params.filters) {
    body.filters = {};
    if (params.filters.record_type && params.filters.record_type.length > 0) {
      body.filters.record_type = params.filters.record_type;
    }
    if (params.filters.patient_id) {
      body.filters.patient_id = Array.isArray(params.filters.patient_id) 
        ? params.filters.patient_id 
        : [params.filters.patient_id];
    }
  }

  return useApiQuery<any>({
    queryKey: ["medicalRecords", body],
    endpoint: "/medicalRecord/list",
    method: "post",
    data: body,
    options,
  });
}
