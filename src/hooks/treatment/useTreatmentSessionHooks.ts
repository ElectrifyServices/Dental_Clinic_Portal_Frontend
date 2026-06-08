import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TreatmentSessionResponse {
  id: string;
  plan_id: string;
  appointment_id?: string;
  visit_number: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  visit_date?: string;
  start_time?: string;
  duration_min?: number;
  session_fee: string;
  clinical_objectives?: string;
  work_done?: string;
  session_findings?: string;
  next_session_plan?: string;
  completed_at?: string;
  created_at: string;
  plan: {
    id: string;
    procedure: string;
    tooth_number?: number;
    patient: { id: string; name: string };
    doctor: { id: string; staff: { name: string } };
  };
  appointment?: { id: string; status: string; date: string; start_time: string };
}

export interface SessionsResponse {
  total: number;
  completed: number;
  projected_revenue: number;
  sessions: TreatmentSessionResponse[];
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
    transformRequest: ({ planId: _planId, ...rest }) => rest,
    options: {
      onSuccess: (_data, variables) => {
        // Refresh sessions modal data
        queryClient.invalidateQueries({ queryKey: ["treatmentSessions", variables.planId] });
        // Refresh list so next_appointment column updates
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
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
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export function useUpdateTreatmentSessionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentSessionResponse, UpdateSessionVariables>({
    getEndpoint: (variables) =>
      `/treatment/${variables.planId}/sessions/${variables.sessionId}`,
    method: "patch",
    transformRequest: ({ planId: _p, sessionId: _s, ...rest }) => rest,
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["treatmentSessions", variables.planId] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.planId] });
      },
    },
  });
}

// ─── Complete Session (marks done, auto-completes plan if last session) ────────

export interface CompleteSessionVariables {
  planId: string;
  sessionId: string;
  work_done?: string;
  session_findings?: string;
  next_session_plan?: string;
}

export function useCompleteTreatmentSessionMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<TreatmentSessionResponse, CompleteSessionVariables>({
    getEndpoint: (variables) =>
      `/treatment/${variables.planId}/sessions/${variables.sessionId}/complete`,
    method: "patch",
    transformRequest: ({ planId: _p, sessionId: _s, ...rest }) => rest,
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["treatmentSessions", variables.planId] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlans"] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlan", variables.planId] });
        queryClient.invalidateQueries({ queryKey: ["treatmentPlanStats"] });
        // If session had an appointment, refresh appointment queries too
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
      },
    },
  });
}
