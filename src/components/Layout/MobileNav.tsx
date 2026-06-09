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
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getParsedPermissions } from "../../utils/permission";

const PRIMARY_ITEMS = [
  { id: "dashboard", label: "Home", icon: Home, roles: ["all"] },
  { id: "appointments", label: "Calendar", icon: Calendar, roles: ["all"] },
  { id: "patients", label: "Patients", icon: Users, roles: ["all"] },
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
    id: "inventory",
    label: "Inventory",
    icon: Package,
    roles: ["admin", "superadmin"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "superadmin"],
  },
  {
    id: "staff",
    label: "Staff",
    icon: UserCheck,
    roles: ["admin", "superadmin"],
  },
  {
    id: "profit-sharing",
    label: "Profit",
    icon: DollarSign,
    roles: ["admin", "superadmin"],
  },
  {
    id: "corporate-plans",
    label: "Corporate",
    icon: Building2,
    roles: ["admin", "superadmin"],
  },
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
  reports: ["ANALYTICS"],
  staff: ["STAFF"],
  "profit-sharing": ["PROFIT_SHARING"],
  "corporate-plans": ["CORPORATE_PLANS"],
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
          return allowedModulesForScreen.some((p) =>
            rawModulePerms.some((up) => up.toUpperCase() === p.toUpperCase())
          );
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
            className="absolute bottom-16 left-0 right-0 bg-card border-t border-border rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 border-b border-border/50 pb-3">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">All Modules</h4>
              <Button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {visibleMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={`/${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-all text-center min-w-0"
                  >
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-foreground truncate w-full">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-40">
        <div className="flex justify-around items-center">
          {visiblePrimary.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={`/${item.id}`}
                className={({ isActive }) =>
                  `flex flex-col items-center px-3 py-1.5 rounded-xl min-w-0 transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium truncate">
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center px-3 py-1.5 rounded-xl min-w-0 transition-colors outline-none ${
              menuOpen
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium truncate">Menu</span>
          </Button>
        </div>
      </div>
    </>
  );
}
