import { useApiQuery } from "../useApiQuery";

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string[];
    category?: string[];
  };
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  is_active?: boolean;
  [key: string]: any;
}

export function usePatientQuery(params: PatientListParams = {}, options?: any) {
  // Build body — only include fields that are explicitly provided
  const body: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };

  if (params.search !== undefined && params.search !== "") {
    body.search = params.search;
  }

  if (params.filters && Object.keys(params.filters).length > 0) {
    body.filters = params.filters;
  }

  return useApiQuery<Patient[]>({
    queryKey: ["patients", body],
    endpoint: "/patient/list",
    method: "post",
    data: body,
    options,
  });
}
