import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthStorage } from "../../auth/authStorage";

export interface DeleteConsultationVariables {
  id: string;
}

export function useDeleteConsultationMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, DeleteConsultationVariables>({
    getEndpoint: (variables) => `/consultations/${variables.id}`,
    method: "delete",
    headers: () => {
      const user = AuthStorage.getUser();
      return user?.id ? { "x-staff-id": user.id } : {};
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["consultations"] });
      },
    },
  });
}
