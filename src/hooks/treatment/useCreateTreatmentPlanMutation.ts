import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateTreatmentPrescriptionVariables {
  medicine_id: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: number;
  duration_type: "DAYS" | "WEEKS" | "MONTHS";
  qty: number;
  instructions?: string;
}

export interface CreateTreatmentSessionVariables {
  visit_date?: string;           // "YYYY-MM-DD"
  start_time?: string;           // "09:00 AM"
  duration_min?: number;         // default 45
  session_fee?: number;
  clinical_objectives?: string;
}

export interface CreateTreatmentPlanVariables {
  patient_id: string;
  doctor_id: string;
  consultation_id?: string;
  tooth_number?: number;
  procedure: string;
  treatment_date: string;       // "YYYY-MM-DD"
  est_cost?: number;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  clinical_notes?: string;
  prescriptions?: CreateTreatmentPrescriptionVariables[];
  sessions?: CreateTreatmentSessionVariables[];  // Added sessions
  rawFiles?: File[];
  existingImages?: string[];
  attachments?: string[];
}

export interface TreatmentPlanResponse {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_id?: string;
  tooth_number?: number;
  procedure: string;
  treatment_date: string;
  est_cost: string;
  status: string;
  next_appointment?: string;
  clinical_notes?: string;
  created_at: string;
  updated_at: string;
  patient: { id: string; name: string; phone: string };
  doctor: { id: string; staff: { name: string } };
  sessions: any[];
  prescriptions: any[];
}

export function useCreateTreatmentPlanMutation() {
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

  return useApiMutation<TreatmentPlanResponse, CreateTreatmentPlanVariables>({
    getEndpoint: () => "/treatment",
    method: "post",
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
        if (key !== "rawFiles" && key !== "existingImages") {
          const val = (variables as any)[key];
          if (val !== undefined && val !== null) {
            buildFormData(formData, val, key);
          }
        }
      });

      return formData;
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
      },
    },
  });
}