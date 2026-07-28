import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateLabWorkVariables {
  id: string;
  patient_id: string;
  patient_name?: string;
  lab_name: string;
  work_type: string;
  units_count: number;
  has_warranty: boolean;
  warranty_years?: number;
  warranty_end_date?: string;
  created_date: string;
  price: number;
}

export function useUpdateLabWorkMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateLabWorkVariables>({
    getEndpoint: (variables) => `/lab-work/${variables.id}`,
    method: "put",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labWorks"] });
      },
    },
  });
}
