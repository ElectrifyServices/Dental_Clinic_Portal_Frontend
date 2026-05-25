import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";

// Query for fetching Allergies
export const useAllergiesQuery = () => {
  return useApiQuery<any>({
    queryKey: ["allergies"],
    endpoint: "/patientMedical/allergies",
    method: "get",
  });
};

// Mutation for creating Allergy
export const useCreateAllergyMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<any, { allergy_name: string; is_custom: boolean }>({
    endpoint: "/patientMedical/allergies/create",
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

  return useApiMutation<any, string>({
    getEndpoint: (id: string) => `/patientMedical/allergies/${id}`,
    method: "delete",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["allergies"] });
      },
    },
  });
};
