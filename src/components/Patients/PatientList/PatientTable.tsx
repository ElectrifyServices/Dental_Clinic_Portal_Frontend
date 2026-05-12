import { Eye, Edit, Trash2 } from "lucide-react";
import { ContentCard, Badge, Button } from "@/components/ui";
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
      case "active":
        return "green";
      case "inactive":
        return "gray";
      case "new":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <ContentCard bodyClassName="p-0 overflow-hidden" className="rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                Patient
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                Contact
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                Last Visit
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                Balance
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-muted/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs shadow-sm ring-4 ring-primary/5 group-hover:scale-110 transition-transform">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm">
                        {patient.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter">
                        #{patient.id.slice(-6).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">
                    {patient.phone}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {patient.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={getStatusVariant(patient.status)}
                    className="text-[10px] font-black uppercase px-2 h-5"
                  >
                    {patient.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">
                    {patient.lastVisit || "No visits"}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    {patient.totalVisits || 0} visits total
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`text-sm font-black ${patient.outstandingBalance ? "text-amber-600" : "text-emerald-600"}`}
                  >
                    ₹{(patient.outstandingBalance || 0).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ContentCard>
  );
};
