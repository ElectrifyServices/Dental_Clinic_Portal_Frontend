import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateLabWorkVariables {
  id: string;
  patient_id: string;
  treatment_plan_id: string;
  lab_name_id: string;
  work_tooth_no: string[];
  no_of_units: number;
  price: number;
  warranty: "NO_WARRANTY" | "WARRANTY_WITH_CARD" | "WARRANTY_WITHOUT_CARD" | "WARRANTY";
  notes?: string;
  documents?: File[];
  removedFileIds?: string[];
  warranty_years?: number;
  warranty_valid_till?: string;
}

export function useUpdateLabWorkMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<any, UpdateLabWorkVariables>({
    getEndpoint: (variables) => `/labWork/${variables.id}`,
    method: "put",
    transformRequest: (variables) => {
      const formData = new FormData();

      if (variables.documents && variables.documents.length > 0) {
        variables.documents.forEach((file) => {
          formData.append("documents", file);
        });
      }

      if (variables.removedFileIds && variables.removedFileIds.length > 0) {
        variables.removedFileIds.forEach((id) => {
          formData.append("removedFileIds[]", id);
        });
      }

      Object.keys(variables).forEach((key) => {
        if (key === "documents" || key === "removedFileIds" || key === "id") return;
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
