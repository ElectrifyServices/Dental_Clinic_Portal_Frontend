import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateLabWorkVariables {
  patient_id: string;
  patient_name?: string;
  lab_name: string;
  work_type: string;
  units_count: number;
  has_warranty: boolean;
  created_date: string;
  due_date: string;
  price: number;
}

export function useCreateLabWorkMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateLabWorkVariables>({
    endpoint: "/lab-work",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labWorks"] });
      },
    },
  });
}
