import { useApiQuery } from "../useApiQuery";

export const usePatientAppointmentHistoryQuery = (patientId: string) => {
  return useApiQuery<any>({
    queryKey: ["patientAppointmentHistory", patientId],
    endpoint: `/patient/appointment-history/${patientId}`,
    method: "post",
    enabled: !!patientId,
    // Assuming it accepts an empty body or simple pagination
    options: {
      refetchOnWindowFocus: false,
    },
  });
};
