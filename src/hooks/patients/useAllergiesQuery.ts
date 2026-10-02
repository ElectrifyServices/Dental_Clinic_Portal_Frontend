import type { ApiAny } from "../../types/api";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, type ApiQueryOptions } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";

// Query for fetching Allergies
export const useAllergiesQuery = (options?: ApiQueryOptions<ApiAny>) => {
  return useApiQuery<ApiAny>({
    queryKey: ["allergies"],
    endpoint: "/patientMedical/allergies",
    method: "get",
    options,
  });
};

// Mutation for creating Allergy
export const useCreateAllergyMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, { allergy_name: string; is_custom: boolean }>({
    endpoint: "/patientMedical/allergies",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["allergies"] });
      },
    },
  });
};

// Mutation for deleting Allergy
export const useDeleteAllergyMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, string>({
    getEndpoint: (id: string) => `/patientMedical/allergies/${id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["allergies"] });
      },
    },
  });
};
