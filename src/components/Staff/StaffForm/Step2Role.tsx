import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  Stethoscope,
  User,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Package,
  BarChart3,
} from "lucide-react";

import { Badge } from "@/components/ui";
import { useRolesQuery } from "@/hooks/roles/useRolesQuery";

interface Step2Props {
  formData: any;
  onChange: (role: string) => void;
  onPermissionChange: (id: string, checked: boolean) => void;
  errors?: any;
}

const ROLES = [
  {
    value: "super_admin",
    label: "Super Admin",
    description: "Full system access & administration",
    icon: Shield,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    value: "doctor",
    label: "Doctor",
    description: "Clinical care & treatment management",
    icon: Stethoscope,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },

  {
    value: "receptionist",
    label: "Receptionist",
    description: "Front desk, booking & billing",
    icon: User,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },

  {
    value: "staff",
    label: "Staff",
    description: "Operational & support access",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const PERMISSIONS = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "View dashboard overview",
    icon: BarChart3,
  },

  {
    id: "appointments",
    label: "Appointments",
    description: "Manage appointments & schedules",
    icon: Calendar,
  },

  {
    id: "patients",
    label: "Patients",
    description: "Access patient profiles",
    icon: User,
  },

  {
    id: "consultation",
    label: "Consultation",
    description: "Clinical consultation access",
    icon: Stethoscope,
  },

  {
    id: "treatments",
    label: "Treatments",
    description: "Create & manage treatments",
    icon: Stethoscope,
  },

  {
    id: "medical_records",
    label: "Medical Records",
    description: "Access EMR & records",
    icon: FileText,
  },

  {
    id: "consent_forms",
    label: "Consent Forms",
    description: "Manage patient consent forms",
    icon: FileText,
  },

  {
    id: "billing",
    label: "Billing",
    description: "Handle invoices & payments",
    icon: DollarSign,
  },

  {
    id: "inventory",
    label: "Inventory",
    description: "Track clinic supplies",
    icon: Package,
  },

  {
    id: "reports",
    label: "Reports",
    description: "View analytics & reports",
    icon: BarChart3,
  },

  {
    id: "staff_management",
    label: "Staff Management",
    description: "Manage clinic staff",
    icon: Users,
  },
];

export function Step2Role({
  formData,
  onChange,
  onPermissionChange,
  errors,
}: Step2Props) {
  const { data: apiRoles, isLoading } = useRolesQuery();

  let rawRoles: any[] | null = null;
  if (Array.isArray(apiRoles)) {
    rawRoles = apiRoles;
  } else if (apiRoles && Array.isArray((apiRoles as any).roles)) {
    rawRoles = (apiRoles as any).roles;
  } else if (apiRoles && (apiRoles as any).data && Array.isArray((apiRoles as any).data.roles)) {
    rawRoles = (apiRoles as any).data.roles;
  } else if (apiRoles && Array.isArray((apiRoles as any).data)) {
    rawRoles = (apiRoles as any).data;
  }

  const rolesList = rawRoles
    ? rawRoles.map((r: any) => {
        const val = r.name.toLowerCase();
        const existing = ROLES.find((x) => x.value === val);
        return (
          existing || {
            value: val,
            label: r.name,
            description: "Custom role access",
            icon: Users,
            color: "text-gray-600",
            bg: "bg-gray-50",
          }
        );
      })
    : ROLES;

  return (
    <div className="space-y-8 py-4">
      <div className="text-center">
        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
          Access Control
        </h3>

        <p className="text-xs text-muted-foreground font-medium">
          Define user role and permission access
        </p>
        {errors?.role && (
          <p className="text-destructive text-xs mt-2 font-bold">{errors.role.message}</p>
        )}
      </div>

      {/* ROLE SELECTION */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isLoading ? (
          <div className="col-span-2 py-8 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold">Loading Roles...</p>
          </div>
        ) : (
          rolesList.map((role) => {
            const Icon = role.icon;

          const isActive = formData.role === role.value;

          return (
            <Button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`p-4 border-2 rounded-2xl text-left transition-all relative overflow-hidden group ${isActive
                ? "border-primary bg-card shadow-xl shadow-primary/5"
                : "border-border bg-card hover:border-muted-foreground/20"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-xl ${role.bg} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Icon className={`w-5 h-5 ${role.color}`} />
                </div>

                <h4 className="font-black text-foreground uppercase text-xs tracking-wider">
                  {role.label}
                </h4>
              </div>

              <p className="text-[11px] text-muted-foreground font-medium leading-tight">
                {role.description}
              </p>

              {isActive && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </Button>
          );
        }))}
      </div>

      {/* PERMISSIONS */}

      {formData.role !== "super_admin" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
              Module Permissions
            </h4>

            <Badge variant="gray" className="text-[9px]">
              {formData.permissions.length} Enabled
            </Badge>
          </div>
          {errors?.permissions && (
            <p className="text-destructive text-xs mt-1 font-bold">{errors.permissions.message}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERMISSIONS.map((permission) => (
              <Label
                key={permission.id}
                className={`flex items-start gap-3 p-3 border rounded-2xl cursor-pointer transition-colors ${formData.permissions.includes(permission.id)
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
              >
                <Input
                  type="checkbox"
                  checked={formData.permissions.includes(permission.id)}
                  onChange={(e) =>
                    onPermissionChange(
                      permission.id,
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/20"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground">
                      {permission.label}
                    </p>
                  </div>

                  <p className="text-[10px] text-muted-foreground font-medium">
                    {permission.description}
                  </p>
                </div>
              </Label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
