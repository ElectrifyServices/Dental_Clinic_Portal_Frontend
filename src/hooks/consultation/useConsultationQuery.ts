import { useApiQuery } from "../useApiQuery";
import { ConsultationResponse } from "../../types/consultationTypes";
import apiClient from "../../services/apiClient";
import { parseApiResponse } from "../../services/parseApiResponse";

export function useConsultationQuery(id?: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!id;

  return useApiQuery<ConsultationResponse>({
    queryKey: ["consultation", id],
    endpoint: id ? `/consultations/${id}` : "/consultations",
    method: "get",
    options: {
      enabled,
      staleTime: 30 * 1000,
    },
  });
}

export async function fetchConsultationDetail(id: string, type: string) {
  let endpoint = "";
  if (type === "CLINICAL") {
    endpoint = `/consultations/${id}/observations`;
  } else if (type === "TREATMENT") {
    endpoint = `/consultations/${id}/treatment-plan`;
  } else if (type === "PRESCRIPTION") {
    endpoint = `/consultations/${id}/prescriptions`;
  } else {
    endpoint = `/consultations/${id}`;
  }
  const response = await apiClient.get(endpoint);
  const parsed = parseApiResponse(response.data);
  return parsed.data;
}

