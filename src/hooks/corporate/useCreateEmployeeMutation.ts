import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateEmployeeVariables {
  name: string;
  emp_id: string;
  phone: string;
  email: string;
  gender: string;
  date_of_birth: string;
  company_name: string;
  designation?: string;
  department?: string;
  corporate_plan_id: string;
  eligible_date: string;
  status: string;
}

export interface CreateEmployeeResponse {
  id: string;
  name: string;
  emp_id: string;
  phone: string;
  email: string;
  gender: string;
  date_of_birth: string;
  company_name: string;
  designation: string;
  department: string;
  corporate_plan_id: string;
  patient_id: string | null;
  eligible_date: string;
  status: string;
  [key: string]: any;
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<CreateEmployeeResponse, CreateEmployeeVariables>({
    endpoint: "/employee",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      },
    },
  });
}
