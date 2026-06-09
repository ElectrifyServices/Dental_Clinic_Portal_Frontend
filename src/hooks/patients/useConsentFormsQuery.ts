import { useApiQuery } from "../useApiQuery";

export interface ConsentFormsParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string[];
  };
}

export interface ConsentFormRecord {
  id: string;
  patient_name: string;
  doctor_id: string;
  procedure_type: string;
  patient_id: string;
  consent_declaration: string;
  clinical_risks: string;
  alternative_risks: string;
  witness_name?: string;
  patient_signature?: string;
  witness_signature?: string;
  created_at?: string;
  [key: string]: any;
}

export function useConsentFormsQuery(params: ConsentFormsParams = {}) {
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

  return useApiQuery<ConsentFormRecord[]>({
    queryKey: ["consentForms", body],
    endpoint: "/consent/list",
    method: "post",
    data: body,
  });
}
