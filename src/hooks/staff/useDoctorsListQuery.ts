import { useApiQuery } from "../useApiQuery";
import { getFileUrl } from "../../services/apiClient";
import { useMemo } from "react";

export function useDoctorsListQuery(search?: string, pageOrOptions?: number | any, limit?: number, options?: any) {
  let page: number | undefined;
  let queryOptions: any = options;

  if (typeof pageOrOptions === "object" && pageOrOptions !== null) {
    queryOptions = pageOrOptions;
  } else {
    page = pageOrOptions;
  }

  const body: any = {
    search: search || undefined,
    filters: {
      roles: ["DOCTOR"]
    }
  };

  if (page !== undefined && limit !== undefined) {
    body.page = page;
    body.limit = limit;
  } else {
    body.all = true;
    body.limit = 1000;
  }

  const query = useApiQuery<any>({
    queryKey: ["doctorsList", search, page, limit],
    endpoint: "/staff/list",
    method: "post",
    data: body,
    options: queryOptions,
  });

  const doctors = useMemo(() => {
    let rawList: any[] = [];
    const apiData = query.data;

    if (Array.isArray(apiData)) {
      rawList = apiData;
    } else if (apiData && Array.isArray((apiData as any).responseObject?.data)) {
      rawList = (apiData as any).responseObject.data;
    } else if (apiData && apiData.responseObject?.data && Array.isArray((apiData as any).responseObject.data.staffs)) {
      rawList = (apiData as any).responseObject.data.staffs;
    } else if (apiData && apiData.responseObject?.data && Array.isArray((apiData as any).responseObject.data.data)) {
      rawList = (apiData as any).responseObject.data.data;
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
      .map((s) => {
        return {
          id: s.id,
          name: s.name || "",
          email: s.email || "",
          phone: s.phone || "",
          country_code: s.country_code || "",
          specialization: s.personal_profile?.specialization?.name || s.specialization || "General Dentist",
          experience: s.personal_profile?.experience_years ? `${s.personal_profile.experience_years} Years` : s.experience || "",
          qualification: s.personal_profile?.qualification || s.qualification || "",
          location: s.personal_profile?.department || s.department || "Main Clinic",
          image: getFileUrl(s.profile_picture_url) || getFileUrl(s.profile_picture) || getFileUrl(s.avatar) || "",
        };
      });
  }, [query.data]);

  const total = useMemo(() => {
    const apiData = query.data;
    return (
      (apiData as any)?.pagination?.totalItems ||
      (apiData as any)?.data?.pagination?.totalItems ||
      (apiData as any)?.responseObject?.data?.pagination?.total ||
      (apiData as any)?.responseObject?.data?.pagination?.totalItems ||
      (apiData as any)?.responseObject?.data?.pagination?.total_items ||
      (apiData as any)?.pagination?.total ||
      (apiData as any)?.total ||
      doctors.length
    );
  }, [query.data, doctors.length]);

  const totalPages = useMemo(() => {
    const apiData = query.data;
    const computedTotalPages = (
      (apiData as any)?.pagination?.totalPages ||
      (apiData as any)?.data?.pagination?.totalPages ||
      (apiData as any)?.responseObject?.data?.pagination?.totalPages ||
      (apiData as any)?.responseObject?.data?.pagination?.total_pages ||
      (apiData as any)?.totalPages ||
      1
    );
    if (computedTotalPages > 1) return computedTotalPages;
    return limit ? Math.max(1, Math.ceil(total / limit)) : 1;
  }, [query.data, total, limit]);

  return {
    ...query,
    doctors,
    total,
    totalPages,
  };
}
