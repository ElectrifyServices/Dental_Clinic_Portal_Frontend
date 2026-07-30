import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  Users,
  MoreVertical,
  UserPlus,
  Download,
  QrCode,
  UserCheck,
  PowerOff
} from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui";
import { Patient } from "@/types";
import { toTitleCase } from "@/utils/stringUtils";
import { getFileUrl } from "../../../services/apiClient";
import { formatPhoneWithCountryCode } from "@/utils/phoneUtils";

interface PatientTableProps {
  patients: Patient[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onPrintBarcode: (patient: Patient) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onToggleCategory: (id: string, currentCategory: string) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onView,
  onEdit,
  onDelete,
  onExport,
  onPrintBarcode,
  onToggleStatus,
  onToggleCategory,
}) => {
  const getStatusVariant = (status: string): any => {
    switch (status) {
      case "active": return "green";
      case "inactive": return "gray";
      case "new": return "blue";
      default: return "gray";
    }
  };

  const columns = [
    {
      key: "patient",
      header: "Patient",
      render: (patient: Patient) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-primary/5 group-hover:scale-110 transition-transform overflow-hidden">
            {patient.profile_picture_url || patient.avatar ? (
              <img
                src={patient.profile_picture_url ? getFileUrl(patient.profile_picture_url) : patient.avatar}
                alt={toTitleCase(patient.name)}
                className="w-full h-full object-cover"
              />
            ) : (
              patient.name ? patient.name.charAt(0).toUpperCase() : "?"
            )}
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">{toTitleCase(patient.name)}</div>
            <div className="text-[10px] text-blue-600 font-bold font-mono tracking-tighter">
              {patient.patient_code || patient.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (patient: Patient) => (
        <>
          <div className="text-sm font-medium text-foreground">{formatPhoneWithCountryCode(patient.phone, (patient as any).country_code)}</div>
          <div className="text-[11px] text-muted-foreground">{patient.email}</div>
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (patient: Patient) => (
        <Badge
          variant={getStatusVariant(patient.status)}
          className="text-[10px] font-black uppercase px-2 h-5"
        >
          {patient.status}
        </Badge>
      ),
    },
    {
      key: "lastVisit",
      header: "Last Visit",
      render: (patient: Patient) => (
        <>
          <div className="text-sm font-medium text-foreground">
            {patient.lastVisit || "No visits"}
          </div>
          <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            {patient.totalVisits || 0} visits total
          </div>
        </>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      render: (patient: Patient) => (
        <div
          className={`text-sm font-black ${patient.outstandingBalance ? "text-amber-600" : "text-emerald-600"
            }`}
        >
          ₹{(patient.outstandingBalance ?? (patient as any).total_pending_balance ?? (patient as any).totalPendingBalance ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (patient: Patient) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl bg-card border border-border shadow-lg">
              <DropdownMenuItem
                onClick={() => onView(patient.id)}
                className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
              >
                <Eye className="w-4 h-4" /> View Details
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onEdit(patient.id)}
                className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
              >
                <Edit className="w-4 h-4" /> Edit Info
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onToggleCategory(patient.id, patient.category || "regular")}
                className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Person
              </DropdownMenuItem>

              {onExport && (
                <DropdownMenuItem
                  onClick={() => onExport(patient.id)}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Export Report
                </DropdownMenuItem>
              )}

              {/* {onPrintBarcode && (
                <DropdownMenuItem
                  onClick={() => onPrintBarcode(patient)}
                  className="px-3.5 py-2.5 text-xs font-bold hover:bg-muted rounded-xl flex items-center gap-3 text-muted-foreground cursor-pointer"
                >
                  <QrCode className="w-4 h-4" /> Print Barcode
                </DropdownMenuItem>
              )} */}

              <DropdownMenuItem
                onClick={() => onToggleStatus(patient.id, patient.status || "active")}
                className={`px-3.5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-3 cursor-pointer ${patient.status === "inactive"
                    ? "text-emerald-600 hover:bg-emerald-50/50"
                    : "text-orange-600 hover:bg-orange-50/50"
                  }`}
              >
                {patient.status === "inactive" ? (
                  <>
                    <UserCheck className="w-4 h-4" /> Activate
                  </>
                ) : (
                  <>
                    <PowerOff className="w-4 h-4" /> Deactivate
                  </>
                )}
              </DropdownMenuItem>

              {/* <DropdownMenuItem
                onClick={() => onDelete(patient.id)}
                className="px-3.5 py-2.5 text-xs font-bold hover:bg-destructive/10 rounded-xl flex items-center gap-3 text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Patient
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={patients}
      rowKey={(p) => p.id}
      emptyIcon={<Users className="w-6 h-6" />}
      emptyTitle="No patients found"
      emptySubtitle="Add a new patient to get started"
    />
  );
};
