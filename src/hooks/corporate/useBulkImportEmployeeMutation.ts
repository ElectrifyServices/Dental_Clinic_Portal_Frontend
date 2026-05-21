import { useApiMutation } from "../useApiMutation";

export interface BulkImportEmployee {
  name: string;
  emp_id: string;
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
  return useApiMutation<BulkImportEmployeeResponse, BulkImportEmployeeVariables>({
    endpoint: "/employee/bulk-import",
    method: "post",
  });
}
