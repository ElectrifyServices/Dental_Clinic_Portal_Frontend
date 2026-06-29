import { useApiQuery } from "../useApiQuery";
import { getFileUrl } from "../../services/apiClient";
import { useMemo } from "react";

export function useDoctorsListQuery(search?: string) {
  const query = useApiQuery<any>({
    queryKey: ["doctorsList", search],
    endpoint: "/staff/list",
    method: "post",
    data: {
      all: true,
      search: search || undefined,
      filters: {
        roles: ["DOCTOR"]
      }
    },
  });

  const doctors = useMemo(() => {
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
      .map((s) => {
        return {
          id: s.id,
          name: s.name || "",
          email: s.email || "",
          phone: s.phone || "",
          specialization: s.personal_profile?.specialization?.name || s.specialization || "General Dentist",
          experience: s.personal_profile?.experience_years ? `${s.personal_profile.experience_years} Years` : s.experience || "",
          qualification: s.personal_profile?.qualification || s.qualification || "",
          location: s.personal_profile?.department || s.department || "Main Clinic",
          image: getFileUrl(s.profile_picture_url) || getFileUrl(s.profile_picture) || getFileUrl(s.avatar) || "",
        };
      });
  }, [query.data]);

  return {
    ...query,
    doctors,
  };
}
