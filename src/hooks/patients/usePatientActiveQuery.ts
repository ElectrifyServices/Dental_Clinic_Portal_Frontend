import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface PatientActiveResponse {
  count: number;
  [key: string]: ApiAny;
}

export function usePatientActiveQuery() {
  return useApiQuery<PatientActiveResponse>({
    queryKey: ["patients", "active"],
    endpoint: "/patient/stats/active",
    method: "get",
  });
}
