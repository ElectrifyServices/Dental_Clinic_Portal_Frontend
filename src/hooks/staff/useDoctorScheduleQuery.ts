import { useApiQuery } from "../useApiQuery";

// ─── API Response Types ───────────────────────────────────────────────────────

export interface DayScheduleResponse {
  day_of_week: string;
  is_working_day: boolean;
  start_time?: string;
  end_time?: string;
  break_start?: string;
  break_end?: string;
}

export interface DoctorScheduleResponse {
  id?: string;
  doctor_id?: string;
  slot_duration_mins?: number;
  buffer_time_mins?: number;
  day_schedules?: DayScheduleResponse[];
  [key: string]: any;
}

// ─── Response → Internal State Mapper ────────────────────────────────────────

const ENUM_TO_KEY: Record<string, string> = {
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
  SUNDAY: "sunday",
};

export interface InternalDaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface InternalScheduleState {
  workingHours: Record<string, InternalDaySchedule>;
  slotDuration: number;
  bufferTime: number;
}

/**
 * Converts the API response shape into the internal form state used by
 * DoctorScheduleManager.
 */
export function mapApiResponseToScheduleState(
  data: DoctorScheduleResponse | null | undefined
): InternalScheduleState | null {
  if (!data) return null;

  // Unwrap common response envelopes
  let raw: any = data;
  if (raw?.responseObject) raw = raw.responseObject;
  if (raw?.data?.responseObject) raw = raw.data.responseObject;
  if (raw?.data?.data) raw = raw.data.data;
  if (raw?.data) raw = raw.data;

  let daySchedules: any[] = [];
  if (Array.isArray(raw)) {
    daySchedules = raw;
  } else if (raw?.day_schedules) {
    daySchedules = raw.day_schedules;
  } else if (raw?.daySchedules) {
    daySchedules = raw.daySchedules;
  } else if (raw?.schedules) {
    daySchedules = raw.schedules;
  }

  const workingHours: Record<string, InternalDaySchedule> = {
    monday: { isWorking: false, startTime: "", endTime: "" },
    tuesday: { isWorking: false, startTime: "", endTime: "" },
    wednesday: { isWorking: false, startTime: "", endTime: "" },
    thursday: { isWorking: false, startTime: "", endTime: "" },
    friday: { isWorking: false, startTime: "", endTime: "" },
    saturday: { isWorking: false, startTime: "", endTime: "" },
    sunday: { isWorking: false, startTime: "", endTime: "" },
  };

  for (const d of daySchedules) {
    const dayOfWeek = d.day_of_week || d.dayOfWeek || d.day;
    if (!dayOfWeek) continue;
    
    const key = ENUM_TO_KEY[dayOfWeek.toUpperCase()] ?? dayOfWeek.toLowerCase();
    
    const isWorking = d.is_working_day ?? d.isWorkingDay ?? d.isWorking ?? false;
    const startTime = d.start_time ?? d.startTime ?? "09:00";
    const endTime = d.end_time ?? d.endTime ?? "17:00";
    const breakStart = d.break_start ?? d.breakStart;
    const breakEnd = d.break_end ?? d.breakEnd;

    workingHours[key] = {
      isWorking: Boolean(isWorking),
      startTime,
      endTime,
      ...(breakStart ? { breakStart } : {}),
      ...(breakEnd ? { breakEnd } : {}),
    };
  }

  return {
    workingHours,
    slotDuration: raw?.slot_duration_mins ?? raw?.slotDurationMins ?? raw?.slotDuration ?? 30,
    bufferTime: raw?.buffer_time_mins ?? raw?.bufferTimeMins ?? raw?.bufferTime ?? 5,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDoctorScheduleQuery(doctorId: string | null | undefined) {
  return useApiQuery<DoctorScheduleResponse>({
    queryKey: ["doctorSchedule", doctorId],
    endpoint: `/doctorSchedule/${doctorId}`,
    method: "get",
    options: {
      enabled: Boolean(doctorId),
      refetchOnMount: "always",
    },
  });
}
