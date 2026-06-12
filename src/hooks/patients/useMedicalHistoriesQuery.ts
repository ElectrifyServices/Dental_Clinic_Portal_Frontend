import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";

// Query for fetching Medical Histories
export const useMedicalHistoriesQuery = (options?: any) => {
  return useApiQuery<any>({
    queryKey: ["medical-histories"],
    endpoint: "/patientMedical/medical-histories",
    method: "get",
    options,
  });
};

// Mutation for creating Medical History
export const useCreateMedicalHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<any, { name: string; is_custom: boolean }>({
    endpoint: "/patientMedical/medical-histories",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medical-histories"] });
      },
    },
  });
};

// Mutation for deleting Medical History
export const useDeleteMedicalHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<any, string>({
    getEndpoint: (id: string) => `/patientMedical/medical-histories/${id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medical-histories"] });
      },
    },
  });
};
