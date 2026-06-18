import { useApiMutation } from "../useApiMutation";
import { CreateEmployeeResponse } from "./useCreateEmployeeMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateEmployeeVariables {
  id: string;
  plan_id?: string;
  name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  relationship_type?: string;
  parent_member_id?: string;
  expiry_date?: string;
  status?: string;
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<CreateEmployeeResponse, UpdateEmployeeVariables>({
    getEndpoint: (variables) => `/member/${variables.id}`,
    method: "put",
    transformRequest: ({ id: _id, ...rest }) => rest,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["members"] });
      },
    },
  });
}
