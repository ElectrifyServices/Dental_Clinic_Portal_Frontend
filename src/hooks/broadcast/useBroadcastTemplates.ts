import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

export type BroadcastTemplateStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED";

export interface BroadcastTemplate {
  id: string;
  tenant_id: string;
  occasion: string;
  name: string;
  language: string;
  category: string;
  status: BroadcastTemplateStatus;
  header_type: "NONE" | "IMAGE";
  body_text: string;
  footer_text: string | null;
  body_variable_count: number;
  header_image_mime: string | null;
  meta_template_id: string | null;
  rejected_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const TEMPLATES_KEY = ["broadcast-templates"];

function toList(raw: unknown): BroadcastTemplate[] {
  if (Array.isArray(raw)) return raw as BroadcastTemplate[];
  const data =
    raw && typeof raw === "object"
      ? (raw as { data?: unknown }).data
      : undefined;
  return Array.isArray(data) ? (data as BroadcastTemplate[]) : [];
}

export function useBroadcastTemplatesQuery() {
  return useApiQuery<BroadcastTemplate[]>({
    queryKey: TEMPLATES_KEY,
    endpoint: "/notification/whatsapp/templates",
    method: "get",
    options: {
      staleTime: 15_000,
      select: (raw) => toList(raw),
    },
  });
}

export interface CreateTemplateVars {
  occasion: string;
  bodyText: string;
  footerText?: string;
  includeName: boolean;
  imageFile?: File | null;
}

export function useCreateBroadcastTemplateMutation() {
  const qc = useQueryClient();
  return useApiMutation<BroadcastTemplate, CreateTemplateVars>({
    endpoint: "/notification/whatsapp/templates",
    method: "post",
    transformRequest: (v) => {
      const fd = new FormData();
      fd.append("occasion", v.occasion);
      fd.append("bodyText", v.bodyText);
      if (v.footerText) fd.append("footerText", v.footerText);
      fd.append("includeName", v.includeName ? "true" : "false");
      if (v.imageFile) fd.append("image", v.imageFile);
      return fd;
    },
    options: {
      onSuccess: () => qc.invalidateQueries({ queryKey: TEMPLATES_KEY }),
    },
  });
}

export function useRefreshBroadcastTemplateMutation() {
  const qc = useQueryClient();
  return useApiMutation<BroadcastTemplate, { id: string }>({
    method: "post",
    getEndpoint: (v) => `/notification/whatsapp/templates/${v.id}/refresh`,
    options: {
      onSuccess: () => qc.invalidateQueries({ queryKey: TEMPLATES_KEY }),
    },
  });
}

export function useDeleteBroadcastTemplateMutation() {
  const qc = useQueryClient();
  return useApiMutation<{ deleted: boolean }, { id: string }>({
    method: "delete",
    getEndpoint: (v) => `/notification/whatsapp/templates/${v.id}`,
    options: {
      onSuccess: () => qc.invalidateQueries({ queryKey: TEMPLATES_KEY }),
    },
  });
}
