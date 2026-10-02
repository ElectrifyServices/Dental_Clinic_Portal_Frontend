import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export interface PatientOutstandingResponse {
  count: number;
  [key: string]: ApiAny;
}

export function usePatientOutstandingQuery() {
  return useApiQuery<PatientOutstandingResponse>({
    queryKey: ["patients", "outstanding"],
    endpoint: "/patient/stats/pending-billing",
    method: "get",
  });
}
