import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { CreateTreatmentPrescriptionVariables, TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";

export interface UpdateTreatmentPrescriptionVariables extends Partial<CreateTreatmentPrescriptionVariables> {
  id?: string;
}

export interface UpdateTreatmentSessionVariables {
  id?: string;
  visit_date?: string;
  start_time?: string;
  duration_min?: number;
  session_fee?: number;
  clinical_objectives?: string;
  work_done?: string;
  session_findings?: string;
  next_session_plan?: string;
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export interface UpdateTreatmentPlanVariables {
  id: string;
  tooth_number?: number;
  procedure?: string;
  treatment_date?: string;
  est_cost?: number;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  clinical_notes?: string;
  doctor_id?: string;
  prescriptions?: UpdateTreatmentPrescriptionVariables[];
  sessions?: UpdateTreatmentSessionVariables[];  // Added sessions support
  rawFiles?: File[];
  existingImages?: string[];
  attachments?: string[];
}

export function useUpdateTreatmentPlanMutation() {
  const queryClient = useQueryClient();

  const buildFormData = (formData: FormData, data: any, parentKey?: string) => {
    if (data === null || data === undefined) return;

    if (data instanceof File) {
      formData.append(parentKey || "", data);
    } else if (Array.isArray(data)) {
      data.forEach((val, i) => {
        buildFormData(formData, val, `${parentKey}[${i}]`);
      });
    } else if (typeof data === "object" && !(data instanceof Date)) {
      Object.keys(data).forEach((key) => {
        buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      formData.append(parentKey || "", String(data));
    }
  };

  return useApiMutation<TreatmentPlanResponse, UpdateTreatmentPlanVariables>({
    getEndpoint: (variables) => `/treatment/${variables.id}`,
    method: "patch",
    transformRequest: (variables) => {
      const formData = new FormData();

      // Append files as "attachments"
      if (variables.rawFiles && variables.rawFiles.length > 0) {
        variables.rawFiles.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      // Append existing images as a stringified list if applicable
      if (variables.existingImages && variables.existingImages.length > 0) {
        variables.existingImages.forEach((url, i) => {
          formData.append(`existing_images[${i}]`, url);
        });
      }

      // Append all other fields
      Object.keys(variables).forEach((key) => {
        if (key !== "id" && key !== "rawFiles" && key !== "existingImages") {
          const val = (variables as any)[key];
          if (val !== undefined && val !== null) {
            buildFormData(formData, val, key);
          }
        }
      });

      return formData;
    },
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["patientTreatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
        // Also invalidate sessions queries
        queryClient.invalidateQueries({ queryKey: ["treatmentSessions", variables.id] });
      },
    },
  });
}