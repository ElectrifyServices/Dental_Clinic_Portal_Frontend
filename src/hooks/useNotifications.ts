import { useMemo, useState, useEffect } from "react";
import { useAppData } from "./useAppData";
import { useAuth } from "../contexts/AuthContext";
import { getParsedPermissions } from "../utils/permission";

export interface AppNotification {
  id: string;
  type: "appointment" | "inventory" | "queue" | "billing" | "followup" | "summary";
  title: string;
  description: string;
  time: string;
  timestamp: number;
  isRead: boolean;
  link?: string;
}

export function useNotifications() {
  const { appointments, inventory, queuedPatients, patients } = useAppData();
  const { state } = useAuth();
  
  const user = state.user;
  const role = user?.role;
  const perms = user?.permissions || [];
  const rawModulePerms = getParsedPermissions(user);
  
  const hasAll =
    perms.includes("all") ||
    role === "superadmin" ||
    rawModulePerms.some((p) => p.toUpperCase() === "ALL");

  const hasModuleAccess = (requiredPerms: string[], fallbackRoleCheck?: boolean) => {
    if (hasAll) return true;
    if (Array.isArray(rawModulePerms) && rawModulePerms.length > 0) {
      return requiredPerms.some((p) =>
        rawModulePerms.some((up) => up.toUpperCase() === p.toUpperCase())
      );
    }
    return fallbackRoleCheck ?? true;
  };

  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("read_notification_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("dismissed_notification_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("read_notification_ids", JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    localStorage.setItem("dismissed_notification_ids", JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  const dynamicNotifications = useMemo(() => {
    const list: AppNotification[] = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Low Stock Alerts (Inventory module)
    if (hasModuleAccess(["INVENTORY"], role === "admin" || role === "superadmin")) {
      if (Array.isArray(inventory)) {
        inventory.forEach((item) => {
          const current = item.currentStock ?? item.current_stock ?? 0;
          const min = item.minStock ?? item.min_stock ?? 0;
          if (current < min) {
            list.push({
              id: `inv-low-${item.id}`,
              type: "inventory",
              title: "Low Stock Alert",
              description: `${item.name} is running low (${current} ${item.unit || "units"} left, min ${min}).`,
              time: "System Alert",
              timestamp: Date.now() - 3600000, // 1 hour ago
              isRead: readIds.includes(`inv-low-${item.id}`),
              link: "/inventory",
            });
          }
        });
      }
    }

    // 2. Patient Check-ins / Queue updates (Consultations module)
    if (hasModuleAccess(["CONSULTATION"], role === "doctor")) {
      if (Array.isArray(queuedPatients)) {
        queuedPatients.forEach((qp) => {
          const id = `queue-in-${qp.id}`;
          list.push({
            id,
            type: "queue",
            title: "Patient Checked-in",
            description: `${qp.patientName || "Patient"} checked-in at ${qp.appointmentTime || qp.checkInTime || "now"} for ${qp.treatmentType || "General Checkup"}.`,
            time: qp.checkInTime || "Today",
            timestamp: Date.now() - 600000, // 10 mins ago
            isRead: readIds.includes(id),
            link: "/queue",
          });
        });
      }
    }

    // 3. Billing Dues / Outstanding balances (Billing module)
    if (hasModuleAccess(["BILLING"], role === "admin" || role === "receptionist")) {
      if (Array.isArray(patients)) {
        patients.forEach((p) => {
          const balance = parseFloat(String(p.outstandingBalance || 0).replace(/,/g, ""));
          if (balance > 1000) {
            const id = `billing-due-${p.id}`;
            list.push({
              id,
              type: "billing",
              title: "Outstanding Balance",
              description: `${p.name} has an outstanding balance of ₹${balance.toLocaleString()}.`,
              time: "Invoice Pending",
              timestamp: Date.now() - 7200000, // 2 hours ago
              isRead: readIds.includes(id),
              link: "/billing",
            });
          }
        });
      }
    }

    // 4. Appointments Today & Summary (Appointments module)
    if (hasModuleAccess(["APPOINTMENT", "APPPOINTMENT", "APPOINTMENTS"], true)) {
      if (Array.isArray(appointments)) {
        const todayAppts = appointments.filter((a) => {
          if (!a.date) return false;
          try {
            const aDate = new Date(a.date).toISOString().split("T")[0];
            return aDate === todayStr;
          } catch {
            return false;
          }
        });

        if (todayAppts.length > 0) {
          // Daily Summary
          list.push({
            id: `summary-today-${todayStr}`,
            type: "summary",
            title: "Daily Agenda",
            description: `You have ${todayAppts.length} appointments scheduled for today.`,
            time: "Morning Summary",
            timestamp: new Date().setHours(8, 0, 0, 0),
            isRead: readIds.includes(`summary-today-${todayStr}`),
            link: "/appointments",
          });

          // Individual Appointment Reminders
          todayAppts.forEach((appt) => {
            const id = `appt-today-${appt.id}`;
            list.push({
              id,
              type: "appointment",
              title: "Appointment Reminder",
              description: `${appt.patientName || "Patient"} is scheduled for ${appt.treatment || appt.treatmentType || "Consultation"} with Dr. ${appt.doctorName || "Sharma"} today at ${appt.time || "scheduled time"}.`,
              time: appt.time || "Today",
              timestamp: Date.now() - 1200000, // 20 mins ago
              isRead: readIds.includes(id),
              link: "/appointments",
            });
          });
        }
      }
    }

    // Filter out dismissed notifications and sort by timestamp desc
    return list
      .filter((n) => !dismissedIds.includes(n.id))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [appointments, inventory, queuedPatients, patients, readIds, dismissedIds, role, rawModulePerms, hasAll]);

  const unreadCount = useMemo(() => {
    return dynamicNotifications.filter((n) => !n.isRead).length;
  }, [dynamicNotifications]);

  const markAsRead = (id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllAsRead = () => {
    const allIds = dynamicNotifications.map((n) => n.id);
    setReadIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  const clearAll = () => {
    const allIds = dynamicNotifications.map((n) => n.id);
    setDismissedIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  return {
    notifications: dynamicNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
