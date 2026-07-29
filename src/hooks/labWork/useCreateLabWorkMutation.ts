import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateLabWorkVariables {
  patient_id: string;
  treatment_plan_id: string;
  lab_name_id: string;
  work_tooth_no: string[];
  no_of_units: number;
  price: number;
  warranty: "NO_WARRANTY" | "WARRANTY_WITH_CARD" | "WARRANTY_WITHOUT_CARD" | "WARRANTY";
  notes?: string;
  documents?: File[];
  warranty_years?: number;
  warranty_valid_till?: string;
}

export function useCreateLabWorkMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, CreateLabWorkVariables>({
    endpoint: "/labWork",
    method: "post",
    transformRequest: (variables) => {
      const formData = new FormData();

      if (variables.documents && variables.documents.length > 0) {
        variables.documents.forEach((file) => {
          formData.append("documents", file);
        });
      }

      Object.keys(variables).forEach((key) => {
        if (key === "documents") return;
        const val = (variables as any)[key];
        if (val === undefined || val === null) return;
        if (key === "work_tooth_no" && Array.isArray(val)) {
          val.forEach((item) => {
            formData.append("work_tooth_no", String(item));
          });
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
