import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface BulkImportEmployee {
  name: string;
  emp_id: string;
  country_code: string;
  phone: string;
  email: string;
  gender: string;
  company_name: string;
  designation: string;
  department: string;
  corporate_plan_id: string;
  date_of_birth: string;
  eligible_date: string;
}

export interface BulkImportEmployeeVariables {
  employees: BulkImportEmployee[];
}

export interface BulkImportEmployeeResponse {
  message: string;
  count: number;
  [key: string]: any;
}

export function useBulkImportEmployeeMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<BulkImportEmployeeResponse, BulkImportEmployeeVariables>({
    endpoint: "/member/bulk-import",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["members"] });
      },
    },
  });
}
