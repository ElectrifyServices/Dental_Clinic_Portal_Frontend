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
  DollarSign,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
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
  reports: BarChart3,
  staff: UserCheck,
  "profit-sharing": DollarSign,
  "corporate-plans": Building2,
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
        return allowed.some((p) =>
          rawModulePerms.some((up) => up.toUpperCase() === p.toUpperCase()),
        );
      }
      return true;
    }
    if (item.group === "superadmin") return role === "superadmin";
    if (item.id === "patient-queue") return role === "doctor";
    if (item.group === "admin") {
      if (role === "receptionist") return ["billing", "consent"].includes(item.id);
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
        "bg-card border-r border-border/60 shadow-[4px_0_24px_rgba(15,23,42,0.015)] h-screen sticky top-0",
        "transition-all duration-300 overflow-visible",
      ].join(" ")}
    >
      {/* ── Collapse toggle ─────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[72px] -right-3.5 z-50 w-7 h-7 flex items-center justify-center
                   bg-card border border-border rounded-full shadow-sm
                   hover:bg-muted text-muted-foreground hover:text-foreground
                   transition-all duration-150"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* ── Logo / Brand ────────────────────────────────────────── */}
      <div className="flex items-center h-16 px-4 border-b border-border/60 flex-shrink-0 group/logo cursor-pointer">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-white border border-border/60 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-3 overflow-hidden p-0.5">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-foreground text-[14px] block leading-tight tracking-tight truncate group-hover/logo:text-primary transition-colors">
                {tenant.branding.clinicName}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground block mt-0.5">
                Dental Management
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className={collapsed ? "px-2 space-y-4" : "px-3 space-y-6"}>
          {visibleGroups.map((group) => {
            const groupItems = visible.filter((i) => i.group === group.id);
            return (
              <div key={group.id}>
                {/* Section header */}
                {!collapsed && (
                  <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground px-2 mb-2">
                    {group.label}
                  </p>
                )}

                {/* Nav items */}
                <div className="space-y-0.5">
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentId === item.id;

                    return (
                      <NavLink
                        key={item.id}
                        to={`/${item.id}`}
                        title={collapsed ? item.label : undefined}
                        className={[
                          // base layout
                          "relative overflow-hidden w-full flex items-center rounded-md group",
                          "text-[13px] font-medium transition-all duration-150 outline-none",
                          collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                          // active / inactive
                          isActive
                            ? "text-primary font-bold z-10"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground z-10",
                        ].join(" ")}
                      >
                        {/* Background pill indicator — animated */}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}

                        {/* Right indicator — animated */}
                        {isActive && !collapsed && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute right-0 top-1.5 bottom-1.5 w-[4px] bg-primary rounded-l-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}

                        <Icon
                          className={[
                            "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                            collapsed ? "w-5 h-5" : "w-4 h-4",
                            isActive ? "" : "opacity-70",
                          ].join(" ")}
                        />
                        {!collapsed && (
                          <span className="truncate transition-transform duration-200 group-hover:translate-x-0.5">
                            {item.label}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Bottom user hint (expanded only) ────────────────────── */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md bg-muted/50">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {state.user?.name?.[0] ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">
                {state.user?.name}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize truncate">
                {state.user?.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
