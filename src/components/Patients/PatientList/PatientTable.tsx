import { Eye, Edit, Trash2, Users } from "lucide-react";
import { Badge, Button, DataTable } from "@/components/ui";
import { Patient } from "@/types";

interface PatientTableProps {
  patients: Patient[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onPrintBarcode: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusVariant = (status: string): any => {
    switch (status) {
      case "active":   return "green";
      case "inactive": return "gray";
      case "new":      return "blue";
      default:         return "gray";
    }
  };

  const columns = [
    {
      key: "patient",
      header: "Patient",
      render: (patient: Patient) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-primary/5 group-hover:scale-110 transition-transform">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">{patient.name}</div>
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
          <div className="text-sm font-medium text-foreground">{patient.phone}</div>
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
          className={`text-sm font-black ${
            patient.outstandingBalance ? "text-amber-600" : "text-emerald-600"
          }`}
        >
          ₹{(patient.outstandingBalance || 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (patient: Patient) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/10"
            onClick={() => onView(patient.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-600 hover:bg-amber-50"
            onClick={() => onEdit(patient.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(patient.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
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
