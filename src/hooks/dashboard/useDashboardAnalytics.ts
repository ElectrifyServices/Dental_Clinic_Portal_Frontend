import { useApiQuery } from "../useApiQuery";

// Helper to get formatted date DD-MM-YYYY
const formatDate = (date: Date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

export function getDashboardDateRange(
  period: string,
  customStart?: string,
  customEnd?: string,
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "week":
      // Assuming Monday start
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case "custom":
      startDate = customStart
        ? new Date(customStart)
        : new Date(now.setHours(0, 0, 0, 0));
      endDate = customEnd
        ? new Date(customEnd)
        : new Date(now.setHours(23, 59, 59, 999));
      break;
    default:
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

const DASHBOARD_OPTIONS = {
  refetchOnMount: true,
  staleTime: 0,
  select: (res: any) => res?.data ?? res,
} as const;

export const useAppointmentsCount = (
  period: string,
  customStart?: string,
  customEnd?: string,
) => {
  const { startDate, endDate } = getDashboardDateRange(
    period,
    customStart,
    customEnd,
  );
  return useApiQuery<any>({
    queryKey: ["dashboard", "appointments-count", startDate, endDate],
    endpoint: `/dashboard/appointments-count`,
    params: { startDate, endDate },
    options: DASHBOARD_OPTIONS,
  });
};

export const useRevenue = (
  period: string,
  customStart?: string,
  customEnd?: string,
) => {
  const { startDate, endDate } = getDashboardDateRange(
    period,
    customStart,
    customEnd,
  );
  return useApiQuery<any>({
    queryKey: ["dashboard", "revenue", startDate, endDate],
    endpoint: `/dashboard/revenue`,
    params: { startDate, endDate },
    options: DASHBOARD_OPTIONS,
  });
};

export const usePatientsCount = (
  period: string,
  customStart?: string,
  customEnd?: string,
) => {
  const { startDate, endDate } = getDashboardDateRange(
    period,
    customStart,
    customEnd,
  );
  return useApiQuery<any>({
    queryKey: ["dashboard", "patients-count", startDate, endDate],
    endpoint: `/dashboard/patients-count`,
    params: { startDate, endDate },
    options: DASHBOARD_OPTIONS,
  });
};

export const usePendingInvoices = (
  period: string,
  customStart?: string,
  customEnd?: string,
) => {
  const { startDate, endDate } = getDashboardDateRange(
    period,
    customStart,
    customEnd,
  );

  return useApiQuery<any>({
    queryKey: ["dashboard", "pending-invoices", startDate, endDate],
    endpoint: `/dashboard/pending-invoices`,
    params: { startDate, endDate },
    options: DASHBOARD_OPTIONS,
  });
};

export const useLowStockItems = (
  period: string,
  customStart?: string,
  customEnd?: string,
) => {
  const { startDate, endDate } = getDashboardDateRange(
    period,
    customStart,
    customEnd,
  );
  return useApiQuery<any>({
    queryKey: ["dashboard", "low-stock-items", startDate, endDate],
    endpoint: `/dashboard/low-stock-items`,
    params: { startDate, endDate },
    options: DASHBOARD_OPTIONS,
  });
};

export const useCorporateMembers = (
  period: string,
  customStart?: string,
  customEnd?: string,
) => {
  const { startDate, endDate } = getDashboardDateRange(
    period,
    customStart,
    customEnd,
  );
  return useApiQuery<any>({
    queryKey: ["dashboard", "corporate-members", startDate, endDate],
    endpoint: `/dashboard/corporate-members`,
    params: { startDate, endDate },
    options: DASHBOARD_OPTIONS,
  });
};

export const useRevenueTrend = () => {
  return useApiQuery<any[]>({
    queryKey: ["dashboard", "revenue-trend"],
    endpoint: `/dashboard/revenue-trend`,
    options: DASHBOARD_OPTIONS,
  });
};

export const useAvgDailyRevenue = (days = 30) => {
  return useApiQuery<any>({
    queryKey: ["dashboard", "avg-daily-revenue", days],
    endpoint: `/dashboard/avg-daily-revenue`,
    params: { days },
    options: DASHBOARD_OPTIONS,
  });
};

export const useApptCompletionRate = () => {
  return useApiQuery<any>({
    queryKey: ["dashboard", "appt-completion-rate"],
    endpoint: `/dashboard/appt-completion-rate`,
    options: DASHBOARD_OPTIONS,
  });
};

export const usePatientRetention = () => {
  return useApiQuery<any>({
    queryKey: ["dashboard", "patient-retention"],
    endpoint: `/dashboard/patient-retention`,
    options: DASHBOARD_OPTIONS,
  });
};

export const useInvoicesOverdue = () => {
  return useApiQuery<any[]>({
    queryKey: ["dashboard", "invoices-overdue-seven-days"],
    endpoint: `/dashboard/invoices-overdue-seven-days`,
    options: DASHBOARD_OPTIONS,
  });
};

export const useCriticallyLowStock = () => {
  return useApiQuery<any[]>({
    queryKey: ["dashboard", "critically-low-stock-items"],
    endpoint: `/dashboard/critically-low-stock-items`,
    options: DASHBOARD_OPTIONS,
  });
};

export const useFollowUpsDue = () => {
  return useApiQuery<any[]>({
    queryKey: ["dashboard", "follow-ups-due-this-week"],
    endpoint: `/dashboard/follow-ups-due-this-week`,
    options: DASHBOARD_OPTIONS,
  });
};

export const useMembershipsExpiring = (days = 15) => {
  return useApiQuery<any[]>({
    queryKey: ["dashboard", "memberships-expiring-soon", days],
    endpoint: `/dashboard/memberships-expiring-soon`,
    params: { days },
    options: DASHBOARD_OPTIONS,
  });
};

export const useAppointmentStatusBreakdown = (
  period: string,
  customStart?: string,
  customEnd?: string,
) => {
  const { startDate, endDate } = getDashboardDateRange(
    period,
    customStart,
    customEnd,
  );
  return useApiQuery<any>({
    queryKey: ["dashboard", "appointment-status-breakdown", startDate, endDate],
    endpoint: `/dashboard/appointment-status-breakdown`,
    params: { startDate, endDate },
    options: DASHBOARD_OPTIONS,
  });
};

export const useDoctorPerformance = (
  page: number = 1,
  limit: number = 5,
  search?: string,
) => {
  return useApiQuery<any>({
    queryKey: ["dashboard", "doctor-performance", page, limit, search],
    endpoint: `/dashboard/doctor-performance`,
    method: "post",
    data: { page, limit, search },
    options: DASHBOARD_OPTIONS,
  });
};

export const useRecentPatients = (
  page: number = 1,
  limit: number = 5,
  search?: string,
) => {
  return useApiQuery<any>({
    queryKey: ["dashboard", "recent-patients", page, limit, search],
    endpoint: `/dashboard/recent-patients`,
    method: "post",
    data: { page, limit, search },
    options: DASHBOARD_OPTIONS,
  });
};
