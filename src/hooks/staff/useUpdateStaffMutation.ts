import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateStaffVariables {
  id: string;
  formData: FormData;
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateStaffVariables>({
    getEndpoint: (variables) => `/staff/${variables.id}`,
    method: "put",
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
