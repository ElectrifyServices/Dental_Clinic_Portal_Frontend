import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Package,
  BarChart3,
  Stethoscope,
  Activity,
  Shield,
  DollarSign,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";

/** Maps screen IDs to their Lucide icon component. */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: Home,
  appointments: Calendar,
  patients: Users,
  "patient-queue": Activity,
  treatments: Stethoscope,
  emr: FileText,
  consent: Shield,
  billing: CreditCard,
  inventory: Package,
  reports: BarChart3,
  staff: UserCheck,
  "profit-sharing": DollarSign,
  "corporate-plans": Building2,
};

/** Maps screen IDs to backend module_permission keys. */
const PERMISSION_MAP: Record<string, string[]> = {
  dashboard: ["DASHBOARD"],
  appointments: ["APPPOINTMENT", "APPOINTMENT", "APPOINTMENTS"],
  patients: ["PATIENTS"],
  "patient-queue": ["CONSULTATION"],
  treatments: ["TREATMENTS"],
  emr: ["MEDICAL_RECORDS"],
  consent: ["CONSENT_FORMS"],
  billing: ["BILLING"],
  inventory: ["INVENTORY"],
  reports: ["ANALYTICS"],
  staff: ["STAFF"],
  "profit-sharing": ["PROFIT_SHARING"],
  "corporate-plans": ["CORPORATE_PLANS"],
};

export function Sidebar() {
  const { state } = useAuth();
  const { tenant } = useTenant();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const role = state.user?.role;
  const perms = state.user?.permissions || [];
  const hasAll = perms.includes("all") || role === "superadmin";

  // Build flat item list from tenant sidebar config, filtering disabled screens
  const allItems = tenant.sidebar.groups.flatMap((group) =>
    group.items
      .filter((id) => tenant.screens[id]?.enabled !== false)
      .map((id) => ({
        id,
        label: tenant.screens[id]?.label ?? id,
        icon: ICON_MAP[id] ?? Home,
        group: group.id,
      })),
  );

  const canAccess = (item: (typeof allItems)[0]) => {
    // 1. Check dynamic module_permission from backend
    const userPermissions = (state.user as any)?.module_permission;
    if (Array.isArray(userPermissions)) {
      if (item.group === "SUPER_ADMIN") return role === "superadmin";

      const allowedModulesForScreen = PERMISSION_MAP[item.id];
      if (allowedModulesForScreen) {
        return allowedModulesForScreen.some(p =>
          userPermissions.includes(p.toUpperCase())
        );
      }
      return true;
    }

    // 2. Fallback role checks (only used if module_permission is NOT provided)
    if (item.group === "SUPER_ADMIN") return role === "superadmin";
    if (item.id === "patient-queue") return role === "doctor" || hasAll;
    if (item.group === "admin") {
      if (hasAll) return true;
      if (role === "receptionist")
        return ["billing", "consent"].includes(item.id);
      return false;
    }
    return true;
  };

  const visible = allItems.filter(canAccess);
  // Only render groups that have at least one visible item
  const visibleGroups = tenant.sidebar.groups.filter((g) =>
    visible.some((i) => i.group === g.id),
  );

  // Determine active group color from current URL
  const currentId = location.pathname.replace(/^\//, "") || "dashboard";
  const activeItem = allItems.find((i) => i.id === currentId);
  const activeGroup = activeItem?.group || "main";

  const getThemeColor = (group: string) => {
    switch (group) {
      case "clinical":
        return "emerald";
      case "admin":
        return "amber";
      case "superadmin":
        return "violet";
      default:
        return tenant.branding.primaryColor || "blue";
    }
  };

  const themeColor = getThemeColor(activeGroup);
  const themeClassesMap: Record<string, string> = {
    blue: "bg-primary text-primary",
    emerald: "bg-emerald-600 text-emerald-600",
    amber: "bg-amber-500 text-amber-500",
    violet: "bg-violet-600 text-violet-600",
    rose: "bg-rose-600 text-rose-600",
  };

  const themeClasses = themeClassesMap[themeColor] || themeClassesMap.blue;

  return (
    <aside
      className={`
      relative hidden md:flex md:flex-col flex-shrink-0
      ${collapsed ? "md:w-[60px]" : "md:w-[240px]"}
      bg-card border-r border-border h-screen sticky top-0
      transition-all duration-300 overflow-visible
    `}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[68px] -right-3.5 z-50 w-7 h-7 flex items-center justify-center bg-card border border-border rounded-full shadow-md hover:bg-muted transition-all group"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Logo - Compact */}
      <div className="flex items-center h-16 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-colors duration-500 ${themeClasses.split(" ")[0]}`}
          >
            <Stethoscope className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-foreground text-[14px] block leading-none tracking-tight">
                {tenant.branding.clinicName}
              </span>
              <span
                className={`text-[8px] font-bold uppercase tracking-widest mt-1 block transition-colors duration-500 ${themeClasses.split(" ")[1]}`}
              >
                {visibleGroups.find((g) => g.id === activeGroup)?.label ??
                  activeGroup}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav - Scrollable */}
      <nav className="flex-1 flex flex-col py-4 px-2 space-y-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {visibleGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {!collapsed && (
              <p
                className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 mb-1 transition-colors duration-500
                ${
                  activeGroup === group.id
                    ? group.id === "clinical"
                      ? "text-emerald-600"
                      : group.id === "admin"
                        ? "text-amber-500"
                        : group.id === "superadmin"
                          ? "text-violet-600"
                          : "text-primary"
                    : "text-muted-foreground"
                }
              `}
              >
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {visible
                .filter((i) => i.group === group.id)
                .map((item) => {
                  const Icon = item.icon;

                  const getActiveStyle = (isActive: boolean) => {
                    switch (group.id) {
                      case "clinical":
                        return isActive
                          ? "bg-emerald-600 text-white shadow-lg scale-[1.02]"
                          : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 hover:scale-[1.02]";
                      case "admin":
                        return isActive
                          ? "bg-amber-500 text-white shadow-lg scale-[1.02]"
                          : "text-muted-foreground hover:bg-amber-50 hover:text-amber-700 hover:scale-[1.02]";
                      case "superadmin":
                        return isActive
                          ? "bg-violet-600 text-white shadow-lg scale-[1.02]"
                          : "text-muted-foreground hover:bg-violet-50 hover:text-violet-700 hover:scale-[1.02]";
                      default:
                        return isActive
                          ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                          : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-[1.02]";
                    }
                  };

                  return (
                    <NavLink
                      key={item.id}
                      to={`/${item.id}`}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                      transition-all duration-200 group border border-transparent
                      ${getActiveStyle(isActive)}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? "scale-110" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"}`}
                          />
                          {!collapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
