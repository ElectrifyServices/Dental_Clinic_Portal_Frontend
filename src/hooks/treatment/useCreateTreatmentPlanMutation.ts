import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthStorage } from "../../auth/authStorage";

const getAuthHeaders = () => {
  const user = AuthStorage.getUser();
  return user?.id ? { "x-staff-id": user.id } : {};
};

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
  /** API accepts an array of tooth numbers */
  tooth_number?: number[];
  procedure: string;
  treatment_date?: string;       // "YYYY-MM-DD" (optional per API)
  est_cost?: number;
  /** Must be sent together with discount_value */
  discount_type?: "PERCENTAGE" | "FLAT";
  /** PERCENTAGE capped at 100; FLAT capped at est_cost */
  discount_value?: number;
  duration_min?: number;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  clinical_notes?: string;
  prescriptions?: CreateTreatmentPrescriptionVariables[];
  sessions?: CreateTreatmentSessionVariables[];
  rawFiles?: File[];
  existingImages?: string[];
}

/** Attachment object returned by the API */
export interface TreatmentAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  file_extension?: string;
  uploaded_by?: string;
  uploaded_at?: string;
}

/** Full Treatment Plan object as returned by the API */
export interface TreatmentPlanResponse {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_id?: string | null;
  /** Array of tooth numbers */
  tooth_number?: number[];
  procedure: string;
  treatment_date?: string | null;
  est_cost: number;
  /** discount_type and discount_value must be sent together */
  discount_type?: "PERCENTAGE" | "FLAT" | null;
  discount_value?: number | null;
  /** Computed: derived from est_cost + discount fields — read-only */
  discount_amount?: number;
  /** Computed: est_cost − discount_amount — read-only */
  final_cost?: number;
  /** Accumulates as sessions are completed with a payment */
  paid_amount?: number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  clinical_notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  patient: { id: string; name: string; phone: string };
  doctor: { id: string; staff: { name: string } };
  sessions: any[];
  prescriptions: any[];
  attachments?: TreatmentAttachment[];
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
    headers: getAuthHeaders,
    transformRequest: (variables) => {
      if (!variables.rawFiles || variables.rawFiles.length === 0) {
        const { rawFiles, existingImages, ...rest } = variables;
        return rest;
      }

      const formData = new FormData();

      // Append files as "attachments" (up to 5 per API)
      variables.rawFiles.slice(0, 5).forEach((file) => {
        formData.append("attachments", file);
      });

      // Append all other fields — arrays go as JSON strings (API multipart convention)
      Object.keys(variables).forEach((key) => {
        if (key === "rawFiles" || key === "existingImages") return;
        const val = (variables as any)[key];
        if (val === undefined || val === null) return;

        if (Array.isArray(val)) {
          // tooth_number[], prescriptions[], sessions[] — JSON-stringify per API convention
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, String(val));
        }
      });

      return formData;
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["patientTreatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
      },
    },
  });
}