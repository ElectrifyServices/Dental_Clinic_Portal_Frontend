import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthStorage } from "../../auth/authStorage";

const getAuthHeaders = () => {
  const user = AuthStorage.getUser();
  return user?.id ? { "x-staff-id": user.id } : {};
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TreatmentSessionResponse {
  id: string;
  plan_id: string;
  appointment_id?: string;
  visit_number: number;
  status: "PLANNED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  visit_date?: string;
  start_time?: string;
  duration_min?: number;
  session_fee: string;
  paid_amount?: number | null;
  clinical_objectives?: string;
  work_done?: string;
  session_findings?: string;
  next_session_plan?: string;
  completed_at?: string;
  created_at: string;
  plan: {
    id: string;
    consultation_id?: string;
    procedure: string;
    tooth_number?: number;
    patient: { id: string; name: string };
    doctor: { id: string; staff: { name: string } };
  };
  appointment?: {
    id: string;
    status: string;
    date: string;
    start_time?: string;
    start_time_ist?: string;
    time?: string;
  };
  prescriptions?: any[];
  attachments?: ConsultationFeedbackAttachment[];
}

export interface SessionsResponse {
  total: number;
  completed: number;
  projected_revenue: number;
  total_fees?: string | number;
  inprogress?: number;
  sessions: TreatmentSessionResponse[];
  consultation_id?: string;
  prescriptions?: PlanPrescription[];
}

export interface PlanPrescription {
  id?: string;
  session_id?: string;
  medicine_id?: string;
  medicine?: { name?: string };
  medicine_name?: string;
  medicineName?: string;
  dosage?: string;
  timing?: string;
  frequency?: string;
  duration?: number | string;
  duration_type?: string;
  qty?: number | string;
  instructions?: string;
}

export interface ConsultationFeedbackAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  file_extension?: string;
  uploaded_at?: string;
}

export interface ConsultationFeedbackItem {
  id: string;
  diagnosis_desc?: string;
  observations_desc?: string;
  treatment_plan_desc?: string;
  additional_notes?: string;
  prescriptions?: PlanPrescription[];
  attachments?: ConsultationFeedbackAttachment[];
}

// ─── Get Sessions (Session Management modal) ───────────────────────────────────

export function useTreatmentSessionsQuery(
  planId?: string,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && !!planId;

  return useApiQuery<SessionsResponse>({
    queryKey: ["treatmentSessions", planId],
    endpoint: `/treatment/${planId}/sessions`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,  // always fresh — doctor may have just updated
    },
  });
}

export function useTreatmentConsultationFeedbackQuery(
  treatmentId?: string,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && !!treatmentId;

  return useApiQuery<ConsultationFeedbackItem[]>({
    queryKey: ["treatmentConsultationFeedback", treatmentId],
    endpoint: `/treatment/consultation/${treatmentId}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}

// ─── Get Session by Appointment (appointment screen) ──────────────────────────

export function useSessionByAppointmentQuery(
  appointmentId?: string,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && !!appointmentId;

  return useApiQuery<TreatmentSessionResponse>({
    queryKey: ["sessionByAppointment", appointmentId],
    endpoint: `/treatment/session/by-appointment/${appointmentId}`,
    method: "get",
    options: {
      enabled,
      staleTime: 0,
    },
  });
}

// ─── Add Session (Confirm & Schedule Session) ──────────────────────────────────

export interface AddSessionVariables {
  planId: string;
  visit_date?: string;          // "2026-06-10"
  start_time?: string;          // "09:00 AM"
  duration_min?: number;
  session_fee?: number;
  clinical_objectives?: string;
}

export function useAddTreatmentSessionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentSessionResponse, AddSessionVariables>({
    getEndpoint: (variables) => `/treatment/${variables.planId}/sessions`,
    method: "post",
    headers: getAuthHeaders,
    transformRequest: ({ planId: _planId, ...rest }) => rest,
    options: {
      onSuccess: (_data, variables) => {
        // Refresh sessions modal data
        queryClient.invalidateQueries({ queryKey: ["treatmentSessions", variables.planId] });
        // Refresh list so next_appointment column updates
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["patientTreatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.planId] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
      },
    },
  });
}

// ─── Update Session (doctor fills notes / reschedule) ─────────────────────────

export interface UpdateSessionVariables {
  planId: string;
  sessionId: string;
  visit_date?: string;
  start_time?: string;
  duration_min?: number;
  session_fee?: number;
  clinical_objectives?: string;
  work_done?: string;
  session_findings?: string;
  next_session_plan?: string;
  status?: "PLANNED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export function useUpdateTreatmentSessionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentSessionResponse, UpdateSessionVariables>({
    getEndpoint: (variables) =>
      `/treatment/${variables.planId}/sessions/${variables.sessionId}`,
    method: "patch",
    headers: getAuthHeaders,
    transformRequest: ({ planId: _p, sessionId: _s, ...rest }) => rest,
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["treatmentSessions", variables.planId] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["patientTreatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.planId] });
      },
    },
  });
}

// ─── Complete Session (marks done, auto-completes plan if last session) ────────

export interface CompleteSessionVariables {
  planId: string;
  sessionId: string;
  paid_amount?: number;
  session_fee?: number;
  discount_percentage?: number;
  work_done?: string;
  session_findings?: string;
  next_session_plan?: string;
  prescriptions?: any[];
  attachments?: File[];
  schedule_next_session?: boolean;
  next_visit_date?: string;
  next_start_time?: string;
  next_duration_min?: number;
  next_clinical_objectives?: string;
  next_session_fee?: number;
}

export function useCompleteTreatmentSessionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentSessionResponse, CompleteSessionVariables>({
    getEndpoint: (variables) =>
      `/treatment/${variables.planId}/sessions/${variables.sessionId}/complete`,
    method: "patch",
    headers: getAuthHeaders,
    transformRequest: ({ planId: _p, sessionId: _s, attachments, ...rest }) => {
      const appendFormValue = (formData: FormData, data: any, parentKey?: string) => {
        if (data === null || data === undefined) return;

        if (data instanceof File) {
          formData.append(parentKey || "", data);
        } else if (Array.isArray(data)) {
          data.forEach((value, index) => {
            appendFormValue(formData, value, `${parentKey}[${index}]`);
          });
        } else if (typeof data === "object") {
          Object.keys(data).forEach((key) => {
            appendFormValue(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
          });
        } else {
          formData.append(parentKey || "", String(data));
        }
      };

      if (!attachments?.length) return rest;

      const formData = new FormData();

      Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        appendFormValue(formData, value, key);
      });

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      return formData;
    },
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["treatmentSessions", variables.planId] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["patientTreatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.planId] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
        // If session had an appointment, refresh appointment queries too
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
      },
    },
  });
}
