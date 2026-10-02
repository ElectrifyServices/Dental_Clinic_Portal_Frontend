import { useApiMutation } from "../useApiMutation";

export interface SendBroadcastVars {
  /** Approved template name — preferred. When set, messageBody/image are ignored. */
  templateName?: string;
  messageBody?: string;
  patientIds: string[];
  memberIds: string[];
  imageFile?: File | null;
}

export interface SendBroadcastResponse {
  jobId: string;
  queued: number;
  hasImage: boolean;
  skipped: { id: string; name: string; reason: string }[];
}

/**
 * POST /broadcasts/send-now as multipart/form-data so the optional image
 * streams through the API gateway (which caps JSON bodies).
 */
export function useSendBroadcastMutation() {
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
      return fd;
    },
  });
}
