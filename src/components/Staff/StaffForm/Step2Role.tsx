import {
  Shield,
  Stethoscope,
  User,
  Calendar,
  FileText,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui";

interface Step2Props {
  formData: any;
  onChange: (role: string) => void;
  onPermissionChange: (id: string, checked: boolean) => void;
}

const ROLES = [
  {
    value: "admin",
    label: "Admin",
    description: "Full system control & financials",
    icon: Shield,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    value: "doctor",
    label: "Doctor",
    description: "Clinical care & treatments",
    icon: Stethoscope,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    value: "receptionist",
    label: "Receptionist",
    description: "Front desk & bookings",
    icon: User,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    value: "assistant",
    label: "Assistant",
    description: "Clinical support & lab",
    icon: User,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const PERMISSIONS = [
  {
    id: "appointments",
    label: "Appointments",
    description: "Manage bookings",
    icon: Calendar,
  },
  {
    id: "patients",
    label: "Patients",
    description: "View demographics",
    icon: User,
  },
  {
    id: "treatments",
    label: "Treatments",
    description: "Create plans",
    icon: Stethoscope,
  },
  { id: "emr", label: "EMR", description: "Access records", icon: FileText },
  {
    id: "billing",
    label: "Billing",
    description: "Handle payments",
    icon: DollarSign,
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Track supplies",
    icon: FileText,
  },
  {
    id: "reports",
    label: "Reports",
    description: "View analytics",
    icon: FileText,
  },
];

export function Step2Role({
  formData,
  onChange,
  onPermissionChange,
}: Step2Props) {
  return (
    <div className="space-y-8 py-4">
      <div className="text-center">
        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
          Access Control
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          Define organizational role and modular permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isActive = formData.role === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`p-4 border-2 rounded-2xl text-left transition-all relative overflow-hidden group ${isActive ? "border-primary bg-card shadow-xl shadow-primary/5" : "border-border bg-card hover:border-muted-foreground/20"}`}
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
            </button>
          );
        })}
      </div>

      {formData.role !== "admin" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
              Granular Permissions
            </h4>
            <Badge variant="gray" className="text-[9px]">
              {formData.permissions.length} Enabled
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERMISSIONS.map((p) => (
              <label
                key={p.id}
                className={`flex items-start gap-3 p-3 border rounded-2xl cursor-pointer transition-colors ${formData.permissions.includes(p.id) ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"}`}
              >
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(p.id)}
                  onChange={(e) => onPermissionChange(p.id, e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/20"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground">
                      {p.label}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {p.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
