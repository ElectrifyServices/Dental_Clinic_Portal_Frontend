import { useApiQuery } from "../useApiQuery";

export const usePatientFamilyTreeQuery = (patientId: string) => {
  return useApiQuery<any>({
    queryKey: ["patientFamilyTree", patientId],
    endpoint: `/patient/patient-family-tree/${patientId}`,
    method: "get",
    enabled: !!patientId,
    options: {
      refetchOnWindowFocus: false,
    },
  });
};
