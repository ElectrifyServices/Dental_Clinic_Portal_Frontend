import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { parseApiResponse } from "@/services/parseApiResponse";

// Query for fetching Allergies
export const useAllergiesQuery = () => {
  return useQuery({
    queryKey: ["allergies"],
    queryFn: async () => {
      const res = await apiClient.get("/patientMedical/allergies");
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

// Mutation for creating Allergy
export const useCreateAllergyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { allergy_name: string; is_custom: boolean }) => {
      const res = await apiClient.post("/patientMedical/allergies/create", data);
      return parseApiResponse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allergies"] });
    },
  });
};

// Mutation for deleting Allergy
export const useDeleteAllergyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/patientMedical/allergies/${id}`);
      return parseApiResponse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allergies"] });
    },
  });
};
