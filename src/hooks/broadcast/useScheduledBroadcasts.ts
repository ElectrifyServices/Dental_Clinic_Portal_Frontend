import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export type ScheduledBroadcastStatus =
  | "PENDING"
  | "SENT"
  | "CANCELLED"
  | "FAILED";

export interface ScheduledBroadcast {
  id: string;
  templateName: string;
  patientCount: number;
  memberCount: number;
  scheduledAt: string;
  status: ScheduledBroadcastStatus;
}

export const SCHEDULED_BROADCASTS_KEY = ["scheduled-broadcasts"];
const SCHEDULED_KEY = SCHEDULED_BROADCASTS_KEY;

function toList(raw: unknown): ScheduledBroadcast[] {
  if (Array.isArray(raw)) return raw as ScheduledBroadcast[];
  const data =
    raw && typeof raw === "object"
      ? (raw as { data?: unknown }).data
      : undefined;
  return Array.isArray(data) ? (data as ScheduledBroadcast[]) : [];
}

export function useScheduledBroadcastsQuery() {
  return useApiQuery<ScheduledBroadcast[]>({
    queryKey: SCHEDULED_KEY,
    endpoint: "/broadcasts/scheduled",
    method: "get",
    options: {
      staleTime: 15_000,
      // The "Scheduled" tab unmounts/remounts on every tab switch (it's a
      // ternary, not CSS display toggle) — without this, React Query skips
      // the refetch when the cache is still under staleTime, so switching
      // back to this tab could show data that's already a minute stale.
      refetchOnMount: "always",
      select: (raw) => toList(raw),
      // Poll while anything is still PENDING, so a broadcast flips to
      // SENT/FAILED in the UI on its own once the scheduled time passes,
      // without the user needing to switch tabs or reload the page.
      refetchInterval: (query) => {
        // query.state.data is the RAW response — `select` above only runs
        // on the value returned to the component, not on this callback's
        // input — so re-run the same unwrap here before checking status.
        const list = toList(query.state.data);
        const hasPending = list.some((b) => b.status === "PENDING");
        return hasPending ? 10_000 : false;
      },
    },
  });
}

export function useCancelScheduledBroadcastMutation() {
  const qc = useQueryClient();
  return useApiMutation<{ id: string; status: string }, { id: string }>({
    method: "delete",
    getEndpoint: (v) => `/broadcasts/scheduled/${v.id}`,
    options: {
      onSuccess: () => qc.invalidateQueries({ queryKey: SCHEDULED_KEY }),
    },
  });
}
