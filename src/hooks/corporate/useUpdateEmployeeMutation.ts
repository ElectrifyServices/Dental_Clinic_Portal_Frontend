import { useApiMutation } from "../useApiMutation";
import { CreateEmployeeResponse } from "./useCreateEmployeeMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateEmployeeVariables {
  id: string;
  name?: string;
  emp_id?: string;
  phone?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  company_name?: string;
  designation?: string;
  department?: string;
  corporate_plan_id?: string;
  eligible_date?: string;
  status?: string;
  coverage_type?: 'SELF' | 'FAMILY';
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<CreateEmployeeResponse, UpdateEmployeeVariables>({
    getEndpoint: (variables) => `/employee/${variables.id}`,
    method: "put",
    transformRequest: ({ id: _id, ...rest }) => rest,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      },
    },
  });
}
