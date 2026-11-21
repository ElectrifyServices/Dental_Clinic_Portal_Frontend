import { useApiQuery } from "../useApiQuery";
import { getFileUrl } from "../../services/apiClient";
import { useMemo } from "react";

// Fetches ALL staff members (all roles) up to 1000 — used for edit lookups in ModalRegistry
export function useAllStaffListQuery(options?: any) {
  const query = useApiQuery<any>({
    queryKey: ["allStaffList"],
    endpoint: "/staff/list",
    method: "post",
    data: {
      all: true,
      limit: 1000,
    },
    options,
  });

  const staffList = useMemo(() => {
    let rawList: any[] = [];
    const apiData = query.data;

    if (Array.isArray(apiData)) {
      rawList = apiData;
    } else if (apiData && Array.isArray((apiData as any).responseObject?.data)) {
      rawList = (apiData as any).responseObject.data;
    } else if (apiData && Array.isArray((apiData as any).data?.staffs)) {
      rawList = (apiData as any).data.staffs;
    } else if (apiData && Array.isArray((apiData as any).data?.data)) {
      rawList = (apiData as any).data.data;
    } else if (apiData && Array.isArray((apiData as any).data)) {
      rawList = (apiData as any).data;
    } else if (apiData && Array.isArray((apiData as any).staffs)) {
      rawList = (apiData as any).staffs;
    }

    return rawList
      .filter((s) => s && typeof s === "object")
      .map((s) => ({
        id: s.id,
        name: s.name || "",
        email: s.email || "",
        phone: s.phone || "",
        role: (() => {
          let rawRole = s.role?.name || s.role_id || s.role || "staff";
          if (typeof rawRole !== "string") rawRole = String(rawRole);
          const lower = rawRole.toLowerCase();
          if (lower.includes("super")) return "super_admin";
          if (lower.includes("admin")) return "admin";
          if (lower.includes("doctor")) return "doctor";
          if (lower.includes("reception")) return "receptionist";
          if (lower.includes("nurse")) return "nurse";
          if (lower.includes("assist")) return "assistant";
          return "staff";
        })(),
        specialization: s.personal_profile?.specialization?.name || s.specialization || "",
        avatar: getFileUrl(s.profile_picture_url) || getFileUrl(s.profile_picture) || getFileUrl(s.avatar) || "",
        isActive: s.status === "ACTIVE",
      }));
  }, [query.data]);

  return {
    ...query,
    staffList,
  };
}
