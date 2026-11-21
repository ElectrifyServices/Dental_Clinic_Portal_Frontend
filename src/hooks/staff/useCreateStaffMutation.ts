import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateStaffVariables {
  formData: FormData;
}

export function useCreateStaffMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateStaffVariables>({
    endpoint: "/staff",
    method: "post",
    transformRequest: (variables) => variables.formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["staff"] });
      },
    },
  });
} 
