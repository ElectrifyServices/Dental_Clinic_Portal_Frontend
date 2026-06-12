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
  workingHours: Record<string, any>,
  settings: { duration: number; bufferTime: number }
): CreateDoctorSchedulePayload {
  const day_schedules: DaySchedulePayload[] = ORDERED_DAYS.map((dayKey) => {
    const day = workingHours[dayKey] ?? {};
    const isWorking = Boolean(day.isWorking);

    const entry: DaySchedulePayload = {
      day_of_week: DAY_KEY_TO_ENUM[dayKey],
      is_working_day: isWorking,
    };

    if (isWorking) {
      if (day.startTime) entry.start_time = day.startTime;
      if (day.endTime) entry.end_time = day.endTime;
      // Only include break times if both are provided
      if (day.breakStart && day.breakEnd) {
        entry.break_start = day.breakStart;
        entry.break_end = day.breakEnd;
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

  return useApiMutation<any, CreateDoctorScheduleVariables>({
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
