import React from 'react';
import { User, Eye, Edit, Trash2, MoreVertical, QrCode, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'new';
  lastVisit?: string;
  totalVisits?: number;
  outstandingBalance?: number;
  category?: string;
}

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
  onExport,
  onPrintBarcode
}) => {
  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'new': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Patient</th>
              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Contact</th>
              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Last Visit</th>
              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Balance</th>
              <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center text-primary font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{patient.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{patient.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-muted-foreground">{patient.phone}</div>
                  <div className="text-xs text-muted-foreground">{patient.email}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusVariant(patient.status)} className="text-[10px] uppercase">
                    {patient.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="text-muted-foreground">{patient.lastVisit || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{patient.totalVisits || 0} visits</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`font-bold ${patient.outstandingBalance ? 'text-amber-600' : 'text-emerald-600'}`}>
                    ₹{(patient.outstandingBalance || 0).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => onView(patient.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => onEdit(patient.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(patient.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
