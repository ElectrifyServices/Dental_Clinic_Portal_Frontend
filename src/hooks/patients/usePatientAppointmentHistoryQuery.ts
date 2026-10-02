import type { ApiAny } from "../../types/api";
import { useApiQuery } from "../useApiQuery";

export const usePatientAppointmentHistoryQuery = (patientId: string) => {
  return useApiQuery<ApiAny>({
    queryKey: ["patientAppointmentHistory", patientId],
    endpoint: `/patient/appointment-history/${patientId}`,
    method: "post",
    // Assuming it accepts an empty body or simple pagination
    options: {
      enabled: !!patientId,
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
    },
  });
};
