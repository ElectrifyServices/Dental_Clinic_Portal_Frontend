import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { CreateTreatmentPrescriptionVariables, TreatmentPlanResponse } from "./useCreateTreatmentPlanMutation";
import { AuthStorage } from "../../auth/authStorage";

const getAuthHeaders = () => {
  const user = AuthStorage.getUser();
  return user?.id ? { "x-staff-id": user.id } : {};
};

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
  /** Array of tooth numbers */
  tooth_number?: number[];
  procedure?: string;
  treatment_date?: string;
  est_cost?: number;
  /** Must be sent together with discount_value */
  discount_type?: "PERCENTAGE" | "FLAT" | null;
  /** PERCENTAGE capped at 100; FLAT capped at est_cost */
  discount_value?: number | null;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  clinical_notes?: string;
  doctor_id?: string;
  /** Full replace-by-id: entries with id are updated, without id are added, missing ids are deleted */
  prescriptions?: UpdateTreatmentPrescriptionVariables[];
  sessions?: UpdateTreatmentSessionVariables[];
  rawFiles?: File[];
  existingImages?: string[];
  /** Attachment IDs to delete from S3 + DB */
  removedAttachmentIds?: string[];
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
    headers: getAuthHeaders,
    transformRequest: (variables) => {
      if (!variables.rawFiles || variables.rawFiles.length === 0) {
        const { rawFiles, existingImages, ...rest } = variables;
        return rest;
      }

      const formData = new FormData();

      // New attachment files (up to 5)
      variables.rawFiles.slice(0, 5).forEach((file) => {
        formData.append("attachments", file);
      });

      // Append all other fields — arrays go as JSON strings (API multipart convention)
      Object.keys(variables).forEach((key) => {
        if (key === "id" || key === "rawFiles" || key === "existingImages") return;
        const val = (variables as any)[key];
        if (val === undefined || val === null) return;

        if (Array.isArray(val)) {
          // tooth_number[], prescriptions[], sessions[], removedAttachmentIds[] — JSON-stringify
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, String(val));
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