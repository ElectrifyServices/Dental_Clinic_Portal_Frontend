import { useApiQuery } from "../useApiQuery";

export const usePatientFamilyTreeQuery = (patientId: string) => {
  return useApiQuery<any>({
    queryKey: ["patientFamilyTree", patientId],
    endpoint: `/patient/patient-family-tree/${patientId}`,
    method: "get",
    options: {
      enabled: !!patientId,
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
    },
  });
};
