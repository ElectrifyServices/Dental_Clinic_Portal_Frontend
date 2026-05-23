import { useApiMutation } from "../useApiMutation";
import { CreateEmployeeResponse } from "./useCreateEmployeeMutation";

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
}

export function useUpdateEmployeeMutation() {
  return useApiMutation<CreateEmployeeResponse, UpdateEmployeeVariables>({
    getEndpoint: (variables) => `/employee/${variables.id}`,
    method: "put",
    transformRequest: ({ id: _id, ...rest }) => rest,
  });
}
