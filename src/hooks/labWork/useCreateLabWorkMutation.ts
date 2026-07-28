import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateLabWorkVariables {
  patient_id: string;
  patient_name?: string;
  treatment_id: string;
  treatment_name?: string;
  lab_name: string;
  work_type: string;
  units_count: number;
  has_warranty: boolean;
  warranty_years?: number;
  warranty_end_date?: string;
  created_date: string;
  price: number;
  notes?: string;
  rawFiles?: File[];
}

export function useCreateLabWorkMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateLabWorkVariables>({
    endpoint: "/lab-work",
    method: "post",
    transformRequest: (variables) => {
      if (!variables.rawFiles || variables.rawFiles.length === 0) {
        const { rawFiles, ...rest } = variables;
        return rest;
      }

      const formData = new FormData();
      // Append files as "attachments" (matches the Treatment API's multipart convention)
      variables.rawFiles.slice(0, 5).forEach((file) => {
        formData.append("attachments", file);
      });

      Object.keys(variables).forEach((key) => {
        if (key === "rawFiles") return;
        const val = (variables as any)[key];
        if (val === undefined || val === null) return;
        if (Array.isArray(val)) {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, String(val));
        }
      });

      return formData;
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["labWorks"] });
      },
    },
  });
}
