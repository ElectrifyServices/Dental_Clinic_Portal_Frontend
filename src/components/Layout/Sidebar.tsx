import { Button } from "@/components/ui/Button";
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../logo.png";
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
  IndianRupee,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getParsedPermissions } from "../../utils/permission";

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
  "lab-work": FlaskConical,
  reports: BarChart3,
  staff: UserCheck,
  "profit-sharing": IndianRupee,
  membership: Building2,
};

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
  reports: ["ANALYTICS", "REPORTS"],
  staff: ["STAFF", "STAFF_MANAGEMENT"],
  "profit-sharing": ["PROFIT_SHARING"],
  membership: ["CORPORATE_PLANS", "MEMBERSHIP"],
  "lab-work": ["LAB_WORK"],
};

export function Sidebar() {
  const { state } = useAuth();
  const { tenant } = useTenant();
  const { themeData } = useTheme();
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();
  const role = state.user?.role;
  const perms = state.user?.permissions || [];
  const rawModulePerms = getParsedPermissions(state.user);
  const hasAll =
    perms.includes("all") ||
    role === "superadmin" ||
    rawModulePerms.some((p) => p.toUpperCase() === "ALL");

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
    if (hasAll) return true;
    if (Array.isArray(rawModulePerms) && rawModulePerms.length > 0) {
      const allowed = PERMISSION_MAP[item.id];
      if (allowed) {
        let hasAccess = allowed.some((p) =>
          rawModulePerms.some((up) => up.toUpperCase() === p.toUpperCase()),
        );
        // Fallback for lab-work module visibility for admin, doctor, and staff roles
        if (!hasAccess && item.id === "lab-work") {
          const userRole = (state.user?.role?.name || state.user?.role || "").toLowerCase();
          if (["admin", "superadmin", "super_admin", "doctor", "staff"].some(r => userRole.includes(r))) {
            hasAccess = true;
          }
        }
        return hasAccess;
      }
      return true;
    }
    if (item.group === "superadmin") return role === "superadmin";
    if (item.id === "patient-queue") return role === "doctor";
    if (item.group === "admin") {
      if (role === "receptionist")
        return ["billing", "consent"].includes(item.id);
      return false;
    }
    return true;
  };
  const visible = allItems.filter(canAccess);
  const visibleGroups = tenant.sidebar.groups.filter((g) =>
    visible.some((i) => i.group === g.id),
  );

  const currentId = location.pathname.replace(/^\//, "") || "dashboard";

  return (
    <aside
      className={[
        "relative hidden md:flex md:flex-col flex-shrink-0 z-30",
        collapsed ? "md:w-[68px]" : "md:w-[260px]",
        "bg-white border-r border-border/60 shadow-[4px_0_24px_rgba(15,23,42,0.06)] h-screen sticky top-0",
        "transition-all duration-300 overflow-visible",
      ].join(" ")}
    >
      {/* Colorful top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-indigo-500" />

      {/* ── Collapse toggle ─────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[72px] -right-3.5 z-50 w-7 h-7 flex items-center justify-center
                   bg-white border border-border rounded-full shadow-md
                   hover:bg-primary/5 hover:border-primary/30 text-slate-400 hover:text-primary
                   transition-all duration-150"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* ── Logo / Brand ────────────────────────────────────────── */}
      <div className="flex items-center h-16 px-4 border-b border-border/60 flex-shrink-0 group/logo cursor-pointer mt-[3px]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white border border-border/60 flex items-center justify-center flex-shrink-0 shadow-md shadow-slate-200 transition-transform duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-3 overflow-hidden p-0.5">
            <img
              src={themeData?.theme?.logo_url || logo}
              alt="Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-black text-slate-800 text-[14px] block leading-tight tracking-tight truncate">
                {themeData?.branding?.clinic_name || tenant.branding.clinicName}
              </span>
              <span className="text-[11px] font-semibold text-primary block mt-0.5 truncate max-w-[150px]">
                {themeData?.theme?.tagline || "Dental Management"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className={collapsed ? "px-2 space-y-4" : "px-3 space-y-5"}>
          {visibleGroups.map((group) => {
            const groupItems = visible.filter((i) => i.group === group.id);
            return (
              <div key={group.id}>
                {/* Section header */}
                {!collapsed && (
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-primary/60 px-2 mb-1.5">
                    {group.label}
                  </p>
                )}

                {/* Nav items */}
                <div className="space-y-0.5">
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentId === item.id;

                    return (
                      <Button
                        key={item.id}
                        asChild
                        variant="ghost"
                        className={[
                          "w-full justify-start rounded-xl text-[13px] font-medium outline-none select-none relative overflow-hidden group/btn border",
                          collapsed
                            ? "justify-center px-0 h-10 w-10 mx-auto"
                            : "h-10 px-3 gap-3",
                          isActive
                            ? "text-primary font-bold bg-primary/[0.03] border-primary/40"
                            : "text-slate-600 hover:text-primary hover:bg-slate-50 border-slate-200/50",
                          // Vertical border mask
                          "before:content-[''] before:absolute before:top-[5px] before:left-[-1px] before:w-[calc(100%+2px)] before:h-[calc(100%-10px)] before:bg-white before:transition-all before:duration-300 before:ease-in-out before:z-[1]",
                          isActive
                            ? "before:scale-y-0"
                            : "before:scale-y-100 group-hover/btn:before:scale-y-0",
                          // Horizontal border mask
                          "after:content-[''] after:absolute after:left-[5px] after:top-[-1px] after:h-[calc(100%+2px)] after:w-[calc(100%-10px)] after:bg-white after:transition-all after:duration-300 after:ease-in-out after:z-[1]",
                          isActive
                            ? "after:scale-x-0"
                            : "after:scale-x-100 group-hover/btn:after:scale-x-0",
                        ].join(" ")}
                      >
                        <NavLink
                          to={`/${item.id}`}
                          title={collapsed ? item.label : undefined}
                        >
                          {/* Icon wrapper */}
                          <div
                            className={[
                              "flex-shrink-0 flex items-center justify-center transition-all duration-150 z-10",
                              !collapsed ? "w-7 h-7 rounded-lg" : "",
                              isActive && !collapsed
                                ? "bg-primary/15"
                                : !isActive && !collapsed
                                  ? "bg-slate-100 group-hover/btn:bg-primary/10"
                                  : "",
                            ].join(" ")}
                          >
                            <Icon
                              className={[
                                "transition-transform duration-150 group-hover/btn:scale-105 z-10",
                                collapsed ? "w-5 h-5" : "w-3.5 h-3.5",
                                isActive
                                  ? "text-primary"
                                  : "text-slate-500 group-hover/btn:text-primary",
                              ].join(" ")}
                            />
                          </div>

                          {!collapsed && (
                            <span className="truncate z-10">{item.label}</span>
                          )}

                          {/* Active bar in collapsed mode */}
                          {isActive && collapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full z-10" />
                          )}
                        </NavLink>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
      {/* This code will be useful in the future, so for now it's been commented out. */}
      {/* ── Bottom user chip ────────────────────────────────────── */}
      {/* {!collapsed ? (
        <div className="px-3 py-3 border-t border-border/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm shadow-primary/20">
              {state.user?.name?.[0] ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {state.user?.name}
              </p>
              <p className="text-[10px] text-slate-500 capitalize truncate">
                {state.user?.role}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-2 py-3 border-t border-border/60 flex-shrink-0 flex justify-center">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-xs font-black shadow-sm shadow-primary/20">
            {state.user?.name?.[0] ?? "U"}
          </div>
        </div>
      )} */}
    </aside>
  );
}
