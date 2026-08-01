import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  CreditCard,
  Activity,
  Stethoscope,
  FileText,
  Shield,
  Package,
  BarChart3,
  UserCheck,
  DollarSign,
  Building2,
  Menu,
  X,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getParsedPermissions } from "../../utils/permission";

const PRIMARY_ITEMS = [
  // Temporarily hidden dashboard as per request
  // { id: "dashboard", label: "Home", icon: Home, roles: ["all"] },
  { id: "patients", label: "Patients", icon: Users, roles: ["all"] },
  { id: "appointments", label: "Calendar", icon: Calendar, roles: ["all"] },
  {
    id: "membership",
    label: "Membership",
    icon: Building2,
    roles: ["admin", "superadmin"],
  },
  {
    id: "patient-queue",
    label: "Queue",
    icon: Activity,
    roles: ["doctor", "admin", "superadmin"],
  },
];

const MENU_ITEMS = [
  {
    id: "treatments",
    label: "Treatments",
    icon: Stethoscope,
    roles: ["doctor", "admin", "superadmin"],
  },
  // Temporarily hidden — matches Sidebar hidden list (emr, consent, reports, profit-sharing)
  {
    id: "emr",
    label: "EMR",
    icon: FileText,
    roles: ["doctor", "admin", "superadmin"],
  },
  {
    id: "consent",
    label: "Consent",
    icon: Shield,
    roles: ["doctor", "admin", "superadmin", "receptionist"],
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    roles: ["admin", "superadmin", "receptionist"],
  },
  {
    id: "staff",
    label: "Staff",
    icon: UserCheck,
    roles: ["admin", "superadmin"],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    roles: ["admin", "superadmin"],
  },
  {
    id: "lab-work",
    label: "Lab Work",
    icon: FlaskConical,
    roles: ["doctor", "admin", "superadmin"],
  },
  // Temporarily hidden — matches Sidebar hidden list (emr, consent, reports, profit-sharing)
  // {
  //   id: "reports",
  //   label: "Reports",
  //   icon: BarChart3,
  //   roles: ["admin", "superadmin"],
  // },
  // Temporarily hidden — matches Sidebar hidden list (emr, consent, reports, profit-sharing)
  // {
  //   id: "profit-sharing",
  //   label: "Profit",
  //   icon: DollarSign,
  //   roles: ["admin", "superadmin"],
  // },
  // Commented out from drawer menu because it is now in bottom primary tabs
  // {
  //   id: "membership",
  //   label: "Membership",
  //   icon: Building2,
  //   roles: ["admin", "superadmin"],
  // },
];

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

export function MobileNav() {
  const { state } = useAuth();
  const role = state.user?.role || "";
  const [menuOpen, setMenuOpen] = useState(false);

  const filterVisible = (items: typeof PRIMARY_ITEMS) => {
    return items.filter((item) => {
      const rawModulePerms = getParsedPermissions(state.user);
      const hasAll =
        role === "superadmin" ||
        rawModulePerms.some((p) => p.toUpperCase() === "ALL");

      if (hasAll) return true;

      if (rawModulePerms.length > 0) {
        const allowedModulesForScreen = PERMISSION_MAP[item.id];
        if (allowedModulesForScreen) {
          let hasAccess = allowedModulesForScreen.some((p) =>
            rawModulePerms.some((up) => up.toUpperCase() === p.toUpperCase())
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

      return item.roles.includes("all") || item.roles.includes(role);
    });
  };

  const visiblePrimary = filterVisible(PRIMARY_ITEMS);
  const visibleMenu = filterVisible(MENU_ITEMS);

  return (
    <>
      {/* Slide-up menu drawer */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-all duration-300 animate-in fade-in"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white border-t border-border rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5 border-b border-border/50 pb-3">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">All APPS</h4>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMenuOpen(false)}
                className="rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {visibleMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={`/${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center min-w-0 ${
                        isActive
                          ? "border-blue-200 bg-blue-50"
                          : "border-border bg-slate-50 hover:border-blue-200 hover:bg-blue-50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                          isActive
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-400/30"
                            : "bg-slate-200"
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                        </div>
                        <span className={`text-[10px] font-bold truncate w-full text-center ${isActive ? "text-blue-600" : "text-slate-600"}`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 py-2 z-40 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]">
        <div className="flex justify-around items-center">
          {visiblePrimary.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={`/${item.id}`}
                className={({ isActive }) =>
                  `flex flex-col items-center px-3 py-1.5 rounded-xl min-w-0 transition-all ${isActive
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-0.5 transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-400/30"
                        : "bg-transparent"
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                    </div>
                    <span className="text-[10px] font-bold truncate">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

          <Button
            variant="ghost"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col h-auto items-center px-3 py-1.5 rounded-xl min-w-0 gap-0 hover:bg-transparent ${
              menuOpen ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-0.5 transition-all ${
              menuOpen
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-400/30"
                : "bg-transparent"
            }`}>
              <Menu className={`w-4 h-4 ${menuOpen ? "text-white" : ""}`} />
            </div>
            <span className="text-[10px] font-bold">Menu</span>
          </Button>
        </div>
      </div>
    </>
  );
}
