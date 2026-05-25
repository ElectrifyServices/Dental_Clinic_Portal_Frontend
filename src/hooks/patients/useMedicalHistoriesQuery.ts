import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { parseApiResponse } from "@/services/parseApiResponse";

// Query for fetching Medical Histories
export const useMedicalHistoriesQuery = () => {
  return useQuery({
    queryKey: ["medical-histories"],
    queryFn: async () => {
      const res = await apiClient.get("/patientMedical/medical-histories");
      const parsed = parseApiResponse(res.data);
      if (Array.isArray(parsed.data)) {
        return parsed.data;
      }
      if (parsed.data && Array.isArray((parsed.data as any).all)) {
        return (parsed.data as any).all;
      }
      if (parsed.data && (parsed.data as any).data && Array.isArray((parsed.data as any).data.all)) {
        return (parsed.data as any).data.all;
      }
      return [];
    },
  });
};

// Mutation for creating Medical History
export const useCreateMedicalHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; is_custom: boolean }) => {
      const res = await apiClient.post("/patientMedical/medical-histories/create", data);
      return parseApiResponse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-histories"] });
    },
  });
};

// Mutation for deleting Medical History
export const useDeleteMedicalHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/patientMedical/medical-histories/${id}`);
      return parseApiResponse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-histories"] });
    },
  });
};
