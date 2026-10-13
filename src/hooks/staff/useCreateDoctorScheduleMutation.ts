import type { ApiAny } from "../../types/api";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

// ─── API Types ────────────────────────────────────────────────────────────────

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface DaySchedulePayload {
  day_of_week: DayOfWeek;
  is_working_day: boolean;
  /** Required when is_working_day is true */
  start_time?: string; // "HH:mm"
  end_time?: string;   // "HH:mm"
  break_start?: string; // "HH:mm"
  break_end?: string;   // "HH:mm"
}

export interface CreateDoctorSchedulePayload {
  slot_duration_mins: number;
  buffer_time_mins: number;
  day_schedules: DaySchedulePayload[];
}

export interface CreateDoctorScheduleVariables {
  doctorId: string;
  payload: CreateDoctorSchedulePayload;
}

// ─── Field Mapping Helper ────────────────────────────────────────────────────

const DAY_KEY_TO_ENUM: Record<string, DayOfWeek> = {
  monday: "MONDAY",
  tuesday: "TUESDAY",
  wednesday: "WEDNESDAY",
  thursday: "THURSDAY",
  friday: "FRIDAY",
  saturday: "SATURDAY",
  sunday: "SUNDAY",
};

const ORDERED_DAYS: Array<keyof typeof DAY_KEY_TO_ENUM> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Maps the internal workingHours object (keyed by lowercase day names)
 * and slot settings into the POST /doctorSchedule/create/:doctorId payload.
 */
export function mapScheduleToPayload(
  workingHours: Record<string, ApiAny>,
  settings: { duration: number; bufferTime: number }
): CreateDoctorSchedulePayload {
  const isValidTime = (t?: string | null) =>
    Boolean(t && typeof t === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(t.trim().slice(0, 5)));

  const cleanTime = (t?: string | null): string | undefined => {
    if (!t || typeof t !== "string") return undefined;
    const trimmed = t.trim().slice(0, 5);
    return isValidTime(trimmed) ? trimmed : undefined;
  };

  const day_schedules: DaySchedulePayload[] = ORDERED_DAYS.map((dayKey) => {
    const day = workingHours[dayKey] ?? {};
    const isWorking = Boolean(day.isWorking);

    const entry: DaySchedulePayload = {
      day_of_week: DAY_KEY_TO_ENUM[dayKey],
      is_working_day: isWorking,
    };

    if (isWorking) {
      const sTime = cleanTime(day.startTime);
      const eTime = cleanTime(day.endTime);
      if (sTime) entry.start_time = sTime;
      if (eTime) entry.end_time = eTime;

      const bStart = cleanTime(day.breakStart);
      const bEnd = cleanTime(day.breakEnd);
      // Only include break times if both are valid
      if (bStart && bEnd) {
        entry.break_start = bStart;
        entry.break_end = bEnd;
      }
    }

    return entry;
  });

  return {
    slot_duration_mins: settings.duration,
    buffer_time_mins: settings.bufferTime,
    day_schedules,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCreateDoctorScheduleMutation() {
  const queryClient = useQueryClient();

  return useApiMutation<ApiAny, CreateDoctorScheduleVariables>({
    getEndpoint: (variables) =>
      `/doctorSchedule/${variables.doctorId}`,
    method: "post",
    transformRequest: (variables) => variables.payload,
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["staff"] });
        queryClient.invalidateQueries({
          queryKey: ["doctorSchedule", variables.doctorId],
        });
      },
    },
  });
}
