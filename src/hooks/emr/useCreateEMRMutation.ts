import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateEMRVariables {
  patient_id: string;
  record_type: string;
  title: string;
  content: string;
  attachments?: File[];
}

export function useCreateEMRMutation() {
  const queryClient = useQueryClient();
  return useApiMutation<any, FormData>({
    endpoint: "/medicalRecord",
    method: "post",
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicalRecords"] });
      },
    },
  });
}
