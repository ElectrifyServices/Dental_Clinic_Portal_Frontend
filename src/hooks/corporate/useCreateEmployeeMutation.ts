import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateEmployeeVariables {
  plan_id: string;
  name: string;
  phone?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  relationship_type?: string;
  parent_member_id?: string;
  expiry_date?: string;
  status?: string;
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
    endpoint: "/member",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["members"] });
        queryClient.invalidateQueries({ queryKey: ["membershipStats"] });
      },
    },
  });
}
