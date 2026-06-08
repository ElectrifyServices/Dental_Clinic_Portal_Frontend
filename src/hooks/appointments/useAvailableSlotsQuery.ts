import { useApiQuery } from "../useApiQuery";

export interface AvailableSlot {
  time: string;
  is_available: boolean;
}

export interface AvailableSlotsData {
  doctor_id: string;
  date: string;
  slots: AvailableSlot[];
  slot_duration: number;
}

export interface AvailableSlotsResponse {
  data: AvailableSlotsData;
}

export function useAvailableSlotsQuery(doctorId: string | null | undefined, date: string | null | undefined) {
  return useApiQuery<AvailableSlotsResponse>({
    queryKey: ["availableSlots", doctorId, date],
    endpoint: "/appointment/available-slots",
    method: "get",
    params: {
      doctor_id: doctorId,
      date: date,
    },
    options: {
      enabled: Boolean(doctorId && date),
      refetchOnMount: "always",
      staleTime: 0,
      gcTime: 0,
    },
  });
}
