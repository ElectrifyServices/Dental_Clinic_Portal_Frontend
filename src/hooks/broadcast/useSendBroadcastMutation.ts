import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "../useApiMutation";
import { SCHEDULED_BROADCASTS_KEY } from "./useScheduledBroadcasts";

export interface SendBroadcastVars {
  /** Approved template name — preferred. When set, messageBody/image are ignored. */
  templateName?: string;
  messageBody?: string;
  patientIds: string[];
  memberIds: string[];
  imageFile?: File | null;
  /** ISO datetime. When set and in the future, the broadcast is scheduled
   * instead of being sent immediately. */
  scheduledAt?: string;
}

export interface SendBroadcastResponse {
  jobId?: string;
  scheduledBroadcastId?: string;
  scheduledAt?: string;
  queued: number;
  hasImage: boolean;
  skipped: { id: string; name: string; reason: string }[];
}

/**
 * POST /broadcasts/send-now as multipart/form-data so the optional image
 * streams through the API gateway (which caps JSON bodies).
 */
export function useSendBroadcastMutation() {
  const qc = useQueryClient();
  return useApiMutation<SendBroadcastResponse, SendBroadcastVars>({
    endpoint: "/broadcasts/send-now",
    method: "post",
    transformRequest: (v) => {
      const fd = new FormData();
      if (v.templateName) fd.append("templateName", v.templateName);
      if (v.messageBody) fd.append("messageBody", v.messageBody);
      fd.append("patientIds", JSON.stringify(v.patientIds ?? []));
      fd.append("memberIds", JSON.stringify(v.memberIds ?? []));
      if (v.imageFile && !v.templateName) fd.append("image", v.imageFile);
      if (v.scheduledAt) fd.append("scheduledAt", v.scheduledAt);
      return fd;
    },
    options: {
      onSuccess: (data) => {
        // A scheduled send creates a new row the "Scheduled" tab's cached
        // list doesn't know about yet — without this it only appears after
        // a manual refresh (the query's staleTime doesn't get crossed by a
        // same-session tab switch).
        if (data?.scheduledBroadcastId) {
          qc.invalidateQueries({ queryKey: SCHEDULED_BROADCASTS_KEY });
        }
      },
    },
  });
}
