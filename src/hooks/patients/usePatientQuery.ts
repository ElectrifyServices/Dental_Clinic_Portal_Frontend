import { useApiQuery } from "../useApiQuery";

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean; // API expects boolean directly, not inside filters
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

export function usePatientQuery(params: PatientListParams = {}) {
  // Build body — only include fields that are explicitly provided
  const body: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };

  if (params.search) {
    body.search = params.search;
  }

  // Only send is_active if explicitly provided (true or false)
  if (params.is_active !== undefined) {
    body.is_active = params.is_active;
  }

  return useApiQuery<Patient[]>({
    queryKey: ["patients", body],
    endpoint: "/patient/list",
    method: "post",
    data: body,
  });
}
